'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { colombiaData } from '@/lib/colombia-data';

export function LocationStep() {
  const { control } = useFormContext();
  const selectedDepartment = useWatch({
    control,
    name: 'department',
  });

  const cities = selectedDepartment ? colombiaData.find(d => d.departamento === selectedDepartment)?.ciudades || [] : [];

  return (
    <div className="space-y-4">
       <FormField
        control={control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Departamento</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu departamento" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {colombiaData.map(d => (
                  <SelectItem key={d.id} value={d.departamento}>{d.departamento}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

       <FormField
        control={control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ciudad</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedDepartment}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu ciudad" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
