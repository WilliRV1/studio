import { currentUser, competitions, registrations } from "@/lib/data";
import { Athlete, Registration } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const getStatusBadgeVariant = (status: Registration['paymentStatus']) => {
  switch (status) {
    case 'approved':
      return 'default';
    case 'pending_approval':
      return 'secondary';
    case 'pending_payment':
      return 'outline';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function DashboardPage() {
  const userRegistrations = registrations.filter(r => r.athleteId === currentUser.id);

  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center items-center relative">
               <Button variant="ghost" size="icon" className="absolute top-4 right-4">
                  <Edit className="h-4 w-4" />
               </Button>
              <Avatar className="h-24 w-24 mb-4 border-4 border-primary">
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-2xl">{currentUser.name}</CardTitle>
              <CardDescription>
                <Badge variant="outline" className="uppercase font-mono">{currentUser.skillLevel}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground"/>
                    <span>{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground"/>
                    <span>{currentUser.phone}</span>
                </div>
                 <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground"/>
                    <span>{currentUser.boxAffiliation}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Instagram className="h-4 w-4 text-muted-foreground"/>
                    <a href={`https://instagram.com/${currentUser.socials.instagram}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        @{currentUser.socials.instagram}
                    </a>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* My Competitions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">My Competitions</CardTitle>
              <CardDescription>Manage your event registrations and payments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {userRegistrations.length > 0 ? userRegistrations.map(reg => {
                  const comp = competitions.find(c => c.id === reg.competitionId);
                  if (!comp) return null;

                  return (
                    <div key={reg.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
                      <div>
                        <h3 className="font-bold">{comp.name}</h3>
                        <p className="text-sm text-muted-foreground">{reg.teamName || 'Individual'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={getStatusBadgeVariant(reg.paymentStatus)} className="capitalize">
                            {reg.paymentStatus.replace('_', ' ')}
                        </Badge>
                         <Button variant="secondary" size="sm">Manage</Button>
                      </div>
                    </div>
                  )
                }) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">You haven't registered for any competitions yet.</p>
                        <Button asChild>
                            <a href="/competitions">Find a Competition</a>
                        </Button>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
