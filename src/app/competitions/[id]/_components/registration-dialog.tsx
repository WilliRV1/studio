'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Competition, Category } from '@/lib/types';
import type { User } from 'firebase/auth';
import { sendRegistrationConfirmationEmail } from '@/app/actions/email';

const registrationSchema = z.object({
  tshirtSize: z.enum(['S', 'M', 'L', 'XL'], { required_error: 'Debes seleccionar una talla.' }),
  teamName: z.string().optional(),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface RegistrationDialogProps {
  competition: Competition;
  category: Category;
  user: User | null;
  children: React.ReactNode;
}

export function RegistrationDialog({ competition, category, user, children }: RegistrationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const methods = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      tshirtSize: undefined,
    }
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    if (!user || !user.displayName || !user.email) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión y tener un perfil completo.' });
        return;
    }
    
    setIsSubmitting(true);
    
    try {
        const registrationsRef = collection(firestore, 'registrations');
        
        const registrationData = {
            athleteId: user.uid,
            competitionId: competition.id,
            categoryId: category.id,
            tshirtSize: data.tshirtSize,
            paymentStatus: 'pending_payment',
            registeredAt: serverTimestamp(),
            ...(data.teamName && { teamName: data.teamName }),
        };

        await addDocumentNonBlocking(registrationsRef, registrationData);
        
        // Send confirmation email
        await sendRegistrationConfirmationEmail({
          athleteEmail: user.email,
          athleteName: user.displayName,
          competition,
          category,
          teamName: data.teamName,
        });

        toast({
            title: '¡Pre-registro exitoso!',
            description: 'Tu cupo está reservado. Revisa tu email para ver las instrucciones de pago.',
        });
        
        setIsOpen(false);
        methods.reset();

    } catch (error) {
        console.error("Error creating registration:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo completar el pre-registro.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Inscripción a {category.name}</DialogTitle>
          <DialogDescription>
            Confirma tu talla de camiseta y nombre de equipo para reservar tu cupo.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 py-2">
             <FormField
                control={methods.control}
                name="tshirtSize"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Talla de Camiseta</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tu talla" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="S">S</SelectItem>
                                <SelectItem value="M">M</SelectItem>
                                <SelectItem value="L">L</SelectItem>
                                <SelectItem value="XL">XL</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            
            {(category.type === 'Pairs' || category.type === 'Team') && (
                 <FormField
                    control={methods.control}
                    name="teamName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Equipo</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Los Invencibles" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

             <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirmar Pre-registro
                </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}