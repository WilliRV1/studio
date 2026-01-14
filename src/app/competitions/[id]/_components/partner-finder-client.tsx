
"use client";

import { useState } from "react";
import type { Athlete, Competition, Category } from "@/lib/types";
import { findPartnersAction } from "@/app/actions";
import type { SuggestPartnersOutput } from "@/ai/flows/partner-finder-suggest-partners";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { AthleteCard } from "@/components/athlete-card";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, getDocs, query } from "firebase/firestore";

interface PartnerFinderClientProps {
  competition: Competition;
  category: Category;
}

export default function PartnerFinderClient({ competition, category }: PartnerFinderClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestPartnersOutput['suggestedPartners'] | null>(null);
  const [allAthletes, setAllAthletes] = useState<Athlete[]>([]);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const handleFindPartner = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "Debes iniciar sesión para buscar una pareja.",
      });
      return;
    }

    setIsLoading(true);
    setSuggestions(null);

    // Fetch all athletes to be able to display their cards later
    const usersSnapshot = await getDocs(query(collection(firestore, 'users')));
    const athletesData = usersSnapshot.docs.map(doc => ({ ...doc.data() as Athlete, id: doc.id }));
    setAllAthletes(athletesData);

    const result = await findPartnersAction({
      competitionId: competition.id,
      categoryId: category.id,
      currentUser: { uid: user.uid },
    });

    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else {
      // Sort suggestions by compatibilityScore descending
      const sortedSuggestions = result.suggestedPartners.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      setSuggestions(sortedSuggestions);
    }
    
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Encuentra tu Pareja Ideal</CardTitle>
        <CardDescription>
          Para la categoría <span className="font-bold text-primary">{category.name}</span>. Deja que nuestra IA analice perfiles de atletas para encontrar la mejor pareja para tus habilidades y metas.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {!suggestions && (
          <div className="max-w-md mx-auto">
            <p className="text-muted-foreground mb-6">
              ¿Listo para encontrar una pareja que complemente tus fortalezas? Haz clic en el botón de abajo para empezar.
            </p>
            <Button size="lg" onClick={handleFindPartner} disabled={isLoading || !category.requiresPartner}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analizando...
                </>
              ) : (
                "Sugerir Parejas"
              )}
            </Button>
          </div>
        )}

        {suggestions && (
          <div>
            <h3 className="font-headline text-xl mb-6 text-left">Mejores Sugerencias para Ti</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((suggestion) => {
                 const athlete = allAthletes.find(a => a.id === suggestion.athleteId);
                 if (!athlete) return null;
                 return (
                    <AthleteCard 
                        key={suggestion.athleteId}
                        athlete={athlete}
                        suggestion={suggestion}
                    />
                 )
              })}
            </div>
             <Button variant="outline" className="mt-8" onClick={() => setSuggestions(null)}>
                Empezar de Nuevo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
