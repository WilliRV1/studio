'use client';

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CompetitionCard } from "@/components/competition-card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import type { Competition } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { addDays, isWithinInterval } from "date-fns";
import { FiltersBar, type FiltersState } from "./_components/filters-bar";
import { AnimatePresence, motion } from "framer-motion";

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
  const firestore = useFirestore();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FiltersState>({
    search: searchParams.get('search') || '',
    department: searchParams.get('department') || '',
    city: searchParams.get('city') || '',
    dateRange: searchParams.get('dateRange') || 'all',
    sortBy: searchParams.get('sortBy') || 'date-asc',
  });

  const competitionsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'competitions'), orderBy('startDate', 'asc'));
  }, [firestore]);

  const { data: competitions, isLoading } = useCollection<Competition>(competitionsRef);

  const filteredAndSortedCompetitions = useMemo(() => {
    if (!competitions) return [];
    
    let result = competitions;

    // 1. Filter by search term
    if (filters.search) {
      result = result.filter(comp => 
        comp.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        comp.location.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // 2. Filter by location
    if (filters.department) {
        result = result.filter(c => c.location.includes(filters.department));
    }
    if (filters.city) {
        result = result.filter(c => c.location.includes(filters.city));
    }

    // 3. Filter by date range
    const now = new Date();
    if (filters.dateRange === 'week') {
        const nextWeek = addDays(now, 7);
        result = result.filter(c => isWithinInterval(c.startDate.toDate(), { start: now, end: nextWeek }));
    } else if (filters.dateRange === 'month') {
        const nextMonth = addDays(now, 30);
        result = result.filter(c => isWithinInterval(c.startDate.toDate(), { start: now, end: nextMonth }));
    }

    // 4. Sort results
    switch(filters.sortBy) {
        case 'date-desc':
            result.sort((a, b) => b.startDate.seconds - a.startDate.seconds);
            break;
        case 'price-asc':
            // Assumes lowest category price. If no categories, put it last.
            result.sort((a, b) => {
                const priceA = a.categories?.length ? Math.min(...a.categories.map(cat => cat.price)) : Infinity;
                const priceB = b.categories?.length ? Math.min(...b.categories.map(cat => cat.price)) : Infinity;
                return priceA - priceB;
            });
            break;
        case 'date-asc':
        default:
            // The default query from firebase is already sorted by date ascending
            break;
    }

    return result;

  }, [competitions, filters]);


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
      
      <div className="mb-8">
        <FiltersBar filters={filters} setFilters={setFilters} />
      </div>

      <div className="text-sm text-muted-foreground mb-6">
        {isLoading ? (
             <Skeleton className="h-4 w-32" />
        ) : (
            <p>
                <strong>{filteredAndSortedCompetitions.length}</strong> {filteredAndSortedCompetitions.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}.
            </p>
        )}
      </div>


       {isLoading ? (
            <CompetitionsLoadingSkeleton />
        ) : (
            <AnimatePresence>
                {filteredAndSortedCompetitions.length > 0 ? (
                    <motion.div 
                        layout 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredAndSortedCompetitions.map((comp) => (
                          <motion.div layout animate={{ opacity: 1 }} initial={{ opacity: 0 }} exit={{ opacity: 0 }} key={comp.id}>
                            <CompetitionCard competition={comp} />
                           </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <h3 className="text-xl font-semibold mb-2">No se encontraron competencias</h3>
                        <p className="text-muted-foreground">Intenta con otros filtros o revisa más tarde.</p>
                    </div>
                )}
            </AnimatePresence>
        )}

    </div>
  );
}
