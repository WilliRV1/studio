'use client';

import { useState, useMemo } from "react";
import { CompetitionCard } from "@/components/competition-card";
import { Input } from "@/components/ui/input";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import type { Competition } from "@/lib/types";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function CompetitionsLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <div className="space-y-2 p-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
      </div>
    )
}

export default function CompetitionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const firestore = useFirestore();

  const competitionsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'competitions'), orderBy('startDate', 'asc'));
  }, [firestore]);

  const { data: competitions, isLoading } = useCollection<Competition>(competitionsRef);

  const filteredCompetitions = useMemo(() => {
    if (!competitions) return [];
    return competitions.filter(comp => 
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [competitions, searchTerm]);


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter text-primary">
          Marketplace de Competencias
        </h1>
        <p className="max-w-2xl mx-auto mt-4 text-foreground/80">
          Encuentra tu próximo desafío. Explora las próximas competencias de CrossFit e inscríbete para competir.
        </p>
      </div>
      
      <div className="mb-8 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar por competencia o ubicación..." 
            className="pl-10 h-12 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

       {isLoading ? (
            <CompetitionsLoadingSkeleton />
        ) : filteredCompetitions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCompetitions.map((comp) => (
                <CompetitionCard key={comp.id} competition={comp} />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold mb-2">No se encontraron competencias</h3>
                <p className="text-muted-foreground">Intenta con otra búsqueda o revisa más tarde.</p>
            </div>
        )}

    </div>
  );
}
