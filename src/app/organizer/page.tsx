import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function OrganizerPage() {
  return (
    <div className="container mx-auto py-8 md:py-12">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter text-primary">
            Organizer Dashboard
            </h1>
            <p className="max-w-2xl mx-auto mt-4 text-foreground/80">
            Create, manage, and run your CrossFit competitions with ease.
            </p>
        </div>

        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline">My Events</CardTitle>
                <CardDescription>A list of competitions you are organizing.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Create Your First Competition</h3>
                    <p className="text-muted-foreground mb-6">Get started by setting up your next great event.</p>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Event
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
