import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CompetitionCard } from "@/components/competition-card";
import { competitions } from "@/lib/data";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const featuredCompetitions = competitions.slice(0, 3);

  return (
    <div className="flex flex-col">
      <section className="w-full py-20 md:py-32 lg:py-40 bg-gray-900/50">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-primary mb-4 animate-fade-in-down">
            WodMatch
          </h1>
          <p className="max-w-[700px] mx-auto text-lg md:text-xl text-foreground/80 mb-8 animate-fade-in-up">
            La plataforma social definitiva para atletas de CrossFit. Encuentra competencias, conecta con parejas y supera tus metas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button asChild size="lg" className="font-bold">
              <Link href="/competitions">
                Buscar una Competencia <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="font-bold">
              <Link href="/dashboard">
                Únete a la Comunidad
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-10">
            Competencias Destacadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCompetitions.map((comp) => (
              <CompetitionCard key={comp.id} competition={comp} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline">
              <Link href="/competitions">
                Explorar Todas las Competencias
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
