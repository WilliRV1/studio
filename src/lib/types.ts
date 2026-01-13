import type { SuggestPartnersInput } from "@/ai/flows/partner-finder-suggest-partners";

export type Athlete = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  idNumber: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  country: string;
  state: string;
  boxAffiliation: string;
  coachName: string;
  socials: {
    instagram?: string;
  };
  skillLevel: 'RX' | 'Intermediate' | 'Scaled';
  personalRecords: Record<string, number | string>;
  competitionHistory: {
    competitionName: string;
    placing: number;
  }[];
};

export type Category = {
  id: string;
  name: string;
  type: 'Individual' | 'Pairs' | 'Team';
  gender: 'Male' | 'Female' | 'Mixed';
  price: number;
  spots: number;
  registeredCount: number;
  requiresPartner: boolean;
};

export type Competition = {
  id: string;
  name: string;
  logoUrl: string;
  bannerUrl: string;
  location: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  description: string;
  rulesUrl?: string;
  categories: Category[];
  organizerId: string;
};

export type Registration = {
  id: string;
  athleteId: string;
  competitionId: string;
  categoryId: string;
  teamName?: string;
  tshirtSize: 'S' | 'M' | 'L' | 'XL';
  paymentStatus: 'pending_payment' | 'pending_approval' | 'approved' | 'rejected';
  paymentProofUrl?: string;
  rejectionReason?: string;
};

export type Workout = {
  id: string;
  name: string;
  description: string;
  movements: string[];
  order: number;
};

export type LeaderboardEntry = {
  rank: number;
  athleteName: string;
  teamName?: string;
  totalPoints: number;
  scores: Record<string, {
    score: string;
    points: number;
  }>;
};

export type AIRequest = SuggestPartnersInput;
