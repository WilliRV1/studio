'use client';

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CompetitionCard } from "@/components/competition-card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import type { Competition } from "@/lib/types";
import { addDays, isWithinInterval } from "date-fns";
import { FiltersBar, type FiltersState } from "./_components/filters-bar";
import { AnimatePresence, motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CompetitionCardSkeleton } from "@/components/skeletons";

function CompetitionsLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CompetitionCardSkeleton />
            <CompetitionCardSkeleton />
            <CompetitionCardSkeleton />
            <CompetitionCardSkeleton />
            <CompetitionCardSkeleton />
            <CompetitionCardSkeleton />
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
    // Base query, sorted by start date for logical default
    return query(collection(firestore, 'competitions'), orderBy('startDate', 'asc'));
  }, [firestore]);

  const { data: competitions, isLoading } = useCollection<Competition>(competitionsRef);

  const filteredAndSortedCompetitions = useMemo(() => {
    if (!competitions) return [];
    
    let result = [...competitions]; // Create a mutable copy

    // 1. Filter by search term (name or location)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(comp => 
        comp.name.toLowerCase().includes(searchTerm) ||
        comp.location.toLowerCase().includes(searchTerm)
      );
    }
    
    // 2. Filter by location
    if (filters.department) {
        result = result.filter(c => c.location.toLowerCase().includes(filters.department.toLowerCase()));
    }
    if (filters.city) {
        result = result.filter(c => c.location.toLowerCase().includes(filters.city.toLowerCase()));
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
            // Sort by most recently created
            result.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
            break;
        case 'price-asc':
            result.sort((a, b) => {
                const priceA = a.categories?.length ? Math.min(...a.categories.map(cat => cat.price)) : Infinity;
                const priceB = b.categories?.length ? Math.min(...b.categories.map(cat => cat.price)) : Infinity;
                return priceA - priceB;
            });
            break;
        case 'date-asc':
        default:
            // This is already sorted by start date from the initial query.
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
                          <motion.div layout animate={{ opacity: 1 }} initial={{ opacity: 0 }} exit={{ opacity: 0 }} key={comp.id} className="h-full">
                            <CompetitionCard competition={comp} className="h-full" />
                           </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg bg-muted/20">
                        <SearchX className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-xl font-semibold">No se encontraron competencias</h3>
                        <p className="text-muted-foreground">Intenta con otros filtros o revisa más tarde.</p>
                    </div>
                )}
            </AnimatePresence>
        )}

    </div>
  );
}
