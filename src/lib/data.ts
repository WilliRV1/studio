import type { Athlete, Registration, LeaderboardEntry } from './types';

export const athletes: Athlete[] = [
  {
    id: 'ath-001',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatarUrl: 'https://picsum.photos/seed/avatar1/200/200',
    idNumber: '123456789',
    phone: '555-0101',
    gender: 'Male',
    country: 'Colombia',
    state: 'Antioquia',
    boxAffiliation: 'CrossFit Medellín',
    coachName: 'Coach Rico',
    socials: { instagram: 'alexj_fit' },
    skillLevel: 'RX',
    personalRecords: {
      'Clean & Jerk': 140,
      'Snatch': 115,
      'Deadlift': 220,
      'Fran': '2:15',
    },
    competitionHistory: [{ competitionName: 'Wodapalooza', placing: 25 }],
  },
  {
    id: 'ath-002',
    name: 'Maria Garcia',
    email: 'maria@example.com',
    avatarUrl: 'https://picsum.photos/seed/avatar2/200/200',
    idNumber: '987654321',
    phone: '555-0102',
    gender: 'Female',
    country: 'Colombia',
    state: 'Cundinamarca',
    boxAffiliation: 'CrossFit Bogotá',
    coachName: 'Coach Diaz',
    socials: { instagram: 'mariag_strong' },
    skillLevel: 'RX',
     personalRecords: {
      'Clean & Jerk': 90,
      'Snatch': 70,
      'Deadlift': 150,
      'Fran': '2:50',
    },
    competitionHistory: [{ competitionName: 'Bogota Fitness Challenge', placing: 3 }],
  },
  {
    id: 'ath-003',
    name: 'Carlos Perez',
    email: 'carlos@example.com',
    avatarUrl: 'https://picsum.photos/seed/avatar3/200/200',
    idNumber: '555555555',
    phone: '555-0103',
    gender: 'Male',
    country: 'Colombia',
    state: 'Antioquia',
    boxAffiliation: 'CrossFit Medellín',
    coachName: 'Coach Rico',
    socials: { instagram: 'cperez_fit' },
    skillLevel: 'Intermediate',
    personalRecords: {
      'Clean & Jerk': 110,
      'Snatch': 90,
      'Deadlift': 180,
      'Fran': '3:30',
    },
    competitionHistory: [{ competitionName: 'Medellin Throwdown', placing: 10 }],
  },
  {
    id: 'ath-004',
    name: 'Sofia Rodriguez',
    email: 'sofia@example.com',
    avatarUrl: 'https://picsum.photos/seed/avatar4/200/200',
    idNumber: '444444444',
    phone: '555-0104',
    gender: 'Female',
    country: 'Colombia',
    state: 'Valle del Cauca',
    boxAffiliation: 'CrossFit Cali',
    coachName: 'Coach Vega',
    socials: { instagram: 'sofia.lifts' },
    skillLevel: 'RX',
     personalRecords: {
      'Clean & Jerk': 95,
      'Snatch': 75,
      'Deadlift': 160,
      'Fran': '2:45',
    },
    competitionHistory: [{ competitionName: 'Cali Fitness Festival', placing: 1 }],
  },
   {
    id: 'ath-005',
    name: 'Daniel Kim',
    email: 'daniel@example.com',
    avatarUrl: 'https://picsum.photos/seed/avatar5/200/200',
    idNumber: '333333333',
    phone: '555-0105',
    gender: 'Male',
    country: 'Colombia',
    state: 'Antioquia',
    boxAffiliation: 'CrossFit Envigado',
    coachName: 'Coach Santos',
    socials: { instagram: 'dk_fit' },
    skillLevel: 'RX',
    personalRecords: {
      'Clean & Jerk': 135,
      'Snatch': 110,
      'Deadlift': 210,
      'Fran': '2:25',
    },
    competitionHistory: [{ competitionName: 'Medellin Throwdown', placing: 5 }],
  },
  {
    id: 'ath-006',
    name: 'Laura Chen',
    email: 'laura@example.com',
    avatarUrl: 'https://picsum.photos/seed/avatar6/200/200',
    idNumber: '222222222',
    phone: '555-0106',
    gender: 'Female',
    country: 'Colombia',
    state: 'Cundinamarca',
    boxAffiliation: 'CrossFit Bogotá',
    coachName: 'Coach Diaz',
    socials: { instagram: 'laurachenfit' },
    skillLevel: 'Scaled',
    personalRecords: {
      'Clean & Jerk': 60,
      'Snatch': 45,
      'Deadlift': 100,
      'Fran': '5:00',
    },
    competitionHistory: [],
  },
];


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


export const currentUser: Athlete = athletes[0];
