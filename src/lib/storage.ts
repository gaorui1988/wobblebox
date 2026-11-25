import { brandSlug } from './brand';

function keyFor(key: string): string {
  return `${brandSlug}:${key}`;
}

export function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(keyFor(key));
  } catch {
    return null;
  }
}

export function storageSet(key: string, value: string): void {
  try {
    localStorage.setItem(keyFor(key), value);
  } catch {
    /* private mode or a full disk — the form still shows success locally */
  }
}
