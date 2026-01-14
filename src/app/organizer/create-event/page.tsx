'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const createEventSchema = z.object({
  name: z.string().min(5, { message: "El nombre debe tener al menos 5 caracteres." }),
  description: z.string().min(20, { message: "La descripción debe tener al menos 20 caracteres." }),
  location: z.string().min(3, { message: "La ubicación es requerida." }),
  startDate: z.date({ required_error: "La fecha de inicio es requerida." }),
  endDate: z.date({ required_error: "La fecha de fin es requerida." }),
  registrationStartDate: z.date({ required_error: "La fecha de inicio de registro es requerida." }),
  registrationEndDate: z.date({ required_error: "La fecha de fin de registro es requerida." }),
  banner: z.any().refine(files => files?.length == 1, "El banner es requerido."),
  rulebook: z.any().optional(),
}).refine(data => data.endDate >= data.startDate, {
  message: "La fecha de fin no puede ser anterior a la de inicio.",
  path: ["endDate"],
}).refine(data => data.registrationEndDate >= data.registrationStartDate, {
    message: "La fecha de fin de registro no puede ser anterior a la de inicio.",
    path: ["registrationEndDate"],
});

type CreateEventFormValues = z.infer<typeof createEventSchema>;

export default function CreateEventPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const methods = useForm<CreateEventFormValues>({
        resolver: zodResolver(createEventSchema),
    });

    const { handleSubmit, control } = methods;

    const onSubmit = async (data: CreateEventFormValues) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'No autenticado', description: 'Debes iniciar sesión para crear un evento.' });
            return;
        }

        setIsSubmitting(true);

        try {
            const storage = getStorage();
            
            // Upload Banner
            const bannerFile = data.banner[0];
            const bannerRef = ref(storage, `competitions/${user.uid}-${Date.now()}/${bannerFile.name}`);
            const bannerSnapshot = await uploadBytes(bannerRef, bannerFile);
            const bannerUrl = await getDownloadURL(bannerSnapshot.ref);

            // Upload Rulebook (if exists)
            let rulebookUrl: string | undefined = undefined;
            if (data.rulebook && data.rulebook.length > 0) {
                const rulebookFile = data.rulebook[0];
                const rulebookRef = ref(storage, `competitions/${user.uid}-${Date.now()}/rules/${rulebookFile.name}`);
                const rulebookSnapshot = await uploadBytes(rulebookRef, rulebookFile);
                rulebookUrl = await getDownloadURL(rulebookSnapshot.ref);
            }
            
            const competitionsRef = collection(firestore, 'competitions');
            
            const eventData = {
                organizerId: user.uid,
                name: data.name,
                description: data.description,
                location: data.location,
                startDate: data.startDate,
                endDate: data.endDate,
                registrationStartDate: data.registrationStartDate,
                registrationEndDate: data.registrationEndDate,
                bannerUrl,
                rulesUrl: rulebookUrl,
                createdAt: serverTimestamp(),
                categories: [], 
                workouts: [],
            };
            
            await addDocumentNonBlocking(competitionsRef, eventData);

            toast({ title: '¡Éxito!', description: 'Tu competencia ha sido creada.' });
            router.push('/organizer');

        } catch (error) {
            console.error("Error creating event:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear la competencia.' });
        } finally {
            setIsSubmitting(false);
        }
    };


  return (
    <div className="container mx-auto py-8 md:py-12">
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Crear Nueva Competición</CardTitle>
                <CardDescription>Completa los detalles para tu próximo gran evento.</CardDescription>
            </CardHeader>
            <CardContent>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Competición</FormLabel>
                                    <FormControl><Input placeholder="Ej: The Titan Games" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl><Textarea placeholder="Describe tu evento..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ubicación</FormLabel>
                                    <FormControl><Input placeholder="Ej: Medellín, Colombia" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <FormField
                                control={control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Fecha de Inicio del Evento</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}
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
                             <FormField
                                control={control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Fecha de Fin del Evento</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}
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

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <FormField
                                control={control}
                                name="registrationStartDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Inicio de Inscripciones</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}
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
                             <FormField
                                control={control}
                                name="registrationEndDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Fin de Inscripciones</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}
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
                            control={control}
                            name="banner"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Banner del Evento (Imagen)</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept="image/png, image/jpeg, image/jpg" onChange={(e) => field.onChange(e.target.files)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="rulebook"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reglamento (PDF, Opcional)</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept=".pdf" onChange={(e) => field.onChange(e.target.files)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Crear Competición
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    </div>
  );
}
