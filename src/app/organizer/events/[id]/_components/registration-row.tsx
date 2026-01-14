'use client';

import type { Registration, Athlete, Category } from "@/lib/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RegistrationRowProps {
    registration: Registration;
    athlete?: Athlete;
    category?: Category;
}

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
};

const getStatusText = (status: Registration['paymentStatus']) => {
    switch (status) {
        case 'approved': return 'Aprobado';
        case 'pending_approval': return 'Pend. Aprobación';
        case 'pending_payment': return 'Pend. Pago';
        case 'rejected': return 'Rechazado';
        default: return 'Desconocido';
    }
}

export function RegistrationRow({ registration, athlete, category }: RegistrationRowProps) {
    
    if (!athlete || !category) {
        // You can render a loading state or null
        return (
             <TableRow>
                <TableCell colSpan={5}>Cargando datos de inscripción...</TableCell>
            </TableRow>
        );
    }
    
    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={athlete.profilePictureUrl} alt={athlete.firstName} />
                        <AvatarFallback>{athlete.firstName?.charAt(0)}{athlete.lastName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{athlete.firstName} {athlete.lastName}</div>
                        <div className="text-sm text-muted-foreground hidden md:block">{athlete.email}</div>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="font-medium">{category.name}</div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                 {registration.teamName || <span className="text-muted-foreground/60">N/A</span>}
            </TableCell>
             <TableCell className="text-center">
                <Badge variant={getStatusBadgeVariant(registration.paymentStatus)}>
                    {getStatusText(registration.paymentStatus)}
                </Badge>
            </TableCell>
            <TableCell className="text-right">
                <Button variant="outline" size="sm">
                   Revisar
                </Button>
            </TableCell>
        </TableRow>
    )
}
