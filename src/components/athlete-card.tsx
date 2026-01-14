import Image from "next/image";
import type { Athlete } from "@/lib/types";
import type { SuggestPartnersOutput } from "@/ai/flows/partner-finder-suggest-partners";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Zap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type AthleteCardProps = {
  athlete: Athlete;
  suggestion?: SuggestPartnersOutput['suggestedPartners'][0];
};

export function AthleteCard({ athlete, suggestion }: AthleteCardProps) {
  return (
    <Card className="flex flex-col text-left">
      <CardHeader className="flex-row gap-4 items-start pb-4">
        <div className="relative h-16 w-16 shrink-0">
          <Image
            src={athlete.avatarUrl}
            alt={athlete.name}
            fill
            className="rounded-full object-cover border-2 border-primary"
            data-ai-hint="athlete portrait"
          />
        </div>
        <div>
          <CardTitle className="font-headline text-lg mb-1">{athlete.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono uppercase">{athlete.skillLevel}</Badge>
            <Badge variant="secondary">{athlete.boxAffiliation}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {suggestion && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
               <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 font-bold text-primary">
                            <Zap className="h-4 w-4" />
                            <span>Compatibilidad: {suggestion.compatibilityScore}%</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Puntuación de compatibilidad impulsada por IA.</p>
                    </TooltipContent>
                </Tooltip>
               </TooltipProvider>
            </div>
            <CardDescription className="text-sm">{suggestion.reasoning}</CardDescription>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="w-full">Ver Perfil</Button>
      </CardFooter>
    </Card>
  );
}
