'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle } from 'lucide-react';

export function ProfilePictureStep() {
  const { control, watch } = useFormContext();
  const [preview, setPreview] = useState<string | null>(null);

  const profilePicture = watch('profilePicture');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-semibold">Sube tu foto de perfil</FormLabel>
            <p className="text-sm text-muted-foreground mb-4">Ayuda a otros a reconocerte.</p>
            <FormControl>
               <Input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg"
                className="max-w-xs mx-auto file:text-primary file:font-semibold"
                onChange={(e) => {
                    field.onChange(e.target.files);
                    handleFileChange(e);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
