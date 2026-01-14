'use client';

import { useState } from 'react';
import type { Registration, Athlete } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { doc } from 'firebase/firestore';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Loader2, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

interface ReviewRegistrationDialogProps {
  registration: Registration;
  athlete: Athlete;
}

export function ReviewRegistrationDialog({ registration, athlete }: ReviewRegistrationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const firestore = useFirestore();
  const { toast } = useToast();

  const handleUpdateStatus = (status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !rejectionReason) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debes proporcionar un motivo de rechazo.' });
      return;
    }
    
    setIsSubmitting(true);
    const registrationRef = doc(firestore, 'registrations', registration.id);

    const updateData: { paymentStatus: string; rejectionReason?: string } = {
        paymentStatus: status,
    };

    if (status === 'rejected') {
        updateData.rejectionReason = rejectionReason;
    }

    try {
        updateDocumentNonBlocking(registrationRef, updateData);
        toast({ title: 'Actualizado', description: `La inscripción ha sido ${status === 'approved' ? 'aprobada' : 'rechazada'}.` });
        setIsOpen(false);
        setShowRejectionForm(false);
        setRejectionReason('');
    } catch(error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar la inscripción.' });
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (registration.paymentStatus !== 'pending_approval') {
    return (
        <Button variant="outline" size="sm" disabled>Revisar</Button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Revisar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Revisar Pago</DialogTitle>
          <DialogDescription>Verifica el comprobante y actualiza el estado de la inscripción.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Athlete Info */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={athlete.profilePictureUrl} />
                        <AvatarFallback>{athlete.firstName?.[0]}{athlete.lastName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-lg">{athlete.firstName} {athlete.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{athlete.email}</p>
                    </div>
                </div>
                <div className="text-sm space-y-1">
                    <p><span className="font-semibold">Equipo:</span> {registration.teamName || 'N/A'}</p>
                    <p><span className="font-semibold">Talla Camiseta:</span> {registration.tshirtSize}</p>
                </div>
            </div>

            {/* Payment Proof */}
            <div className="space-y-3">
                <h4 className="font-semibold">Comprobante de Pago</h4>
                {registration.paymentProofUrl ? (
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                        <img 
                            src={registration.paymentProofUrl} 
                            alt="Comprobante de pago" 
                            className="object-contain w-full h-full"
                        />
                         <Button size="icon" className="absolute top-2 right-2" asChild>
                            <Link href={registration.paymentProofUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4"/>
                            </Link>
                         </Button>
                    </div>
                ): (
                    <Alert variant="destructive">
                        <AlertTitle>Sin Comprobante</AlertTitle>
                        <AlertDescription>El atleta no ha subido un comprobante de pago.</AlertDescription>
                    </Alert>
                )}
            </div>
        </div>

        {showRejectionForm && (
            <div className="space-y-2 pt-4 border-t">
                <label htmlFor="rejectionReason" className="font-medium">Motivo del Rechazo</label>
                <Textarea 
                    id="rejectionReason"
                    placeholder="Ej: El comprobante no es legible, el monto es incorrecto..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                />
            </div>
        )}

        <DialogFooter className="pt-6">
            <DialogClose asChild>
                <Button type="button" variant="ghost">Cancelar</Button>
            </DialogClose>
            {isSubmitting ? (
                 <Button disabled><Loader2 className="animate-spin h-4 w-4" /> Procesando...</Button>
            ) : showRejectionForm ? (
                 <Button variant="destructive" onClick={() => handleUpdateStatus('rejected')} disabled={!rejectionReason}>
                    <X className="mr-2" /> Confirmar Rechazo
                </Button>
            ) : (
                <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => setShowRejectionForm(true)}>
                        <X className="mr-2" /> Rechazar
                    </Button>
                    <Button onClick={() => handleUpdateStatus('approved')}>
                        <Check className="mr-2" /> Aprobar Pago
                    </Button>
                </div>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
