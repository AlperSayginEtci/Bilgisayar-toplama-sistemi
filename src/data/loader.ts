// src/data/loader.ts
// Tüm JSONları /public/data/ dizininden yükleyen yardımcı ve tipler
export type Anakart = {
  id: string;
  marka?: string;
  ad?: string;
  model?: string;
  form_factor?: string;
  yonga_seti?: string;
  soket?: string;
  cpu_uyumluluk?: { vendor?: string; socket?: string; nesiller?: number[] };
  bellek?: { tip?: string; yuva_sayisi?: number; max_kapasite_gb?: number; hiz_mhz?: number[] };
  depolama?: { sata?: number; m2?: number; m2_pci_gen?: number };
  genisleme?: { pcie_x16?: number; pcie_x1?: number; pcie_gen?: number };
  stok?: { durum?: string; adet?: number };
  fiyat_try?: number;
  etiketler?: string[];
};

export type Islemci = {
  id: string;
  marka?: string;
  vendor?: string;
  soket?: string;
  nesil?: number;
  cekirdek_sayi?: number;
  izlek_sayi?: number;
  temel_hiz_ghz?: number;
  turbo_hiz_ghz?: number;
  tdp_w?: number;
  bellek_destek?: { tip?: string; max_mhz?: number };
  igpu?: boolean | null;
  fiyat_try?: number;
  stok?: { durum?: string; adet?: number };
  etiketler?: string[];
};

export type Ram = {
  id: string;
  marka?: string;
  seri?: string;
  model?: string;
  ad?: string;
  tip?: string;
  hiz_mhz?: number;
  hiz_profilleri_mhz?: number[];
  modul_sayisi?: number;
  kapasite_modul_gb?: number;
  kapasite_kit_gb?: number;
  profil?: string[];
  uyumluluk?: { bellek_tip?: string; uyumlu_soketler?: string[]; oneri?: string };
  volt?: number;
  cas?: number;
  ecc?: boolean;
  rank?: number;
  form_factor?: string;
  stok?: { durum?: string; adet?: number };
  fiyat_try?: number;
};

export type EkranKarti = {
  id: string;
  marka?: string;
  seri?: string;
  model?: string;
  ad?: string;
  vram?: { boyut_gb?: number; tip?: string };
  pcie_arayuz?: { surum?: string; hat_sayisi?: string; fiziksel?: string };
  guc?: { tgp_w?: number; ek_guc_konnektoru?: string[]; onerilen_psu_w?: number };
  boyut?: { uzunluk_mm?: number; kalinlik_slot?: number };
  ekran_cikislari?: { hdmi?: number; dp?: number; dvi?: number };
  uyumluluk?: { pcie_gereksinimi?: string; slot_ihtiyaci?: string; anakart_kontrol?: string };
  stok?: { durum?: string; adet?: number };
  fiyat_try?: number;
};

export type Psu = {
  id: string;
  marka?: string;
  seri?: string;
  model?: string;
  ad?: string;
  guc_w?: number;
  efficiency?: string;
  form_factor?: string;
  moduler?: string;
  baglantilar?: { pcie_8pin_adet?: number; pcie_12vhpwr_adet?: number; eps_8pin_adet?: number; sata_adet?: number };
  uyumluluk?: { onerilen_gpu_tgp_max_w?: number; oneri?: string };
  boyut?: string;
  fiyat_try?: number;
  stok?: { durum?: string; adet?: number };
};

export type Kasa = {
  id: string;
  marka?: string;
  seri?: string;
  model?: string;
  ad?: string;
  form_factor?: string;
  mobo_destek?: string[];
  gpu_uzunluk_max_mm?: number;
  cpu_sogutucu_yukseklik_max_mm?: number;
  psu_destek?: string[];
  psu_tumlesik?: boolean;
  psu_dahili?: Record<string, unknown> | undefined;
  fanlar_dahil?: Record<string, unknown> | undefined;
  radyator_destek?: { front?: number[]; top?: number[]; rear?: number[] };
  on_panel?: Record<string, unknown> | undefined;
  fiyat_try?: number;
  stok?: { durum?: string; adet?: number };
};

export type Depolama = {
  id: string;
  marka?: string;
  model?: string;
  ad?: string;
  form_factor?: string;
  m2_boy?: string;
  arayuz?: { tip?: string; protokol?: string; port?: string; pcie_gen?: number; lanes?: number };
  kapasite_gb?: number;
  performans?: { okuma_mb_s?: number; yazma_mb_s?: number };
  dayaniklilik_tbw?: number;
  rpm?: number;
  onbellek_mb?: number;
  uyumluluk?: { anakart_kontrol?: string; m2_not?: string; pcie_not?: string };
  fiyat_try?: number;
  stok?: { durum?: string; adet?: number };
};

export type Monitor = { id: string; marka?: string; ad?: string; boyut_inch?: number; panel?: string; yenileme_hizi_hz?: number; fiyat_try?: number; stok?: { durum?: string } };
export type Klavye = { id: string; marka?: string; ad?: string; fiyat_try?: number; stok?: { durum?: string } };
export type Fare = { id: string; marka?: string; ad?: string; fiyat_try?: number; stok?: { durum?: string } };
export type IslemciSogutucu = { id: string; marka?: string; ad?: string; tip?: string; fan_sayisi?: number; fan_boyutu_mm?: number; radyator_mm?: number | null; pompa_rpm?: number; yukseklik_mm?: number; desteklenen_soketler?: string[]; max_tdp_w?: number; stok?: { durum?: string }; fiyat_try?: number };

export type AllData = {
  anakart: Anakart[];
  islemci: Islemci[];
  ram: Ram[];
  ekran_karti: EkranKarti[];
  psu: Psu[];
  kasa: Kasa[];
  depolama: Depolama[];
  monitor: Monitor[];
  klavye: Klavye[];
  fare: Fare[];
  islemci_sogutucu: IslemciSogutucu[];
};

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
