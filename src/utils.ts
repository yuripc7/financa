import type { AppState, Transaction } from './types';
import { CATEGORY_MAP } from './store';

export function brl(n: number): string {
  if (n == null || isNaN(n)) return 'R$ 0,00';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function brlShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1000) return `R$${(n / 1000).toFixed(1)}k`;
  return brl(n);
}

export function numParts(n: number) {
  const neg = n < 0;
  const abs = Math.abs(n);
  const int = Math.floor(abs);
  const cents = Math.round((abs - int) * 100).toString().padStart(2, '0');
  return { sign: neg ? '−' : '', intStr: int.toLocaleString('pt-BR'), cents };
}

export function monthLabel(date: Date = new Date()): string {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export function dayLabel(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(date, today)) return 'Hoje';
  if (same(date, yesterday)) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function monthSummary(transactions: Transaction[], offset = 0) {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const m = target.getMonth(), y = target.getFullYear();
  const filtered = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === m && d.getFullYear() === y;
  });
  const income  = filtered.filter(t => t.kind === 'income' ).reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter(t => t.kind === 'expense').reduce((s, t) => s + t.amount, 0);
  return { transactions: filtered, income, expense, balance: income - expense, label: monthLabel(target) };
}

export function categoryBreakdown(transactions: Transaction[], kind: 'income' | 'expense' = 'expense') {
  const map: Record<string, number> = {};
  transactions.filter(t => t.kind === kind).forEach(t => {
    map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
  });
  return Object.entries(map)
    .map(([id, amount]) => ({ ...(CATEGORY_MAP[id] || CATEGORY_MAP['outros']), id, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function dailySeries(transactions: Transaction[], days = 30) {
  const out: { date: Date; income: number; expense: number; net: number }[] = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const dayTx = transactions.filter(t => new Date(t.date).toDateString() === key);
    const income  = dayTx.filter(t => t.kind === 'income' ).reduce((s, t) => s + t.amount, 0);
    const expense = dayTx.filter(t => t.kind === 'expense').reduce((s, t) => s + t.amount, 0);
    out.push({ date: d, income, expense, net: income - expense });
  }
  return out;
}

export function forecast(state: AppState, days = 30) {
  const series = dailySeries(state.transactions, 30);
  const avgExp = series.reduce((s, d) => s + d.expense, 0) / series.length;
  const avgInc = series.reduce((s, d) => s + d.income, 0) / series.length;
  const baseDaily = avgInc - avgExp;
  const monthSum = monthSummary(state.transactions, 0);
  let running = monthSum.balance;
  const out = [{ day: 0, value: running, label: 'Hoje' }];
  for (let i = 1; i <= days; i++) {
    const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + i);
    let delta = baseDaily;
    state.recurring.forEach(r => {
      if (r.day === futureDate.getDate()) delta += r.kind === 'income' ? r.amount : -r.amount;
    });
    running += delta;
    out.push({ day: i, value: running, label: futureDate.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }) });
  }
  return out;
}
