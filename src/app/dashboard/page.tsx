'use client';

import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

import type { Athlete, Registration } from '@/lib/types';
import { competitions } from '@/lib/data';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Instagram, Mail, Phone, MapPin, BarChart2, PlusCircle, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const getStatusBadgeVariant = (status: Registration['paymentStatus']) => {
  switch (status) {
    case 'approved':
      return 'default';
    case 'pending_approval':
      return 'secondary';
    case 'pending_payment':
      return 'outline';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
};

function ProfileSkeleton() {
    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader className="text-center items-center">
                        <Skeleton className="h-24 w-24 rounded-full mb-4" />
                        <Skeleton className="h-8 w-40 mb-2" />
                        <Skeleton className="h-6 w-20" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                         <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Mis Competiciones</CardTitle>
                        <CardDescription>Gestiona tus inscripciones y pagos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <Skeleton className="h-5 w-64 mx-auto mb-4" />
                            <Skeleton className="h-10 w-48 mx-auto" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: athlete, isLoading: isAthleteLoading } = useDoc<Athlete>(userDocRef);

  // TODO: Fetch user registrations from Firestore
  const userRegistrations: Registration[] = [];

  if (isUserLoading || isAthleteLoading) {
    return (
       <div className="container mx-auto py-8 md:py-12">
            <ProfileSkeleton />
       </div>
    );
  }

  if (!athlete) {
    // This case should be handled by the redirect in client-provider, but it's good practice
    return (
        <div className="container mx-auto py-8 md:py-12 text-center">
            <p>Perfil no encontrado. Completando el onboarding...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader className="text-center items-center relative">
              <Button variant="ghost" size="icon" className="absolute top-4 right-4">
                <Edit className="h-4 w-4" />
              </Button>
              <Avatar className="h-24 w-24 mb-4 border-4 border-primary">
                <AvatarImage src={athlete.profilePictureUrl} alt={athlete.firstName} />
                <AvatarFallback>{athlete.firstName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-2xl">{athlete.firstName} {athlete.lastName}</CardTitle>
              <CardDescription className="flex flex-col gap-2">
                <div className="flex items-center gap-2 justify-center">
                    <MapPin className="h-4 w-4 text-muted-foreground"/>
                    <span>{athlete.city}, {athlete.department}</span>
                </div>
                {athlete.boxAffiliationId !== 'none' && (
                    <span className="font-semibold">{athlete.boxAffiliationId}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{athlete.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{athlete.phoneNumber}</span>
              </div>
              {athlete.instagramHandle && (
                <div className="flex items-center gap-3">
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                  <a href={`https://instagram.com/${athlete.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    @{athlete.instagramHandle}
                  </a>
                </div>
              )}
               {athlete.tiktokHandle && (
                 <div className="flex items-center gap-3">
                    <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"></path></svg>
                    <a href={`https://tiktok.com/@${athlete.tiktokHandle}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        @{athlete.tiktokHandle}
                    </a>
                </div>
              )}
            </CardContent>
          </Card>
           <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary"/>
                        <CardTitle className="font-headline text-xl">Personal Records</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon">
                        <PlusCircle className="h-5 w-5" />
                    </Button>
                </CardHeader>
                <CardContent>
                    {athlete.personalRecords ? (
                         <div className="grid grid-cols-2 gap-4 text-sm">
                            {Object.entries(athlete.personalRecords).map(([key, value]) => (
                                <div key={key} className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">{key}</span>
                                    <span className="font-semibold">{value}</span>
                                </div>
                            ))}
                        </div>
                    ): (
                        <div className="text-center py-6 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground mb-3">No has registrado PRs todavía.</p>
                            <Button variant="outline" size="sm">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Añadir PR
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>

        {/* My Competitions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Mis Competiciones</CardTitle>
              <CardDescription>Gestiona tus inscripciones y pagos.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {userRegistrations.length > 0 ? (
                  userRegistrations.map((reg) => {
                    const comp = competitions.find((c) => c.id === reg.competitionId);
                    if (!comp) return null;

                    return (
                      <div key={reg.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
                        <div>
                          <h3 className="font-bold">{comp.name}</h3>
                          <p className="text-sm text-muted-foreground">{reg.teamName || 'Individual'}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={getStatusBadgeVariant(reg.paymentStatus)} className="capitalize">
                            {reg.paymentStatus.replace('_', ' ')}
                          </Badge>
                          <Button variant="secondary" size="sm">Gestionar</Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">Aún no te has inscrito en ninguna competición.</p>
                    <Button asChild>
                      <a href="/competitions">Buscar una Competición</a>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
