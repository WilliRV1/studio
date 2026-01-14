import type { SuggestPartnersInput } from "@/ai/flows/partner-finder-suggest-partners";
import type { Timestamp } from "firebase/firestore";

export type Athlete = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  phoneNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  country: string;
  department: string;
  city: string;
  boxAffiliationId?: string;
  coachName?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  profilePictureUrl: string;
  personalRecords?: Record<string, number | string>;
  competitionHistory?: {
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

export type Workout = {
  id: string;
  name: string;
  description: string;
  type: 'For Time' | 'AMRAP' | 'EMOM' | 'Max Weight';
  order: number;
};

export type Competition = {
  id: string;
  name: string;
  bannerUrl: string;
  location: string;
  startDate: Timestamp;
  endDate: Timestamp;
  registrationStartDate: Timestamp;
  registrationEndDate: Timestamp;
  description: string;
  rulesUrl?: string;
  categories: Category[];
  workouts: Workout[];
  organizerId: string;
  createdAt: Timestamp;
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
  registeredAt: Timestamp;
};

export type Score = {
  id: string;
  competitionId: string;
  wodId: string;
  athleteId: string;
  result: number; // For simplicity, we'll use numbers (seconds for time, reps for amrap)
  points: number;
  submittedAt: Timestamp;
};

export type LeaderboardEntry = {
  id: string; // Corresponds to athleteId
  athleteId: string;
  athleteName: string;
  profilePictureUrl: string;
  totalPoints: number;
  rank: number;
  scores: {
    [wodId: string]: {
      result: number;
      points: number;
      rank: number;
    }
  }
};


export type AIRequest = SuggestPartnersInput;

    