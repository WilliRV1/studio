"use server";

import {
  suggestPartners,
  type SuggestPartnersInput,
  type SuggestPartnersOutput,
} from "@/ai/flows/partner-finder-suggest-partners";
import { athletes, currentUser } from "@/lib/data";
import type { AIRequest, Athlete, Competition, Category } from "@/lib/types";
import { z } from "zod";

const SuggestPartnersActionSchema = z.object({
  competitionId: z.string(),
  categoryId: z.string(),
});

function toAthleteProfile(athlete: Athlete) {
  return {
    athleteId: athlete.id,
    skillLevel: athlete.skillLevel,
    personalRecords: athlete.personalRecords,
    competitionHistory: athlete.competitionHistory,
    location: `${athlete.state}, ${athlete.country}`,
    boxAffiliation: athlete.boxAffiliation,
  };
}


export async function findPartnersAction(
  input: z.infer<typeof SuggestPartnersActionSchema>
): Promise<SuggestPartnersOutput | { error: string }> {

  const parsedInput = SuggestPartnersActionSchema.safeParse(input);

  if (!parsedInput.success) {
    return { error: "Invalid input." };
  }

  const { competitionId, categoryId } = parsedInput.data;
  const competition = { competitionName: "The Titan Games", category: "RX Pairs" }; // MOCK

  try {
    // In a real app, you would filter available partners based on the competition and category,
    // and whether they are also looking for a partner.
    const availablePartners = athletes.filter(a => a.id !== currentUser.id);

    const aiRequest: AIRequest = {
        athleteProfile: toAthleteProfile(currentUser),
        availablePartners: availablePartners.map(toAthleteProfile),
        competitionDetails: {
            competitionName: competition.competitionName,
            category: competition.category,
        },
    };

    const suggestions = await suggestPartners(aiRequest);
    return suggestions;
  } catch (error) {
    console.error("Error calling suggestPartners flow:", error);
    return { error: "An unexpected error occurred while generating suggestions." };
  }
}
