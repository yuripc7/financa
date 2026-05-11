export function hashPassword(password: string): string {
  let hash = 0;
  const str = password + 'fnz_salt_2025';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function checkPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) return 'Mínimo 6 caracteres';
  return null;
}

const USERS_KEY = 'fnz_users_v1';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export function getUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}

export function saveUser(user: StoredUser): void {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user; else users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByEmail(email: string): StoredUser | null {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function registerUser(name: string, email: string, password: string): StoredUser | string {
  if (findUserByEmail(email)) return 'Este e-mail já está cadastrado.';
  const user: StoredUser = {
    id: 'u' + Date.now(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  saveUser(user);
  return user;
}

export function loginUser(email: string, password: string): StoredUser | string {
  const user = findUserByEmail(email);
  if (!user) return 'E-mail não encontrado.';
  if (!checkPassword(password, user.passwordHash)) return 'Senha incorreta.';
  return user;
}
