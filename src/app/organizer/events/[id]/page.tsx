'use client';

import { useParams, useRouter } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, useUser, useCollection } from "@/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, query, where } from "firebase/firestore";
import type { Competition, Category, Workout, Registration, Athlete } from "@/lib/types";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';


import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Calendar, DollarSign, Edit, MapPin, PlusCircle, Trash2, Users, Dumbbell, BarChart2, TrendingUp, CheckCircle, FileDown } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState, useMemo } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegistrationsDashboard } from "./_components/registrations-dashboard";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultsDashboard } from "./_components/results-dashboard";
import { CategoryDistributionChart } from "./_components/category-distribution-chart";
import { getStatusText } from "./_components/registration-row";


const categorySchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
    type: z.enum(["Individual", "Pairs", "Team"], { required_error: "Debes seleccionar un tipo." }),
    gender: z.enum(["Male", "Female", "Mixed"], { required_error: "Debes seleccionar un género." }),
    price: z.preprocess((val) => Number(val), z.number().min(0, "El precio no puede ser negativo.")),
    spots: z.preprocess((val) => Number(val), z.number().int().min(1, "Debe haber al menos 1 cupo.")),
    requiresPartner: z.boolean().default(false),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const wodSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
    description: z.string().min(10, "La descripción es muy corta."),
    type: z.enum(['For Time', 'AMRAP', 'EMOM', 'Max Weight'], { required_error: "Debes seleccionar un tipo." }),
});
type WodFormValues = z.infer<typeof wodSchema>;


function EventManagementSkeleton() {
    return (
        <div className="container mx-auto py-12">
            <Skeleton className="h-9 w-1/2 mb-4" />
            <Skeleton className="h-5 w-1/3 mb-10" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-7 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-4">
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-3/4" />
                           </div>
                        </CardContent>
                    </Card>
                </div>
                <div>
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-7 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];


export default function EventManagementPage() {
    const { id } = useParams() as { id: string };
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isWodDialogOpen, setIsWodDialogOpen] = useState(false);


    const competitionRef = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return doc(firestore, 'competitions', id);
    }, [firestore, id]);

    const { data: competition, isLoading, error } = useDoc<Competition>(competitionRef);
    
    // Registrations and Athletes for the dashboard
    const registrationsRef = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return query(collection(firestore, 'registrations'), where('competitionId', '==', id));
    }, [firestore, id]);
    const { data: registrations } = useCollection<Registration>(registrationsRef);

    const athletesRef = useMemoFirebase(() => {
        const athleteIds = registrations?.map(r => r.athleteId);
        if (!firestore || !athleteIds || athleteIds.length === 0) return null;
        // Firestore 'in' queries are limited to 30 elements. For more, you'd need multiple queries.
        return query(collection(firestore, 'users'), where('id', 'in', athleteIds.slice(0, 30)));
    }, [firestore, registrations]);
    const { data: athletes } = useCollection<Athlete>(athletesRef);


    const categoryMethods = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            requiresPartner: false
        }
    });

    const wodMethods = useForm<WodFormValues>({
        resolver: zodResolver(wodSchema),
    });
    
    const watchCategoryType = categoryMethods.watch("type");

    const onCategorySubmit = async (data: CategoryFormValues) => {
        if (!competitionRef) return;

        const requiresPartner = data.type === 'Pairs' || data.type === 'Team';

        const newCategory: Category = {
            id: uuidv4(),
            ...data,
            requiresPartner,
            registeredCount: 0,
        };

        try {
            await updateDoc(competitionRef, {
                categories: arrayUnion(newCategory)
            });
            toast({ title: "¡Categoría añadida!", description: `La categoría "${data.name}" fue creada.` });
            categoryMethods.reset();
            setIsCategoryDialogOpen(false);
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: "Error", description: "No se pudo añadir la categoría." });
        }
    };
    
    const onWodSubmit = async (data: WodFormValues) => {
        if (!competitionRef || !competition) return;

        const newWod: Workout = {
            id: uuidv4(),
            ...data,
            order: (competition.workouts?.length || 0) + 1,
        };

        try {
            await updateDoc(competitionRef, {
                workouts: arrayUnion(newWod)
            });
            toast({ title: "¡WOD añadido!", description: `El WOD "${data.name}" fue creado.` });
            wodMethods.reset();
            setIsWodDialogOpen(false);
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: "Error", description: "No se pudo añadir el WOD." });
        }
    }
    
    const handleDelete = async (item: Category | Workout, itemType: 'category' | 'wod') => {
        if (!competitionRef) return;

        const fieldToUpdate = itemType === 'category' ? 'categories' : 'workouts';
        
        try {
             await updateDoc(competitionRef, {
                [fieldToUpdate]: arrayRemove(item)
            });
            toast({ title: `${itemType === 'category' ? 'Categoría' : 'WOD'} eliminada`, description: `"${item.name}" fue eliminada correctamente.` });
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: "Error", description: "No se pudo eliminar el elemento." });
        }
    }
    
    const dashboardStats = useMemo(() => {
        if (!registrations || !competition) {
            return {
                approvedRegistrations: 0,
                projectedIncome: 0,
                pendingApproval: 0,
                categoryDistribution: []
            };
        }

        const approved = registrations.filter(r => r.paymentStatus === 'approved');
        const pending = registrations.filter(r => r.paymentStatus === 'pending_approval');
        
        const income = approved.reduce((acc, reg) => {
            const category = competition.categories.find(c => c.id === reg.categoryId);
            return acc + (category?.price || 0);
        }, 0);
        
        const distribution = competition.categories.map((cat, index) => {
            const athleteCount = approved.filter(reg => reg.categoryId === cat.id).length;
            return {
                category: cat.name,
                athletes: athleteCount,
                fill: CHART_COLORS[index % CHART_COLORS.length]
            };
        }).filter(d => d.athletes > 0);


        return {
            approvedRegistrations: approved.length,
            projectedIncome: income,
            pendingApproval: pending.length,
            categoryDistribution: distribution
        };

    }, [registrations, competition]);
    
    const exportToExcel = () => {
      if (!registrations || !athletes || !competition) {
          toast({ variant: 'destructive', title: 'Error', description: 'Datos no disponibles para exportar.' });
          return;
      }
      
      const data = registrations.map(reg => {
        const athlete = athletes?.find(a => a.id === reg.athleteId);
        const category = competition.categories.find(c => c.id === reg.categoryId);
        
        return {
          'Nombre Completo': athlete ? `${athlete.firstName} ${athlete.lastName}` : 'N/A',
          'Email': athlete?.email || 'N/A',
          'Categoría': category?.name || 'N/A',
          'Estado de Pago': getStatusText(reg.paymentStatus),
          'Talla Camiseta': reg.tshirtSize,
          'Nombre de Equipo': reg.teamName || 'N/A'
        };
      });
      
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inscritos');
      XLSX.writeFile(wb, `${competition.name}-inscritos.xlsx`);
    };


    if (isLoading) {
        return <EventManagementSkeleton />
    }

    if (!competition || error) {
        return <div className="container text-center py-12">Competencia no encontrada.</div>
    }
    
    if (!user || user.uid !== competition.organizerId) {
        router.replace('/competitions');
        return <div className="container text-center py-12">No tienes permiso para ver esta página.</div>
    }

    return (
        <div className="bg-muted/40 min-h-screen">
            <div className="relative h-48 md:h-64 w-full">
                <Image
                    src={competition.bannerUrl}
                    alt={`${competition.name} banner`}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
            </div>
             <div className="container mx-auto px-4 py-8 md:py-12 -mt-24 space-y-8">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="font-headline text-3xl">{competition.name}</CardTitle>
                            <CardDescription className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{format(competition.startDate.toDate(), 'MMMM d, yyyy')}</span>
                                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{competition.location}</span>
                            </CardDescription>
                        </CardHeader>
                    </Card>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="font-headline text-lg">Dashboard General</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full" onClick={exportToExcel} disabled={!registrations || registrations.length === 0}>
                                    <FileDown className="mr-2 h-4 w-4"/>
                                    Exportar Inscritos
                                </Button>
                            </CardContent>
                        </Card>
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {dashboardStats.projectedIncome.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inscritos Aprobados</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                +{dashboardStats.approvedRegistrations}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pagos por Aprobar</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {dashboardStats.pendingApproval}
                            </div>
                        </CardContent>
                    </Card>
                    {dashboardStats.categoryDistribution.length > 0 && (
                        <div className="md:col-span-2 lg:col-span-1 lg:row-span-2">
                            <CategoryDistributionChart data={dashboardStats.categoryDistribution} />
                        </div>
                    )}
                </div>


                <Tabs defaultValue="registrations">
                    <TabsList className="mb-6 grid w-full grid-cols-4">
                        <TabsTrigger value="registrations">Inscritos</TabsTrigger>
                        <TabsTrigger value="categories">Categorías</TabsTrigger>
                        <TabsTrigger value="wods">WODs</TabsTrigger>
                        <TabsTrigger value="results">Resultados</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="registrations">
                        <RegistrationsDashboard competition={competition} />
                    </TabsContent>
                    
                    <TabsContent value="categories">
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle className="font-headline">Categorías del Evento</CardTitle>
                                    <CardDescription>Añade y gestiona las categorías para tu competencia.</CardDescription>
                                </div>
                                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Añadir Categoría
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                        <DialogTitle className="font-headline">Nueva Categoría</DialogTitle>
                                        <DialogDescription>
                                            Completa los detalles para la nueva categoría de tu evento.
                                        </DialogDescription>
                                        </DialogHeader>
                                        <FormProvider {...categoryMethods}>
                                        <form onSubmit={categoryMethods.handleSubmit(onCategorySubmit)} className="space-y-4 py-4">
                                            <FormField control={categoryMethods.control} name="name" render={({ field }) => (
                                                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Ej: RX Individual" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={categoryMethods.control} name="type" render={({ field }) => (
                                                    <FormItem><FormLabel>Tipo</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="Individual">Individual</SelectItem><SelectItem value="Pairs">Parejas</SelectItem><SelectItem value="Team">Equipo</SelectItem></SelectContent>
                                                    </Select><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={categoryMethods.control} name="gender" render={({ field }) => (
                                                    <FormItem><FormLabel>Género</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={watchCategoryType === 'Individual'}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="Male">Masculino</SelectItem><SelectItem value="Female">Femenino</SelectItem><SelectItem value="Mixed">Mixto</SelectItem></SelectContent>
                                                    </Select><FormMessage /></FormItem>
                                                )} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={categoryMethods.control} name="price" render={({ field }) => (
                                                    <FormItem><FormLabel>Precio (COP)</FormLabel><FormControl><Input type="number" placeholder="150000" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={categoryMethods.control} name="spots" render={({ field }) => (
                                                    <FormItem><FormLabel>Cupos</FormLabel><FormControl><Input type="number" placeholder="50" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                            </div>
                                            <DialogFooter className="pt-4">
                                                <DialogClose asChild>
                                                    <Button type="button" variant="secondary">Cancelar</Button>
                                                </DialogClose>
                                                <Button type="submit">Crear Categoría</Button>
                                            </DialogFooter>
                                        </form>
                                        </FormProvider>
                                    </DialogContent>
                                </Dialog>

                            </CardHeader>
                            <CardContent>
                            {competition.categories && competition.categories.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {competition.categories.map((cat) => (
                                        <Card key={cat.id} className="relative group">
                                                <CardHeader>
                                                    <CardTitle className="font-headline text-lg">{cat.name}</CardTitle>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Badge variant="secondary">{cat.type}</Badge>
                                                        <Badge variant="secondary">{cat.gender}</Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Precio:</span>
                                                        <span className="font-semibold flex items-center"><DollarSign className="h-4 w-4 mr-1"/>{cat.price.toLocaleString('es-CO')}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Cupos:</span>
                                                        <span className="font-semibold flex items-center"><Users className="h-4 w-4 mr-1"/>{cat.registeredCount} / {cat.spots}</span>
                                                    </div>
                                                </CardContent>
                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción no se puede deshacer. Esto eliminará permanentemente la categoría "{cat.name}".
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(cat, 'category')}>Eliminar</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                    <h3 className="text-xl font-semibold mb-2">Aún no hay categorías</h3>
                                    <p className="text-muted-foreground mb-4">Haz clic en "Añadir Categoría" para empezar a configurar tu evento.</p>
                                </div>
                            )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="wods">
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle className="font-headline">WODs de la Competencia</CardTitle>
                                    <CardDescription>Define los workouts que los atletas enfrentarán.</CardDescription>
                                </div>
                                <Dialog open={isWodDialogOpen} onOpenChange={setIsWodDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Añadir WOD
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="font-headline">Nuevo WOD</DialogTitle>
                                            <DialogDescription>Completa los detalles para el nuevo workout.</DialogDescription>
                                        </DialogHeader>
                                        <FormProvider {...wodMethods}>
                                            <form onSubmit={wodMethods.handleSubmit(onWodSubmit)} className="space-y-4 py-4">
                                                <FormField control={wodMethods.control} name="name" render={({ field }) => (
                                                    <FormItem><FormLabel>Nombre del WOD</FormLabel><FormControl><Input placeholder="Ej: 'Chipper de la Muerte'" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={wodMethods.control} name="type" render={({ field }) => (
                                                    <FormItem><FormLabel>Tipo de WOD</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona el tipo..." /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="For Time">For Time</SelectItem>
                                                            <SelectItem value="AMRAP">AMRAP</SelectItem>
                                                            <SelectItem value="EMOM">EMOM</SelectItem>
                                                            <SelectItem value="Max Weight">Max Weight</SelectItem>
                                                        </SelectContent>
                                                    </Select><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={wodMethods.control} name="description" render={({ field }) => (
                                                    <FormItem><FormLabel>Descripción y Movimientos</FormLabel><FormControl><Textarea placeholder="21-15-9 de...\nDeadlift (225/155 lbs)\nBurpees sobre la barra" {...field} rows={5} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <DialogFooter className="pt-4">
                                                    <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                                                    <Button type="submit">Crear WOD</Button>
                                                </DialogFooter>
                                            </form>
                                        </FormProvider>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                            {(competition.workouts && competition.workouts.length > 0) ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {competition.workouts.sort((a, b) => a.order - b.order).map((wod) => (
                                        <Card key={wod.id} className="relative group bg-muted/50">
                                                <CardHeader>
                                                    <CardTitle className="font-headline text-lg flex items-center justify-between">
                                                        <span>{wod.name}</span>
                                                        <Badge variant="outline" className="font-mono text-xs">{wod.type}</Badge>
                                                    </CardTitle>
                                                    <CardDescription>WOD #{wod.order}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{wod.description}</p>
                                                </CardContent>
                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción no se puede deshacer. Esto eliminará permanentemente el WOD "{wod.name}".
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(wod, 'wod')}>Eliminar</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                    <Dumbbell className="mx-auto h-10 w-10 text-muted-foreground" />
                                    <h3 className="mt-4 text-xl font-semibold mb-2">Aún no hay WODs</h3>
                                    <p className="text-muted-foreground mb-4">Define los desafíos que tus atletas enfrentarán.</p>
                                </div>
                            )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="results">
                        <ResultsDashboard competition={competition} />
                    </TabsContent>
                </Tabs>
             </div>
        </div>
    )
}