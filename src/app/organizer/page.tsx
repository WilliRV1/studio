import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

// TODO: Fetch and display events created by the organizer
const organizerEvents: any[] = []; 

export default function OrganizerPage() {
  return (
    <div className="container mx-auto py-8 md:py-12">
        <div className="flex justify-between items-center mb-12">
            <div className="text-left">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter text-primary">
                Panel de Organizador
                </h1>
                <p className="max-w-2xl mt-2 text-foreground/80">
                Crea, gestiona y ejecuta tus competencias de CrossFit con facilidad.
                </p>
            </div>
            <Button asChild>
                <Link href="/organizer/create-event">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Nuevo Evento
                </Link>
            </Button>
        </div>

        <Card className="max-w-6xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline">Mis Eventos</CardTitle>
                <CardDescription>Una lista de las competencias que estás organizando.</CardDescription>
            </CardHeader>
            <CardContent>
                {organizerEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* TODO: Map over actual events and display them */}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <h3 className="text-xl font-semibold mb-2">Crea tu Primera Competencia</h3>
                        <p className="text-muted-foreground mb-6">Empieza por configurar tu próximo gran evento.</p>
                        <Button asChild>
                           <Link href="/organizer/create-event">
                             <PlusCircle className="mr-2 h-4 w-4" />
                             Crear Nuevo Evento
                           </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
