
import Link from "next/link";
import Image from "next/image";
import type { Competition } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useUser } from "@/firebase";

type CompetitionCardProps = {
  competition: Competition;
  className?: string;
};

export function CompetitionCard({ competition, className }: CompetitionCardProps) {
  const { user } = useUser();
  const regStartDate = competition.registrationStartDate.toDate();
  const regEndDate = competition.registrationEndDate.toDate();
  const isRegistrationOpen = new Date() >= regStartDate && new Date() <= regEndDate;
  const isOrganizer = user?.uid === competition.organizerId;
  const linkHref = isOrganizer ? `/organizer/events/${competition.id}` : `/competitions/${competition.id}`;


  return (
    <Link href={linkHref} className="group block">
      <Card className={cn("overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-primary/80 hover:shadow-lg hover:shadow-primary/10", className)}>
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={competition.bannerUrl}
              alt={`${competition.name} banner`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="crossfit competition"
            />
             {isOrganizer ? (
                <Badge variant="default" className="absolute top-3 right-3 bg-accent text-accent-foreground">Modo Organizador</Badge>
             ) : isRegistrationOpen ? (
              <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">Inscripciones Abiertas</Badge>
            ) : (
               <Badge variant="secondary" className="absolute top-3 right-3">Inscripciones Cerradas</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 pt-6">
          <CardTitle className="font-headline text-xl mb-3">{competition.name}</CardTitle>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(competition.startDate.toDate(), 'LLL d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{competition.location}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-primary font-semibold">{isOrganizer ? 'Gestionar Evento' : 'Ver Detalles'} &rarr;</p>
        </CardFooter>
      </Card>
    </Link>
  );
}
