'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

import { useUser, useFirestore, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { PersonalInfoStep } from '@/components/onboarding/personal-info-step';
import { LocationStep } from '@/components/onboarding/location-step';
import { AthleteInfoStep } from '@/components/onboarding/athlete-info-step';
import { ProfilePictureStep } from '@/components/onboarding/profile-picture-step';
import { Loader2 } from 'lucide-react';

const onboardingSchema = z.object({
  // Personal Info
  firstName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  lastName: z.string().min(2, { message: 'El apellido debe tener al menos 2 caracteres.' }),
  idNumber: z.string().regex(/^[0-9]+$/, { message: 'La cédula solo debe contener números.' }),
  phoneNumber: z.string().regex(/^[0-9]+$/, { message: 'El teléfono solo debe contener números.' }),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Debes seleccionar un género.' }),

  // Location
  country: z.string(),
  department: z.string({ required_error: 'Debes seleccionar un departamento.' }),
  city: z.string({ required_error: 'Debes seleccionar una ciudad.' }),
  
  // Athlete Info
  boxAffiliationId: z.string().optional(),
  coachName: z.string().optional(),
  instagramHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),

  // Profile Picture
  profilePicture: z.any().optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const steps = [
  { id: 'personal', title: 'Información Personal', fields: ['firstName', 'lastName', 'idNumber', 'phoneNumber', 'gender'] },
  { id: 'location', title: 'Ubicación', fields: ['department', 'city', 'country'] },
  { id: 'athlete', title: 'Información de Atleta', fields: ['boxAffiliationId', 'coachName', 'instagramHandle', 'tiktokHandle'] },
  { id: 'picture', title: 'Foto de Perfil', fields: ['profilePicture'] },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const methods = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      country: 'Colombia',
      gender: undefined,
      department: undefined,
      city: undefined,
    },
  });

  const { trigger, handleSubmit } = methods;

  const handleNextStep = async () => {
    const fields = steps[currentStep].fields as (keyof OnboardingFormValues)[];
    const isValid = await trigger(fields, { shouldFocus: true });
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data: OnboardingFormValues) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Debes iniciar sesión para completar tu perfil.',
        });
        return;
    }
    
    setIsSubmitting(true);
    
    let profilePictureUrl = user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`;

    try {
      // Handle File Upload
      if (data.profilePicture && data.profilePicture.length > 0) {
          const file = data.profilePicture[0];
          const storage = getStorage();
          const storageRef = ref(storage, `profile-pictures/${user.uid}/${file.name}`);
          
          const snapshot = await uploadBytes(storageRef, file);
          profilePictureUrl = await getDownloadURL(snapshot.ref);
      }

      const userProfileRef = doc(firestore, 'users', user.uid);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { profilePicture, ...profileData } = data; // Exclude profilePicture from Firestore data
      
      const finalProfileData = {
          ...profileData,
          id: user.uid,
          email: user.email,
          profilePictureUrl,
      };

      setDocumentNonBlocking(userProfileRef, finalProfileData, { merge: true });

      // Assign default "Athlete" role
      const athleteRoleRef = collection(firestore, 'athlete_roles');
      addDocumentNonBlocking(athleteRoleRef, {
        athleteId: user.uid,
        roleId: 'role-athlete' // Hardcoded ID for 'Athlete' role
      });


      toast({
          title: '¡Perfil completado!',
          description: 'Bienvenido a WodMatch. Tu perfil ha sido guardado.',
      });
      
      router.push('/dashboard');

    } catch (error) {
        console.error("Error submitting onboarding form:", error);
        toast({
            variant: "destructive",
            title: "Error al guardar perfil",
            description: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
        });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-[calc(100vh-14rem)] container mx-auto flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Progress value={progressValue} className="mb-4" />
          <CardTitle className="font-headline text-2xl">{steps[currentStep].title}</CardTitle>
          <CardDescription>Completa tu perfil para unirte a la comunidad de WodMatch.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 0 && <PersonalInfoStep />}
                  {currentStep === 1 && <LocationStep />}
                  {currentStep === 2 && <AthleteInfoStep />}
                  {currentStep === 3 && <ProfilePictureStep />}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex justify-between">
                {currentStep > 0 ? (
                  <Button type="button" variant="outline" onClick={handlePrevStep} disabled={isSubmitting}>
                    Anterior
                  </Button>
                ) : <div />}
                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={handleNextStep} className="ml-auto">
                    Siguiente
                  </Button>
                ) : (
                  <Button type="submit" className="ml-auto" disabled={isSubmitting}>
                     {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Finalizar
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
