import { CompetitionCard } from "@/components/competition-card";
import { Input } from "@/components/ui/input";
import { competitions } from "@/lib/data";
import { Search } from "lucide-react";

export default function CompetitionsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter text-primary">
          Marketplace de Competencias
        </h1>
        <p className="max-w-2xl mx-auto mt-4 text-foreground/80">
          Encuentra tu próximo desafío. Explora las próximas competencias de CrossFit e inscríbete para competir.
        </p>
      </div>
      
      <div className="mb-8 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar por competencia, ubicación, o fecha..." 
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {competitions.map((comp) => (
          <CompetitionCard key={comp.id} competition={comp} />
        ))}
      </div>
    </div>
  );
}
