const NAME_POOL = [
  'Zéphyr',
  'Ombrelune',
  'Kaelis',
  'Stratos',
  'Eko',
  'Lumis',
  'Arkan',
  'Novalys',
  'Mirko',
  'Sylis',
  'Orka',
  'Téris',
  'Elyos',
  'Veyra',
  'Kairon',
  'Solen',
  'Ydra',
  'Fenris',
  'Talion',
  'Noxis',
] as const;

const USED_STORAGE_KEY = 'sj_used_names';

export type RandomName = (typeof NAME_POOL)[number];

function safeReadLocalStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn('Unable to read localStorage', error);
    return null;
  }
}

function safeWriteLocalStorage(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn('Unable to write localStorage', error);
  }
}

export function listAvailableNames(): RandomName[] {
  return [...NAME_POOL];
}

export function loadUsedNames(): string[] {
  const raw = safeReadLocalStorage(USED_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch (error) {
    console.warn('Unable to parse stored names', error);
    return [];
  }
}

export function rememberName(name: string) {
  const used = new Set(loadUsedNames().map((item) => item.toLowerCase()));
  used.add(name.toLowerCase());
  safeWriteLocalStorage(USED_STORAGE_KEY, JSON.stringify(Array.from(used)));
}

export function getRandomName(existingNames: string[] = []): string {
  const used = new Set([...loadUsedNames(), ...existingNames].map((item) => item.toLowerCase()));
  const available = NAME_POOL.filter((name) => !used.has(name.toLowerCase()));
  if (available.length === 0) {
    const index = Math.floor(Math.random() * NAME_POOL.length);
    return NAME_POOL[index];
  }
  const index = Math.floor(Math.random() * available.length);
  return available[index];
}

