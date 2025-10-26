// src/data/loader.ts
// Tüm JSONları /public/data/ dizininden yükleyen yardımcı ve tipler
import type {
  Anakart,
  Islemci,
  Ram,
  EkranKarti,
  Psu,
  Kasa,
  Depolama,
  Monitor,
  Klavye,
  Fare,
  IslemciSogutucu,
  AllData,
} from '../types/parts';

// Re-export types so other modules that import from '../data/loader' continue to work
export type { Anakart, Islemci, Ram, EkranKarti, Psu, Kasa, Depolama, Monitor, Klavye, Fare, IslemciSogutucu, AllData } from '../types/parts';

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json() as Promise<T>;
}

export async function loadAllData(): Promise<AllData> {
  const base = '/data';
  const [anakart, islemci, ram, ekran_karti, psu, kasa, depolama, monitor, klavye, fare, islemci_sogutucu] = await Promise.all([
    fetchJson<Anakart[]>(`${base}/anakart.json`),
    fetchJson<Islemci[]>(`${base}/islemci.json`),
    fetchJson<Ram[]>(`${base}/ram.json`),
    fetchJson<EkranKarti[]>(`${base}/ekran_karti.json`),
    fetchJson<Psu[]>(`${base}/psu.json`),
    fetchJson<Kasa[]>(`${base}/kasa.json`),
    fetchJson<Depolama[]>(`${base}/depolama.json`),
    fetchJson<Monitor[]>(`${base}/monitor.json`),
    fetchJson<Klavye[]>(`${base}/klavye.json`),
    fetchJson<Fare[]>(`${base}/fare.json`),
    fetchJson<IslemciSogutucu[]>(`${base}/islemci_sogutucu.json`),
  ]);

  return { anakart, islemci, ram, ekran_karti, psu, kasa, depolama, monitor, klavye, fare, islemci_sogutucu };
}
