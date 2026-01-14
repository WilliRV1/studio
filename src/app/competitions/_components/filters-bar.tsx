'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { colombiaData } from '@/lib/colombia-data';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { debounce } from 'lodash';

export type FiltersState = {
  search: string;
  department: string;
  city: string;
  dateRange: string;
  sortBy: string;
};

interface FiltersBarProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
}

export function FiltersBar({ filters, setFilters }: FiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { control, watch, setValue, reset } = useForm<FiltersState>({
    defaultValues: filters,
  });

  const selectedDepartment = watch('department');
  const cities = selectedDepartment ? colombiaData.find(d => d.departamento === selectedDepartment)?.ciudades || [] : [];
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateUrlParams = useCallback(
    debounce((newFilters: FiltersState) => {
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value !== 'all') {
            params.set(key, value);
            }
        });
        router.replace(`${pathname}?${params.toString()}`);
    }, 300),
    [pathname, router]
  );

  useEffect(() => {
    const subscription = watch((value) => {
      const newFilters = value as FiltersState;
      setFilters(newFilters);
      updateUrlParams(newFilters);
    });
    return () => subscription.unsubscribe();
  }, [watch, setFilters, updateUrlParams]);

  const handleClearFilters = () => {
    const defaultFilters = {
        search: '',
        department: '',
        city: '',
        dateRange: 'all',
        sortBy: 'date-asc',
    };
    reset(defaultFilters);
    setFilters(defaultFilters);
    router.replace(pathname);
  };

  const hasActiveFilters = filters.department || filters.city || filters.dateRange !== 'all' || filters.sortBy !== 'date-asc';

  const filterFields = (
    <div className="grid grid-cols-1 gap-4 p-4 md:p-0 md:grid-cols-2 lg:grid-cols-5 md:gap-2 lg:gap-4">
      {/* Search */}
      <div className="relative lg:col-span-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Controller
            name="search"
            control={control}
            render={({ field }) => (
                <Input
                    placeholder="Buscar por competencia..."
                    className="pl-10 h-12 text-base w-full"
                    {...field}
                />
            )}
        />
      </div>

      {/* Department */}
      <Controller
        name="department"
        control={control}
        render={({ field }) => (
          <Select onValueChange={(val) => {
            field.onChange(val);
            setValue('city', '');
          }} value={field.value}>
            <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Departamento" /></SelectTrigger>
            <SelectContent>
              {colombiaData.map(d => (<SelectItem key={d.id} value={d.departamento}>{d.departamento}</SelectItem>))}
            </SelectContent>
          </Select>
        )}
      />

      {/* City */}
      <Controller
        name="city"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDepartment}>
            <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Ciudad" /></SelectTrigger>
            <SelectContent>
              {cities.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
        )}
      />

      {/* Sort By */}
       <Controller
        name="sortBy"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Ordenar por..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Fecha más cercana</SelectItem>
              <SelectItem value="date-desc">Más recientes</SelectItem>
              <SelectItem value="price-asc">Menor precio</SelectItem>
            </SelectContent>
          </Select>
        )}
      />

      {(isMobile && hasActiveFilters) && (
        <Button variant="ghost" onClick={handleClearFilters}>
            <X className="mr-2" /> Limpiar filtros
        </Button>
      )}

    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full justify-between h-12 text-base">
            <span>Filtros</span>
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-lg">
          <SheetHeader className="mb-4">
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          {filterFields}
        </SheetContent>
      </Sheet>
    );
  }

  return (
     <div className="flex items-center gap-4">
        <div className="flex-grow">
            {filterFields}
        </div>
        {hasActiveFilters && (
            <Button variant="ghost" onClick={handleClearFilters} className="h-12">
                <X className="mr-2 h-4 w-4" /> Limpiar
            </Button>
        )}
     </div>
  );
}

// Debounce utility to prevent excessive re-renders
function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function(this: ThisParameterType<F>, ...args: Parameters<F>) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}
