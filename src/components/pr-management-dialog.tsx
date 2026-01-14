'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { PR_CATEGORIES, getPrCategoryById } from '@/lib/pr-data';
import { PersonalRecord } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

const prSchema = z.object({
  id: z.string({ required_error: 'Debes seleccionar un ejercicio.' }),
  value: z.preprocess(
    (val) => (typeof val === 'string' && val.includes(':')) 
        ? (parseInt(val.split(':')[0], 10) * 60) + parseInt(val.split(':')[1], 10)
        : Number(val),
    z.number().positive({ message: 'El valor debe ser positivo.' })
  ),
  date: z.date({ required_error: 'La fecha es requerida.' }),
  notes: z.string().optional(),
});

type PrFormValues = z.infer<typeof prSchema>;

interface PrManagementDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (data: PersonalRecord) => Promise<void>;
  existingPr?: PersonalRecord | null;
  children?: React.ReactNode;
}

export function PrManagementDialog({ isOpen, setIsOpen, onSubmit, existingPr }: PrManagementDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = existingPr ? {
      ...existingPr,
      date: existingPr.date.toDate(),
      value: existingPr.value,
  } : {
      date: new Date(),
  };

  const methods = useForm<PrFormValues>({
    resolver: zodResolver(prSchema),
    defaultValues: defaultValues as any,
  });

  const selectedPrId = methods.watch('id');
  const selectedPrCategory = getPrCategoryById(selectedPrId);

  const handleFormSubmit = async (data: PrFormValues) => {
    setIsSubmitting(true);
    const finalData: PersonalRecord = {
      ...data,
      date: Timestamp.fromDate(data.date),
    };
    await onSubmit(finalData);
    setIsSubmitting(false);
    setIsOpen(false);
    methods.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">{existingPr ? 'Editar' : 'Añadir'} Récord Personal</DialogTitle>
          <DialogDescription>
            Registra tus logros y sigue tu progreso.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
            <FormField
              control={methods.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ejercicio</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un ejercicio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PR_CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={methods.control}
                    name="value"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Resultado ({selectedPrCategory?.unit || 'valor'})</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder={selectedPrCategory?.type === 'time' ? 'mm:ss' : '0'} 
                                {...field}
                                // Format back to mm:ss for display if it's a time type and value exists
                                value={
                                    field.value && selectedPrCategory?.type === 'time'
                                    ? `${Math.floor(field.value / 60)}:${(field.value % 60).toString().padStart(2, '0')}`
                                    : field.value || ''
                                }
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={methods.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Fecha del PR</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "d 'de' LLL, y", { locale: es }) : <span>Elige una fecha</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
             <FormField
                control={methods.control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Notas (Opcional)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Ej: Me sentí fuerte ese día..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {existingPr ? 'Guardar Cambios' : 'Añadir PR'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
