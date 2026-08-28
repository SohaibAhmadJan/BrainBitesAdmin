export interface MasteryInfo {
  level: number;
  title: string;
  color: string;
}

export const calculateMastery = (factsRead: number): MasteryInfo => {
  if (factsRead >= 100) return { level: 10, title: 'Insight Master', color: 'text-brand-primary' };
  if (factsRead >= 80) return { level: 9, title: 'Sage', color: 'text-brand-primary' };
  if (factsRead >= 60) return { level: 8, title: 'Philosopher', color: 'text-brand-primary' };
  if (factsRead >= 50) return { level: 7, title: 'Thinker', color: 'text-brand-primary' };
  if (factsRead >= 40) return { level: 6, title: 'Researcher', color: 'text-brand-primary' };
  if (factsRead >= 30) return { level: 5, title: 'Scholar', color: 'text-brand-primary' };
  if (factsRead >= 20) return { level: 4, title: 'Explorer', color: 'text-brand-primary' };
  if (factsRead >= 10) return { level: 3, title: 'Learner', color: 'text-brand-primary' };
  if (factsRead >= 5) return { level: 2, title: 'Curious', color: 'text-brand-primary' };
  return { level: 1, title: 'Novice', color: 'text-sub' };
};
