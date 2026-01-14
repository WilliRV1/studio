
import type { Athlete, Registration, LeaderboardEntry } from './types';

// This file now contains only mock data that is not related to competitions,
// as competition data is now fetched directly from Firestore.

export const registrations: Registration[] = [
    {
        id: 'reg-001',
        athleteId: 'ath-001',
        competitionId: 'comp-001',
        categoryId: 'cat-001',
        teamName: 'Titan Slayers',
        tshirtSize: 'L',
        paymentStatus: 'approved',
        paymentProofUrl: '/path/to/proof.jpg'
    },
    {
        id: 'reg-002',
        athleteId: 'ath-002',
        competitionId: 'comp-002',
        categoryId: 'cat-004',
        tshirtSize: 'M',
        paymentStatus: 'pending_approval',
        paymentProofUrl: '/path/to/proof2.jpg'
    },
    {
        id: 'reg-003',
        athleteId: 'ath-003',
        competitionId: 'comp-001',
        categoryId: 'cat-002',
        tshirtSize: 'M',
        paymentStatus: 'pending_payment',
    }
];

export const leaderboardData: LeaderboardEntry[] = [
  {
    rank: 1,
    athleteName: "Alex Johnson & Maria Garcia",
    teamName: "Power Couple",
    totalPoints: 385,
    scores: { 'WOD 1': { score: '10:32', points: 100 }, 'WOD 2': { score: '250 reps', points: 95 }, 'WOD 3': { score: '12:15', points: 95 } }
  },
  {
    rank: 2,
    athleteName: "Carlos Perez & Sofia Rodriguez",
    teamName: "Grit & Grace",
    totalPoints: 380,
    scores: { 'WOD 1': { score: '11:01', points: 95 }, 'WOD 2': { score: '255 reps', points: 100 }, 'WOD 3': { score: '12:05', points: 100 } }
  },
  {
    rank: 3,
    athleteName: "Daniel Kim & Partner",
    teamName: "Lift Heavy",
    totalPoints: 350,
    scores: { 'WOD 1': { score: '11:30', points: 90 }, 'WOD 2': { score: '240 reps', points: 90 }, 'WOD 3': { score: '13:00', points: 90 } }
  },
];
