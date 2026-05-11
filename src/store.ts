import { useEffect, useState } from 'react';
import type { AppState, AppStateUpdate, Transaction, Goal, Category } from './types';

// v3 = dados zerados para uso real
const STORAGE_KEY = 'fnz_store_v3';

export const CATEGORIES: Category[] = [
  { id: 'salario',     label: 'Salario',       emoji: '💼', kind: 'income',  color: '#1d6f3c' },
  { id: 'freela',      label: 'Freela',        emoji: '🧾', kind: 'income',  color: '#2a6fdb' },
  { id: 'invest',      label: 'Investimentos', emoji: '📈', kind: 'income',  color: '#5b3aa6' },
  { id: 'mercado',     label: 'Mercado',       emoji: '🛒', kind: 'expense', color: '#ff5b1f' },
  { id: 'restaurante', label: 'Restaurante',   emoji: '🍽️', kind: 'expense', color: '#c89a3a' },
  { id: 'transporte',  label: 'Transporte',    emoji: '🚗', kind: 'expense', color: '#2a6fdb' },
  { id: 'moradia',     label: 'Moradia',       emoji: '🏠', kind: 'expense', color: '#5b3aa6' },
  { id: 'lazer',       label: 'Lazer',         emoji: '🎬', kind: 'expense', color: '#e35aa2' },
  { id: 'saude',       label: 'Saude',         emoji: '💊', kind: 'expense', color: '#1d8a8a' },
  { id: 'educacao',    label: 'Educacao',      emoji: '📚', kind: 'expense', color: '#7a5a3a' },
  { id: 'assinatura',  label: 'Assinaturas',   emoji: '🔁', kind: 'expense', color: '#c0341d' },
  { id: 'pet',         label: 'Pet',           emoji: '🐾', kind: 'expense', color: '#a85a3a' },
  { id: 'outros',      label: 'Outros',        emoji: '✦',  kind: 'expense', color: '#6e6a5d' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c])) as Record<string, Category>;

const KEYWORDS: Record<string, string[]> = {
  mercado:     ['mercado','supermercado','extra','carrefour','assai','feira','padaria'],
  restaurante: ['ifood','rappi','restaurante','lanche','mc','mcdonald','burger','cafe','starbucks','pizza'],
  transporte:  ['uber','99','taxi','gasolina','posto','metro','onibus','estacionamento'],
  moradia:     ['aluguel','condominio','iptu','luz','enel','agua','gas','internet','vivo','claro'],
  lazer:       ['cinema','show','ingresso','spotify','netflix','disney','hbo','prime'],
  saude:       ['farmacia','drogaria','consulta','plano de saude','unimed','amil','academia'],
  educacao:    ['curso','faculdade','livro','udemy','coursera'],
  assinatura:  ['assinatura','mensalidade'],
  pet:         ['pet','racao','veterinario'],
  salario:     ['salario','pagamento'],
  freela:      ['freela','projeto'],
  invest:      ['dividendo','rendimento','tesouro','cdb'],
};

export function guessCategory(desc: string): string | null {
  const s = (desc || '').toLowerCase();
  for (const [cat, keys] of Object.entries(KEYWORDS)) {
    if (keys.some(k => s.includes(k))) return cat;
  }
  return null;
}

function generateInitialState(): AppState {
  return {
    transactions: [],
    goals: [],
    recurring: [],
    splits: [],
    achievements: [
      { id:'a1', title:'Primeiro lancamento', desc:'Adicione seu primeiro lancamento',        earned:false, emoji:'✨' },
      { id:'a2', title:'Primeira meta',        desc:'Crie sua primeira meta financeira',       earned:false, emoji:'🎯' },
      { id:'a3', title:'Mes no azul',          desc:'Termine o mes com saldo positivo',        earned:false, emoji:'🌊' },
      { id:'a4', title:'Meta concluida',        desc:'Conclua uma meta financeira',             earned:false, emoji:'🏆' },
      { id:'a5', title:'Reserva completa',      desc:'Complete sua reserva de emergencia',      earned:false, emoji:'🛡️' },
      { id:'a6', title:'Investidor',            desc:'Registre seu primeiro investimento',      earned:false, emoji:'📈' },
    ],
    profile: { name: '', streakDays: 0, score: 0 },
    onboarded: false,
    authed: false,
    hideBalance: false,
    currentUser: null,
    budgetLimits: [],
    theme: 'light',
  };
}

type Listener = (state: AppState) => void;

const store = {
  state: null as AppState | null,
  listeners: new Set<Listener>(),

  init() {
    if (this.state) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.currentUser)   parsed.currentUser = null;
        if (!parsed.budgetLimits)  parsed.budgetLimits = [];
        if (!parsed.theme)         parsed.theme = 'light';
        if (!parsed.achievements)  parsed.achievements = generateInitialState().achievements;
        this.state = parsed;
        return;
      }
    } catch {}
    this.state = generateInitialState();
  },

  get(): AppState {
    if (!this.state) this.init();
    return this.state!;
  },

  set(patch: AppStateUpdate) {
    const current = this.get();
    const resolved = typeof patch === 'function' ? patch(current) : patch;
    this.state = { ...current, ...resolved };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); } catch {}
    this.listeners.forEach(fn => fn(this.state!));
  },

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  },

  addTransaction(tx: Omit<Transaction, 'id' | 'paid'>) {
    const newTx = { id: 't' + Date.now(), paid: true, ...tx };
    this.set({ transactions: [newTx, ...this.get().transactions] });
    // Unlock first transaction achievement
    const state = this.get();
    if (!state.achievements.find(a=>a.id==='a1')?.earned) {
      this.set({ achievements: state.achievements.map(a => a.id==='a1'?{...a,earned:true}:a) });
    }
  },

  removeTransaction(id: string) {
    this.set({ transactions: this.get().transactions.filter(t => t.id !== id) });
  },

  updateGoal(id: string, patch: Partial<Goal>) {
    this.set({ goals: this.get().goals.map(g => g.id === id ? { ...g, ...patch } : g) });
  },

  addGoal(g: Omit<Goal, 'id' | 'current'>) {
    const newGoal = { id: 'g' + Date.now(), current: 0, ...g };
    this.set({ goals: [...this.get().goals, newGoal] });
    // Unlock first goal achievement
    const state = this.get();
    if (!state.achievements.find(a=>a.id==='a2')?.earned) {
      this.set({ achievements: state.achievements.map(a => a.id==='a2'?{...a,earned:true}:a) });
    }
  },

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = generateInitialState();
    this.listeners.forEach(fn => fn(this.state!));
  },
};

export function useStore(): [AppState, typeof store] {
  store.init();
  const [state, setState] = useState<AppState>(store.get());
  useEffect(() => {
    const unsub = store.subscribe(setState);
    return unsub;
  }, []);
  return [state, store];
}

export { store };
