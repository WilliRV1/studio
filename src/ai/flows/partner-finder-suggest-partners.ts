'use server';

/**
 * @fileOverview A partner suggestion AI agent.
 *
 * - suggestPartners - A function that suggests potential partners for an athlete based on their profile.
 * - SuggestPartnersInput - The input type for the suggestPartners function.
 * - SuggestPartnersOutput - The return type for the suggestPartners function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AthleteProfileSchema = z.object({
  athleteId: z.string().describe('The unique identifier of the athlete.'),
  skillLevel: z.string().describe('The skill level of the athlete (e.g., RX, Scaled, Intermediate).'),
  personalRecords: z.record(z.string(), z.number()).describe('A record of the athlete\'s personal records for various exercises.'),
  competitionHistory: z.array(z.object({
    competitionName: z.string().describe('The name of the competition.'),
    placing: z.number().describe('The athlete\'s placing in the competition.'),
  })).describe('The athlete\'s competition history.'),
  location: z.string().describe('The athlete\'s general location (city, state).'),
  boxAffiliation: z.string().describe('The CrossFit box the athlete is affiliated with.'),
});

const SuggestPartnersInputSchema = z.object({
  athleteProfile: AthleteProfileSchema.describe('The profile of the athlete looking for a partner.'),
  availablePartners: z.array(AthleteProfileSchema).describe('A list of available athletes to partner with.'),
  competitionDetails: z.object({
    competitionName: z.string().describe('The name of the competition.'),
    category: z.string().describe('The competition category (e.g., RX Pairs, Scaled Teams).'),
  }).describe('Details about the competition.'),
});
export type SuggestPartnersInput = z.infer<typeof SuggestPartnersInputSchema>;

const SuggestedPartnerSchema = z.object({
  athleteId: z.string().describe('The unique identifier of the suggested partner.'),
  compatibilityScore: z.number().describe('A score indicating how compatible the athletes are (higher is better).'),
  reasoning: z.string().describe('The reasoning behind the compatibility score, explaining why this athlete is a good match.'),
});

const SuggestPartnersOutputSchema = z.object({
  suggestedPartners: z.array(SuggestedPartnerSchema).describe('A list of suggested partners, ranked by compatibility score.'),
});
export type SuggestPartnersOutput = z.infer<typeof SuggestPartnersOutputSchema>;

export async function suggestPartners(input: SuggestPartnersInput): Promise<SuggestPartnersOutput> {
  return suggestPartnersFlow(input);
}

const suggestPartnersPrompt = ai.definePrompt({
  name: 'suggestPartnersPrompt',
  input: {schema: SuggestPartnersInputSchema},
  output: {schema: SuggestPartnersOutputSchema},
  prompt: `You are an AI assistant designed to suggest potential CrossFit partners for athletes.

An athlete is looking for a partner for the following competition:
Competition Name: {{{competitionDetails.competitionName}}}
Category: {{{competitionDetails.category}}}

Here is the athlete's profile:
Athlete ID: {{{athleteProfile.athleteId}}}
Skill Level: {{{athleteProfile.skillLevel}}}
Personal Records: {{{athleteProfile.personalRecords}}}
Competition History: {{{athleteProfile.competitionHistory}}}
Location: {{{athleteProfile.location}}}
Box Affiliation: {{{athleteProfile.boxAffiliation}}}

Here is a list of available partners:
{{#each availablePartners}}
Athlete ID: {{{athleteId}}}
Skill Level: {{{skillLevel}}}
Personal Records: {{{personalRecords}}}
Competition History: {{{competitionHistory}}}
Location: {{{location}}}
Box Affiliation: {{{boxAffiliation}}}
{{/each}}

Based on the athlete's profile and the list of available partners, suggest the best partners for the athlete.
Consider factors such as skill level, personal records, competition history, location, and box affiliation.
Explain the reasoning behind each suggestion and provide a compatibility score (out of 100) for each partner.

Format your output as a JSON object with a "suggestedPartners" array. Each element in the array should include the athleteId, compatibilityScore, and reasoning.
`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const suggestPartnersFlow = ai.defineFlow(
  {
    name: 'suggestPartnersFlow',
    inputSchema: SuggestPartnersInputSchema,
    outputSchema: SuggestPartnersOutputSchema,
  },
  async input => {
    const {output} = await suggestPartnersPrompt(input);
    return output!;
  }
);
