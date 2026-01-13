'use client';

import React, { useMemo, type ReactNode, useEffect } from 'react';
import { FirebaseProvider, useUser } from '@/firebase/provider';
import { initializeFirebase, useFirestore } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

function AuthRedirect({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) return; // Wait until user auth state is resolved

    const authRoutes = ['/login', '/signup'];
    const isOnboarding = pathname === '/onboarding';

    if (user) {
      if (authRoutes.includes(pathname)) {
        router.replace('/dashboard');
        return;
      }
      
      if (!isOnboarding) {
        const userDocRef = doc(firestore, 'users', user.uid);
        getDoc(userDocRef).then(docSnap => {
          if (!docSnap.exists()) {
            // User profile doesn't exist, redirect to onboarding
            router.replace('/onboarding');
          }
        });
      }
    } else {
        // If not logged in and not on a public page, redirect to login
        if (!authRoutes.includes(pathname) && !isOnboarding && pathname !== '/' && !pathname.startsWith('/competitions')) {
            router.replace('/login');
        }
    }
  }, [user, isUserLoading, firestore, router, pathname]);

  return <>{children}</>;
}


export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <AuthRedirect>
        {children}
      </AuthRedirect>
    </FirebaseProvider>
  );
}
