'use client';

import { useState, useMemo, useRef, useEffect } from "react";
import type { Competition, LeaderboardEntry, Workout } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import type { User } from "firebase/auth";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BarChart2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaderboardClientProps {
  competition: Competition;
  user: User | null;
}

export default function LeaderboardClient({ competition, user }: LeaderboardClientProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(competition.categories[0]?.id || null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const firestore = useFirestore();

  const userRowRef = useRef<HTMLTableRowElement>(null);

  const leaderboardRef = useMemoFirebase(() => {
    if (!firestore || !competition.id || !selectedCategoryId) return null;
    return query(
        collection(firestore, 'competitions', competition.id, 'leaderboard'),
        where('categoryId', '==', selectedCategoryId),
        orderBy('rank', 'asc')
    );
  }, [firestore, competition.id, selectedCategoryId]);

  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useCollection<LeaderboardEntry>(leaderboardRef);

  useEffect(() => {
    if (userRowRef.current) {
        userRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [leaderboardData]);
  
  const getWodName = (wodId: string) => {
    const wod = competition.workouts.find(w => w.id === wodId);
    return wod ? `WOD ${wod.order}: ${wod.name}` : 'WOD desconocido';
  }
  
  const handleToggleRow = (entryId: string) => {
    setExpandedRow(prev => (prev === entryId ? null : entryId));
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Leaderboard en Vivo</CardTitle>
        <CardDescription>Filtra por categoría para ver las posiciones.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 max-w-xs">
            <Select onValueChange={setSelectedCategoryId} value={selectedCategoryId ?? undefined}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría..." />
                </SelectTrigger>
                <SelectContent>
                    {competition.categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {isLoadingLeaderboard ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : leaderboardData && leaderboardData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Puesto</TableHead>
                <TableHead>Atleta</TableHead>
                <TableHead className="text-right">Puntos Totales</TableHead>
                <TableHead className="w-[100px] text-right">Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((entry) => {
                const isCurrentUser = entry.athleteId === user?.uid;
                return (
                 <React.Fragment key={entry.id}>
                    <TableRow 
                        ref={isCurrentUser ? userRowRef : null}
                        className={isCurrentUser ? 'bg-primary/10' : ''}
                    >
                        <TableCell className="font-bold text-lg text-center relative">
                            {isCurrentUser && <div className="absolute -left-1 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                            {entry.rank}
                        </TableCell>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                            <AvatarImage src={entry.profilePictureUrl} alt={entry.athleteName} />
                            <AvatarFallback>{entry.athleteName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                               <span className="font-medium">{entry.athleteName}</span>
                               {isCurrentUser && <Badge variant="secondary" className="w-fit">Tu Posición</Badge>}
                            </div>
                        </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary text-lg">{entry.totalPoints}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon" onClick={() => handleToggleRow(entry.id)}>
                                {expandedRow === entry.id ? <ChevronUp /> : <ChevronDown />}
                            </Button>
                        </TableCell>
                    </TableRow>
                    {expandedRow === entry.id && (
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableCell colSpan={4} className="p-0">
                                <div className="p-4">
                                    <h4 className="font-semibold mb-3 text-base">Desglose por WOD</h4>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>WOD</TableHead>
                                                <TableHead>Resultado</TableHead>
                                                <TableHead>Puntos</TableHead>
                                                <TableHead className="text-right">Ranking WOD</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.entries(entry.scores).map(([wodId, score]) => (
                                                <TableRow key={wodId}>
                                                    <TableCell className="font-medium">{getWodName(wodId)}</TableCell>
                                                    <TableCell>{score.result}</TableCell>
                                                    <TableCell>{score.points}</TableCell>
                                                    <TableCell className="text-right font-bold">#{score.rank}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                 </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">El Leaderboard está vacío</h3>
            <p className="mt-2 text-muted-foreground">Los resultados para esta categoría aparecerán aquí una vez que comience la competencia.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
