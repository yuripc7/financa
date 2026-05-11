import { useEffect, useState } from 'react';
import type { AppState, AppStateUpdate, Transaction, Goal, Category } from './types';

const STORAGE_KEY = 'fnz_store_v2';

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

function makeTx(daysAgo: number, amount: number, desc: string, catId: string, kind: 'income' | 'expense', idSeed: number): Transaction {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return { id: 't' + idSeed, date: d.toISOString(), amount, description: desc, categoryId: catId, kind, paid: true };
}

function generateTransactions(): Transaction[] {
  const tx: Transaction[] = [];
  let s = 1;
  const p = (da: number, amt: number, desc: string, cat: string, kind: 'income' | 'expense') =>
    tx.push(makeTx(da, amt, desc, cat, kind, s++));
  p(2,8500,'Salario Outubro','salario','income');
  p(8,1200,'Freela design','freela','income');
  p(15,320,'Dividendos ITSA4','invest','income');
  p(0,89.50,'iFood - Janta','restaurante','expense');
  p(0,32.40,'Uber','transporte','expense');
  p(1,245.80,'Mercado Extra','mercado','expense');
  p(1,18.90,'Cafe Starbucks','restaurante','expense');
  p(2,1850,'Aluguel','moradia','expense');
  p(2,280,'Conta de luz Enel','moradia','expense');
  p(3,49.90,'Spotify Premium','lazer','expense');
  p(3,39.90,'Netflix','lazer','expense');
  p(4,156.70,'Farmacia Pacheco','saude','expense');
  p(5,420.30,'Mercado Carrefour','mercado','expense');
  p(6,78,'Posto Shell','transporte','expense');
  p(7,32,'Cinema','lazer','expense');
  p(8,145.50,'Restaurante japones','restaurante','expense');
  p(9,120,'Internet Vivo Fibra','moradia','expense');
  p(10,89.90,'Curso Udemy React','educacao','expense');
  p(11,67.40,'Padaria','mercado','expense');
  p(12,220,'Pet shop racao','pet','expense');
  p(13,38.50,'Uber','transporte','expense');
  p(14,178,'Mercado Pao de Acucar','mercado','expense');
  p(16,450,'Consulta medica','saude','expense');
  p(18,95,'Show indie rock','lazer','expense');
  p(20,312,'Mercado Extra','mercado','expense');
  p(22,64.50,'99 corrida','transporte','expense');
  p(25,128,'Restaurante italiano','restaurante','expense');
  p(35,8500,'Salario Setembro','salario','income');
  p(40,800,'Freela logo','freela','income');
  p(32,1850,'Aluguel','moradia','expense');
  p(34,195,'Mercado','mercado','expense');
  p(36,98,'Restaurante','restaurante','expense');
  p(38,280,'Conta de luz','moradia','expense');
  p(42,320,'Mercado','mercado','expense');
  p(45,156,'Farmacia','saude','expense');
  p(50,89.90,'Cursos','educacao','expense');
  p(55,245,'Restaurante','restaurante','expense');
  return tx;
}

function generateGoals(): Goal[] {
  return [
    { id:'g1', title:'Reserva de emergencia', target:30000, current:18750, deadline:'2026-06-01', emoji:'🛡️', color:'#1d6f3c' },
    { id:'g2', title:'Viagem Japao',          target:18000, current:6420,  deadline:'2026-09-01', emoji:'🗾', color:'#c0341d' },
    { id:'g3', title:'MacBook Pro novo',       target:22000, current:14300, deadline:'2026-03-01', emoji:'💻', color:'#5b3aa6' },
    { id:'g4', title:'Curso Mestrado',         target:12000, current:12000, deadline:'2025-12-01', emoji:'🎓', color:'#c89a3a' },
  ];
}

function generateInitialState(): AppState {
  return {
    transactions: generateTransactions(),
    goals: generateGoals(),
    recurring: [
      { id:'r1', title:'Aluguel',       amount:1850,  day:5,  categoryId:'moradia', kind:'expense' },
      { id:'r2', title:'Salario',       amount:8500,  day:1,  categoryId:'salario', kind:'income'  },
      { id:'r3', title:'Internet Vivo', amount:120,   day:10, categoryId:'moradia', kind:'expense' },
      { id:'r4', title:'Spotify',       amount:49.90, day:14, categoryId:'lazer',   kind:'expense' },
      { id:'r5', title:'Netflix',       amount:39.90, day:18, categoryId:'lazer',   kind:'expense' },
      { id:'r6', title:'Plano saude',   amount:480,   day:20, categoryId:'saude',   kind:'expense' },
      { id:'r7', title:'Academia',      amount:89,    day:12, categoryId:'saude',   kind:'expense' },
    ],
    splits: [
      { id:'s1', title:'Viagem Floripa', total:1280, with:['Marina','Leo'], yourShare:426.66, status:'pending' },
      { id:'s2', title:'Janta sushi',    total:320,  with:['Ana'],          yourShare:160,    status:'pending' },
      { id:'s3', title:'Conta luz apto', total:280,  with:['Marina'],       yourShare:140,    status:'paid'    },
    ],
    achievements: [
      { id:'a1', title:'Mes no azul',             desc:'3 meses com saldo positivo', earned:true,  emoji:'🌊' },
      { id:'a2', title:'Cacador de assinaturas',   desc:'Cancelou 2+ assinaturas',    earned:true,  emoji:'✂️' },
      { id:'a3', title:'Meta concluida',           desc:'Bateu uma meta financeira',   earned:true,  emoji:'🏆' },
      { id:'a4', title:'Investidor disciplinado',  desc:'Aporte mensal por 6 meses',  earned:false, emoji:'📈' },
      { id:'a5', title:'Reserva completa',         desc:'Reserva de emergencia 100%', earned:false, emoji:'🛡️' },
    ],
    profile: { name: 'Voce', streakDays: 47, score: 82 },
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
        // Migrate old state: ensure new fields exist
        if (!parsed.currentUser) parsed.currentUser = null;
        if (!parsed.budgetLimits) parsed.budgetLimits = [];
        if (!parsed.theme) parsed.theme = 'light';
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
    this.set({ transactions: [{ id: 't' + Date.now(), paid: true, ...tx }, ...this.get().transactions] });
  },

  removeTransaction(id: string) {
    this.set({ transactions: this.get().transactions.filter(t => t.id !== id) });
  },

  updateGoal(id: string, patch: Partial<Goal>) {
    this.set({ goals: this.get().goals.map(g => g.id === id ? { ...g, ...patch } : g) });
  },

  addGoal(g: Omit<Goal, 'id' | 'current'>) {
    this.set({ goals: [...this.get().goals, { id: 'g' + Date.now(), current: 0, ...g }] });
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
