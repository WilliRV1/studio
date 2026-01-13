'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { boxes } from '@/lib/colombia-data';

export function AthleteInfoStep() {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="boxAffiliationId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Box de Afiliación (Opcional)</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu box" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {boxes.map(box => (
                  <SelectItem key={box.id} value={box.id}>{box.name}</SelectItem>
                ))}
                <SelectItem value="none">No estoy afiliado a un box</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="coachName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de tu Coach (Opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Juan" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="instagramHandle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instagram (Opcional)</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">@</span>
                <Input placeholder="tu_usuario" className="pl-7" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={control}
        name="tiktokHandle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>TikTok (Opcional)</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">@</span>
                <Input placeholder="tu_usuario" className="pl-7" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
