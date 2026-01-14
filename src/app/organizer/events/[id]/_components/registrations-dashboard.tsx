'use client';

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import type { Registration, Competition, Athlete } from "@/lib/types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { RegistrationRow } from "./registration-row";

interface RegistrationsDashboardProps {
  competition: Competition;
}

function RegistrationsSkeleton() {
    return (
        <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                             <Skeleton className="h-5 w-32" />
                             <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export function RegistrationsDashboard({ competition }: RegistrationsDashboardProps) {
  const firestore = useFirestore();

  const registrationsRef = useMemoFirebase(() => {
    if (!firestore || !competition.id) return null;
    return query(
        collection(firestore, 'registrations'), 
        where('competitionId', '==', competition.id),
        orderBy('registeredAt', 'desc')
    );
  }, [firestore, competition.id]);

  const { data: registrations, isLoading: isLoadingRegistrations } = useCollection<Registration>(registrationsRef);

  // Fetch all users to map athleteId to athlete details
  const usersRef = useMemoFirebase(() => {
    if(!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: athletes, isLoading: isLoadingAthletes } = useCollection<Athlete>(usersRef);

  const isLoading = isLoadingRegistrations || isLoadingAthletes;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Panel de Inscritos</CardTitle>
        <CardDescription>Gestiona las inscripciones y pagos de tu evento.</CardDescription>
      </CardHeader>
      <CardContent>
         {isLoading ? (
            <RegistrationsSkeleton />
         ) : registrations && registrations.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Atleta</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="hidden md:table-cell">Equipo</TableHead>
                        <TableHead className="text-center">Estado de Pago</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {registrations.map(reg => {
                        const athlete = athletes?.find(a => a.id === reg.athleteId);
                        const category = competition.categories.find(c => c.id === reg.categoryId);

                        return (
                            <RegistrationRow 
                                key={reg.id}
                                registration={reg}
                                athlete={athlete}
                                category={category}
                            />
                        )
                    })}
                </TableBody>
            </Table>
         ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold mb-2">No hay inscritos todavía</h3>
                <p className="text-muted-foreground">Cuando un atleta se inscriba, aparecerá aquí.</p>
            </div>
         )}
      </CardContent>
    </Card>
  );
}
