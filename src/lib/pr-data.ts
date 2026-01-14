export type PrCategory = {
  id: 'snatch' | 'clean-jerk' | 'back-squat' | 'deadlift' | 'fran' | 'grace' | 'murph';
  name: string;
  unit: 'kg' | 'min:s';
  type: 'weight' | 'time';
};

export const PR_CATEGORIES: PrCategory[] = [
  { id: 'snatch', name: 'Snatch', unit: 'kg', type: 'weight' },
  { id: 'clean-jerk', name: 'Clean & Jerk', unit: 'kg', type: 'weight' },
  { id: 'back-squat', name: 'Back Squat', unit: 'kg', type: 'weight' },
  { id: 'deadlift', name: 'Deadlift', unit: 'kg', type: 'weight' },
  { id: 'fran', name: 'Fran', unit: 'min:s', type: 'time' },
  { id: 'grace', name: 'Grace', unit: 'min:s', type: 'time' },
  { id: 'murph', name: 'Murph', unit: 'min:s', type: 'time' },
];

export const getPrCategoryById = (id: string): PrCategory | undefined => {
    return PR_CATEGORIES.find(cat => cat.id === id);
}

// Helper function to format PR value based on its unit
export const formatPrValue = (value: number, unit: 'kg' | 'min:s'): string => {
  if (unit === 'kg') {
    return `${value} kg`;
  }
  if (unit === 'min:s') {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  return value.toString();
};
