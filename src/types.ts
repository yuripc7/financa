export type Kind = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  categoryId: string;
  kind: Kind;
  paid: boolean;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  emoji: string;
  color: string;
}

export interface Recurring {
  id: string;
  title: string;
  amount: number;
  day: number;
  categoryId: string;
  kind: Kind;
}

export interface Split {
  id: string;
  title: string;
  total: number;
  with: string[];
  yourShare: number;
  status: 'pending' | 'paid';
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  earned: boolean;
  emoji: string;
}

export interface Profile {
  name: string;
  streakDays: number;
  score: number;
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
  kind: Kind;
  color: string;
}

export interface AppState {
  transactions: Transaction[];
  goals: Goal[];
  recurring: Recurring[];
  splits: Split[];
  achievements: Achievement[];
  profile: Profile;
  onboarded: boolean;
  authed: boolean;
  hideBalance: boolean;
}

export type AppStateUpdate = Partial<AppState> | ((s: AppState) => Partial<AppState>);
