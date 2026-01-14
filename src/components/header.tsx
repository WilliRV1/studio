"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";

import { WodMatchLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { getAuth, signOut } from "firebase/auth";
import { collection, query, where } from "firebase/firestore";


const navLinks = [
  { href: "/competitions", label: "Competencias" },
  { href: "/dashboard", label: "Dashboard", roles: ["Athlete", "Organizer", "Administrator"] },
  { href: "/organizer", label: "Organizador", roles: ["Organizer", "Administrator"] },
];

export function Header() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = getAuth();
  const firestore = useFirestore();

  const userRolesRef = useMemoFirebase(() => {
    // CRÍTICO: No construir la query hasta que 'user' esté definido.
    if (!firestore || !user?.uid) {
      return null;
    }
    return query(collection(firestore, 'athlete_roles'), where('athleteId', '==', user.uid));
  }, [firestore, user]);

  const { data: userRoles } = useCollection(userRolesRef);
  
  const hasOrganizerRole = userRoles?.some(role => role.roleId === 'role-organizer' || role.roleId === 'role-admin');

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const filteredNavLinks = navLinks.filter(link => {
    if (!link.roles) return true; // Public link
    if (!user) return false; // Protected link requires user
    if (link.href === '/organizer') return hasOrganizerRole;
    return true; // For other roles or general dashboard
  });


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <WodMatchLogo />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-foreground/60"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <Link href="/">
              <WodMatchLogo />
            </Link>
            <div className="flex flex-col space-y-4 mt-6">
              {filteredNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "transition-colors hover:text-primary text-lg",
                     pathname === link.href ? "text-primary" : "text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
             {/* Could be a search bar */}
          </div>
          <nav className="flex items-center">
             <div className="flex items-center gap-4">
              {isUserLoading ? (
                <div className="h-9 w-24 rounded-md animate-pulse bg-muted" />
              ) : user ? (
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Avatar className="h-9 w-9 cursor-pointer">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || ''} />
                        <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                      </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/profile">Ajustes de Perfil</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Iniciar Sesión</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/signup">Regístrate</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
