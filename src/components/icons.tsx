import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

export const WodMatchLogo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <div className={cn("flex items-center gap-2 text-primary", className)}>
    <Dumbbell className="h-7 w-7" />
    <span className="font-headline text-2xl font-bold tracking-tighter">WodMatch</span>
  </div>
);
