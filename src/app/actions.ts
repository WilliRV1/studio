
"use server";

import {
  suggestPartners,
  type SuggestPartnersInput,
  type SuggestPartnersOutput,
} from "@/ai/flows/partner-finder-suggest-partners";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getSdks } from "@/firebase";

import type { AIRequest, Athlete, Competition, Category } from "@/lib/types";
import { z } from "zod";
import { User } from "firebase/auth";

const SuggestPartnersActionSchema = z.object({
  competitionId: z.string(),
  categoryId: z.string(),
  currentUser: z.object({
    uid: z.string(),
    // We only need the UID to exclude the current user from the partner list.
    // The full profile will be fetched from Firestore.
  }),
});

function toAthleteProfile(athlete: Athlete) {
  // Convert personalRecords to a compatible format. If it's a string, we pass it as a special field.
  const prs: Record<string, number> = {};
  if (athlete.personalRecords && typeof athlete.personalRecords === 'object') {
      Object.entries(athlete.personalRecords).forEach(([key, value]) => {
          if (typeof value === 'number') {
              prs[key] = value;
          }
      });
  }

  // TODO: Right now skill level is missing from the Athlete type.
  // We will add a placeholder for now.
  const skillLevel = "Intermediate"; 

  return {
    athleteId: athlete.id,
    skillLevel: skillLevel,
    personalRecords: prs,
    competitionHistory: athlete.competitionHistory || [],
    location: `${athlete.city}, ${athlete.department}`,
    boxAffiliation: athlete.boxAffiliationId || "N/A",
  };
}


export async function findPartnersAction(
  input: z.infer<typeof SuggestPartnersActionSchema>
): Promise<SuggestPartnersOutput | { error: string }> {

  const parsedInput = SuggestPartnersActionSchema.safeParse(input);

  if (!parsedInput.success) {
    return { error: "Entrada inválida." };
  }

  const { competitionId, categoryId, currentUser } = parsedInput.data;
  
  // MOCK data for competition, should be fetched from Firestore in a real scenario
  const competition = { competitionName: "The Titan Games", category: "RX Parejas" }; 
  const { firestore } = getSdks();

  try {
    const usersRef = collection(firestore, 'users');
    // Fetch all users except the current one.
    const q = query(usersRef, where('id', '!=', currentUser.uid));
    const querySnapshot = await getDocs(q);

    const availablePartners: Athlete[] = [];
    let currentUserProfile: Athlete | null = null;
    
    // Also fetch the current user's full profile
    const allUsersSnapshot = await getDocs(collection(firestore, 'users'));
    allUsersSnapshot.forEach(doc => {
      const athleteData = doc.data() as Athlete;
      if (doc.id === currentUser.uid) {
        currentUserProfile = athleteData;
      } else {
        availablePartners.push(athleteData);
      }
    });

    if (!currentUserProfile) {
        return { error: "No se pudo encontrar el perfil del usuario actual." };
    }
    
    if (availablePartners.length === 0) {
        return { error: "No hay otros atletas disponibles para formar pareja en este momento." };
    }

    const aiRequest: AIRequest = {
        athleteProfile: toAthleteProfile(currentUserProfile),
        availablePartners: availablePartners.map(toAthleteProfile),
        competitionDetails: {
            competitionName: competition.competitionName,
            category: competition.category,
        },
    };

    const suggestions = await suggestPartners(aiRequest);
    return suggestions;
  } catch (error) {
    console.error("Error llamando al flujo suggestPartners:", error);
    return { error: "Ocurrió un error inesperado al generar sugerencias." };
  }
}
