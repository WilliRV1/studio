'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ProfilePictureStep() {
  const { control, setValue } = useFormContext();
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        toast({
            variant: 'destructive',
            title: 'Archivo demasiado grande',
            description: 'El tamaño máximo para la foto de perfil es 5MB.',
        });
        setValue('profilePicture', null); // Clear the invalid file
        event.target.value = ''; // Reset input
        setPreview(null);
        return;
    }

    // Validate format
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        toast({
            variant: 'destructive',
            title: 'Formato de imagen inválido',
            description: 'Por favor, selecciona un archivo JPG, PNG o GIF.',
        });
        setValue('profilePicture', null);
        event.target.value = '';
        setPreview(null);
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // This is already being handled by the parent onChange, but explicit for clarity
    setValue('profilePicture', event.target.files);
  };

  return (
    <div className="space-y-4 text-center">
        <div className="flex justify-center">
             <Avatar className="h-40 w-40 mb-4 border-4 border-primary/50">
                <AvatarImage src={preview ?? undefined} alt="Profile picture preview" />
                <AvatarFallback className="bg-muted">
                    <UserCircle className="h-24 w-24 text-muted-foreground" />
                </AvatarFallback>
            </Avatar>
        </div>
      <FormField
        control={control}
        name="profilePicture"
        render={({ field: { onChange, ...fieldProps } }) => (
          <FormItem>
            <FormLabel className="text-lg font-semibold">Sube tu foto de perfil</FormLabel>
            <p className="text-sm text-muted-foreground mb-4">Ayuda a otros a reconocerte.</p>
            <FormControl>
               <Input 
                type="file" 
                accept="image/png, image/jpeg, image/gif"
                className="max-w-xs mx-auto file:text-primary file:font-semibold"
                {...fieldProps}
                onChange={handleFileChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
