'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Registration, Competition, Category } from '@/lib/types';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

interface RegistrationManagementDialogProps {
  registration: Registration;
  competition?: Competition | null;
  category?: Category | null;
  children: React.ReactNode;
}

const getStatusInfo = (status: Registration['paymentStatus']) => {
    switch(status) {
        case 'pending_payment':
            return { icon: <AlertCircle className="h-5 w-5 text-yellow-500" />, text: "Pendiente de Pago", description: "Debes subir tu comprobante de pago para asegurar tu cupo." };
        case 'pending_approval':
            return { icon: <Clock className="h-5 w-5 text-blue-500" />, text: "Pendiente de Aprobación", description: "Tu comprobante fue recibido y está siendo revisado por el organizador." };
        case 'approved':
            return { icon: <CheckCircle className="h-5 w-5 text-green-500" />, text: "Aprobado", description: "¡Tu pago ha sido confirmado! Estás oficialmente inscrito." };
        case 'rejected':
            return { icon: <AlertCircle className="h-5 w-5 text-red-500" />, text: "Rechazado", description: "Hubo un problema con tu pago. Revisa el motivo y vuelve a intentarlo." };
        default:
            return { icon: <AlertCircle className="h-5 w-5" />, text: "Desconocido", description: "" };
    }
}


export function RegistrationManagementDialog({ registration, competition, category, children }: RegistrationManagementDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPaymentProofFile(null);
      return;
    };

     // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'Archivo muy grande', 
                description: 'El tamaño máximo del comprobante es 5MB' });
        event.target.value = ''; // Clear the input
        setPaymentProofFile(null);
        return;
    }
    
    // Validar formato
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        toast({ variant: 'destructive', title: 'Formato inválido', description: "Solo se aceptan archivos JPG, PNG o PDF." });
        event.target.value = '';
        setPaymentProofFile(null);
        return;
    }

    setPaymentProofFile(file);
  };

  const handleUploadProof = async () => {
    if (!paymentProofFile) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, selecciona un archivo.' });
        return;
    }
    if (!registration) {
         toast({ variant: 'destructive', title: 'Error', description: 'Inscripción no encontrada.' });
        return;
    }
    
    setIsSubmitting(true);
    
    try {
        const storage = getStorage();
        const storageRef = ref(storage, `payment-proofs/${registration.competitionId}/${registration.athleteId}/${paymentProofFile.name}`);
        
        const snapshot = await uploadBytes(storageRef, paymentProofFile);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const registrationRef = doc(firestore, 'registrations', registration.id);
        
        updateDocumentNonBlocking(registrationRef, {
            paymentProofUrl: downloadURL,
            paymentStatus: 'pending_approval',
            rejectionReason: '', // Clear previous rejection reason if any
        });
        
        toast({
            title: '¡Comprobante subido!',
            description: 'Tu pago está pendiente de aprobación por el organizador.',
        });
        
        setIsOpen(false);
        setPaymentProofFile(null);


    } catch (error) {
        console.error("Error uploading payment proof:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo subir el comprobante.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const statusInfo = getStatusInfo(registration.paymentStatus);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Gestionar Inscripción</DialogTitle>
          <DialogDescription>
            {competition?.name} - {category?.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                {statusInfo.icon}
                <div>
                    <h4 className="font-bold">{statusInfo.text}</h4>
                    <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
                </div>
            </div>

             {registration.paymentStatus === 'rejected' && registration.rejectionReason && (
                 <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg">
                    <p className="text-sm text-destructive font-bold">Motivo del rechazo:</p>
                    <p className="text-sm text-foreground/80">{registration.rejectionReason}</p>
                 </div>
            )}
            
             {registration.paymentStatus === 'pending_approval' && registration.paymentProofUrl && (
                <div className="space-y-2">
                    <h4 className="font-medium">Comprobante Enviado</h4>
                    <Button variant="outline" asChild>
                        <Link href={registration.paymentProofUrl} target="_blank" rel="noopener noreferrer">
                           Ver Comprobante <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            )}

            {category && (
                 <div className="flex justify-between items-center text-lg border-t border-b py-3">
                    <span className="font-semibold text-muted-foreground">Total a Pagar:</span>
                    <span className="font-bold text-primary text-2xl">
                        {category.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                    </span>
                </div>
            )}

             {(registration.paymentStatus === 'pending_payment' || registration.paymentStatus === 'rejected') && (
                 <div className="space-y-3">
                    <label htmlFor="payment-proof" className="font-medium">Sube tu comprobante</label>
                    <Input id="payment-proof" type="file" onChange={handleFileChange} accept="image/png, image/jpeg, application/pdf" />
                     {isSubmitting && <Progress value={33} className="w-[60%]" />}
                     <Button onClick={handleUploadProof} disabled={isSubmitting || !paymentProofFile} className="w-full">
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...</> : <><Upload className="mr-2 h-4 w-4" /> Enviar Comprobante</>}
                    </Button>
                </div>
            )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
