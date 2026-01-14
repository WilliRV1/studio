'use client';

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Category, Competition } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, MapPin, Users, DollarSign, FileText, BarChart2, Search, Trophy, Loader2 } from "lucide-react";
import { format } from "date-fns";
import PartnerFinderClient from "./_components/partner-finder-client";
import { leaderboardData } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";


function DetailPageSkeleton() {
  return (
    <div>
        <section className="relative h-64 md:h-80 w-full bg-muted">
            <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-end pb-10">
                <Skeleton className="h-12 w-3/4 md:w-1/2 mb-4" />
                <div className="flex items-center gap-x-6 gap-y-2 mt-2 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            </div>
        </section>
         <div className="container mx-auto px-4 py-8 md:py-12">
             <Skeleton className="h-10 w-full md:w-1/2 mb-8" />
             <Card>
                 <CardHeader>
                    <Skeleton className="h-8 w-1/3 mb-2" />
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-10 w-48 mt-4" />
                 </CardContent>
             </Card>
         </div>
    </div>
  )
}


export default function CompetitionDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();

  const competitionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'competitions', params.id);
  }, [firestore, params.id]);

  const { data: competition, isLoading, error } = useDoc<Competition>(competitionRef);

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (error || !competition) {
    // This will be caught by notFound() if the doc doesn't exist.
    // We can also show a generic error message if `error` is present.
    notFound();
  }
  
  const partnerFinderCategory = competition.categories.find(c => c.requiresPartner);

  return (
    <div className="bg-background">
      <section className="relative h-64 md:h-80 w-full">
        <Image
          src={competition.bannerUrl}
          alt={`${competition.name} banner`}
          fill
          className="object-cover"
          priority
          data-ai-hint="crossfit event"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-end pb-10">
          <h1 className="font-headline text-4xl md:text-6xl font-bold text-white tracking-tighter">
            {competition.name}
          </h1>
          <div className="flex items-center gap-x-6 gap-y-2 mt-2 text-white/80 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(competition.startDate.toDate(), 'MMMM d')} - {format(competition.endDate.toDate(), 'd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{competition.location}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-10 mb-8">
            <TabsTrigger value="overview"><Users className="h-4 w-4 mr-2 hidden md:inline"/>Información</TabsTrigger>
            <TabsTrigger value="categories"><Trophy className="h-4 w-4 mr-2 hidden md:inline"/>Categorías</TabsTrigger>
            <TabsTrigger value="partner-finder" disabled={!partnerFinderCategory}><Search className="h-4 w-4 mr-2 hidden md:inline"/>Buscar Pareja</TabsTrigger>
            <TabsTrigger value="leaderboard"><BarChart2 className="h-4 w-4 mr-2 hidden md:inline"/>Leaderboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
             <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Acerca de {competition.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{competition.description}</p>
                   {competition.rulesUrl && (
                    <Button asChild variant="outline">
                      <Link href={competition.rulesUrl} target="_blank">
                        <FileText className="mr-2 h-4 w-4"/>
                        Descargar Reglamento
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="categories">
             {competition.categories && competition.categories.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {competition.categories.map((category: Category) => (
                    <Card key={category.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline">{category.name}</CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{category.type}</Badge>
                            <Badge variant="secondary">{category.gender}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3">
                        <div className="flex items-center text-2xl font-bold text-primary">
                            <DollarSign className="h-6 w-6 mr-2"/>
                            {category.price}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-2"/>
                            {category.registeredCount} / {category.spots} cupos llenos
                        </div>
                    </CardContent>
                    <div className="p-6 pt-0">
                        <Button className="w-full font-bold" disabled={category.registeredCount >= category.spots}>
                            {category.registeredCount >= category.spots ? 'Agotado' : 'Inscríbete Ahora'}
                        </Button>
                    </div>
                    </Card>
                ))}
                </div>
            ) : (
                <Card className="text-center py-12">
                  <CardHeader>
                    <CardTitle className="font-headline">Categorías no definidas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">El organizador aún no ha añadido las categorías para este evento.</p>
                  </CardContent>
                </Card>
            )}
          </TabsContent>
          
          <TabsContent value="partner-finder">
            {partnerFinderCategory ? (
              <PartnerFinderClient competition={competition} category={partnerFinderCategory} />
            ) : (
               <Card className="text-center py-12">
                  <CardHeader>
                    <CardTitle className="font-headline">No hay categorías en pareja</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Esta competencia no tiene categorías que requieran pareja.</p>
                  </CardContent>
                </Card>
            )}
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Leaderboard en Vivo</CardTitle>
                </CardHeader>
                <CardContent>
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Puesto</TableHead>
                        <TableHead>Atleta/Equipo</TableHead>
                        <TableHead className="text-right">Puntos Totales</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboardData.map((entry) => (
                        <TableRow key={entry.rank}>
                          <TableCell className="font-bold text-lg">{entry.rank}</TableCell>
                          <TableCell className="font-medium">{entry.athleteName}</TableCell>
                          <TableCell className="text-right font-bold text-primary">{entry.totalPoints}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
