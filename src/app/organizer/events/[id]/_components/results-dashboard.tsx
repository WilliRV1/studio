'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, writeBatch, serverTimestamp, getDocs } from "firebase/firestore";
import type { Competition, Registration, Athlete, Workout, Score, LeaderboardEntry } from "@/lib/types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { set } from 'react-hook-form';

interface ResultsDashboardProps {
  competition: Competition;
}

const POINTS = [100, 95, 90, 85, 80, 75, 72, 69, 66, 63, 60, 58, 56, 54, 52, 50, 48, 46, 44, 42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0];
const getPoints = (rank: number) => POINTS[rank - 1] ?? 0;

export function ResultsDashboard({ competition }: ResultsDashboardProps) {
  const [selectedWodId, setSelectedWodId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firestore = useFirestore();
  const { toast } = useToast();

  const registrationsRef = useMemoFirebase(() => {
    if (!firestore || !competition.id) return null;
    return query(
        collection(firestore, 'registrations'), 
        where('competitionId', '==', competition.id),
        where('paymentStatus', '==', 'approved')
    );
  }, [firestore, competition.id]);
  const { data: registrations, isLoading: isLoadingRegistrations } = useCollection<Registration>(registrationsRef);

  const athletesRef = useMemoFirebase(() => {
    if(!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: athletes, isLoading: isLoadingAthletes } = useCollection<Athlete>(athletesRef);

  const handleScoreChange = (athleteId: string, value: string) => {
    const numericValue = Number(value);
    if (!isNaN(numericValue)) {
        setScores(prev => ({...prev, [athleteId]: numericValue}));
    }
  };

  const calculateAndSaveScores = async () => {
    if (!selectedWodId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, selecciona un WOD.' });
        return;
    }

    const wod = competition.workouts.find(w => w.id === selectedWodId);
    if (!wod) {
        toast({ variant: 'destructive', title: 'Error', description: 'WOD no encontrado.' });
        return;
    }

    setIsSubmitting(true);

    try {
        const batch = writeBatch(firestore);
        const scoresRef = collection(firestore, 'competitions', competition.id, 'scores');

        const submittedScores = Object.entries(scores)
            .map(([athleteId, result]) => ({ athleteId, result }))
            .filter(score => registrations?.some(r => r.athleteId === score.athleteId));
        
        const isTimeBased = wod.type === 'For Time';
        
        submittedScores.sort((a, b) => isTimeBased ? a.result - b.result : b.result - a.result);

        // 1. Save individual WOD scores and points
        submittedScores.forEach((score, index) => {
            const rank = index + 1;
            const points = getPoints(rank);
            const scoreDocRef = doc(scoresRef, `${selectedWodId}-${score.athleteId}`);
            batch.set(scoreDocRef, {
                id: `${selectedWodId}-${score.athleteId}`,
                competitionId: competition.id,
                wodId: selectedWodId,
                athleteId: score.athleteId,
                result: score.result,
                points: points,
                submittedAt: serverTimestamp(),
            }, { merge: true });
        });

        // 2. Recalculate total leaderboard
        const allWodScoresSnapshot = await getDocs(scoresRef);
        const allWodScores = allWodScoresSnapshot.docs.map(doc => doc.data() as Score);

        const leaderboardMap: Record<string, LeaderboardEntry> = {};

        registrations?.forEach(reg => {
            const athlete = athletes?.find(a => a.id === reg.athleteId);
            if (athlete) {
                leaderboardMap[reg.athleteId] = {
                    id: reg.athleteId,
                    athleteId: reg.athleteId,
                    athleteName: `${athlete.firstName} ${athlete.lastName}`,
                    profilePictureUrl: athlete.profilePictureUrl,
                    totalPoints: 0,
                    rank: 0,
                    scores: {},
                }
            }
        });

        allWodScores.forEach(score => {
            if (leaderboardMap[score.athleteId]) {
                 leaderboardMap[score.athleteId].totalPoints += score.points;
                 leaderboardMap[score.athleteId].scores[score.wodId] = {
                    result: score.result,
                    points: score.points,
                    rank: submittedScores.findIndex(s => s.athleteId === score.athleteId) + 1, // This is simplified
                 };
            }
        });

        const leaderboardArray = Object.values(leaderboardMap).sort((a, b) => b.totalPoints - a.totalPoints);
        
        const leaderboardRef = collection(firestore, 'competitions', competition.id, 'leaderboard');

        leaderboardArray.forEach((entry, index) => {
            entry.rank = index + 1;
            const leaderboardDocRef = doc(leaderboardRef, entry.athleteId);
            batch.set(leaderboardDocRef, entry);
        });

        await batch.commit();

        toast({ title: '¡Resultados guardados!', description: 'El leaderboard ha sido actualizado.' });

    } catch (error) {
        console.error("Error saving scores:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron guardar los resultados.' });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const isLoading = isLoadingRegistrations || isLoadingAthletes;
  const selectedWod = competition.workouts?.find(w => w.id === selectedWodId);
  const registeredAthletes = registrations?.map(reg => athletes?.find(a => a.id === reg.athleteId)).filter(Boolean) as Athlete[];


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Cargar Resultados</CardTitle>
        <CardDescription>Selecciona un WOD y registra los resultados de los atletas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="max-w-xs">
            <Select onValueChange={setSelectedWodId} value={selectedWodId ?? undefined}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona un WOD..." />
                </SelectTrigger>
                <SelectContent>
                    {competition.workouts?.map(wod => (
                        <SelectItem key={wod.id} value={wod.id}>WOD #{wod.order}: {wod.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {selectedWod && (
            <div>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Atleta</TableHead>
                            <TableHead className="w-[200px]">Resultado ({selectedWod.type === 'For Time' ? 'segundos' : 'reps/lbs'})</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={2}>Cargando atletas...</TableCell></TableRow>
                        ) : registeredAthletes.length > 0 ? (
                            registeredAthletes.map(athlete => (
                                <TableRow key={athlete.id}>
                                    <TableCell className="font-medium">{athlete.firstName} {athlete.lastName}</TableCell>
                                    <TableCell>
                                        <Input 
                                            type="number" 
                                            placeholder="0"
                                            value={scores[athlete.id] || ''}
                                            onChange={(e) => handleScoreChange(athlete.id, e.target.value)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow><TableCell colSpan={2} className="text-center">No hay atletas aprobados en esta competencia.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                 <div className="flex justify-end mt-6">
                    <Button onClick={calculateAndSaveScores} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar y Calcular Puntos
                    </Button>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

    