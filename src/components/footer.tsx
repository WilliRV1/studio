import { WodMatchLogo } from "./icons";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-6">
      <div className="container flex items-center justify-between">
        <WodMatchLogo className="text-foreground/60" />
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} WodMatch. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
