// src/types/parts.ts
// Genel parça tipleri - interfaceler şeklinde tanımlandı ve mevcut kodla uyumlu tutuldu.

export interface BasePart {
  id: string;
  ad?: string;
  marka?: string;
  model?: string;
  fiyat_try?: number; // mevcut kod fiyat_try bekliyor
  // stok: bazı JSON'larda string, bazılarında obje olabiliyor; union ile geniş tuttuk
  stok?: { durum?: 'in_stock' | 'out_of_stock' | 'in-stock' | 'out-stock' | string; adet?: number } | string;
  etiketler?: string[];
}

export interface Anakart extends BasePart {
  form_factor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX' | 'ITX' | string;
  yonga_seti?: string;
  soket?: string;
  cpu_uyumluluk?: { vendor?: 'AMD' | 'Intel' | string; socket?: string; nesiller?: (string | number)[] };
  bellek?: { tip?: string; yuva_sayisi?: number; max_kapasite_gb?: number; hiz_mhz?: number[] };
  depolama?: { sata?: number; m2?: number; m2_pci_gen?: number };
  genisleme?: { pcie_x16?: number; pcie_x1?: number; pcie_gen?: number };
}

export interface Islemci extends BasePart {
  vendor?: string;
  soket?: string;
  nesil?: number | string;
  cekirdek_sayi?: number;
  izlek_sayi?: number;
  temel_hiz_ghz?: number;
  turbo_hiz_ghz?: number;
  tdp_w?: number;
  bellek_destek?: { tip?: string; max_mhz?: number };
  igpu?: boolean | null;
}

export interface Ram extends BasePart {
  seri?: string;
  tip?: string; // DDR4/DDR5
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
}

export interface EkranKarti extends BasePart {
  seri?: string;
  vram?: { boyut_gb?: number; tip?: string };
  pcie_arayuz?: { surum?: string; hat_sayisi?: string; fiziksel?: string };
  guc?: { tgp_w?: number; ek_guc_konnektoru?: string[]; onerilen_psu_w?: number };
  boyut?: { uzunluk_mm?: number; kalinlik_slot?: number };
  ekran_cikislari?: { hdmi?: number; dp?: number; dvi?: number };
  uyumluluk?: { pcie_gereksinimi?: string; slot_ihtiyaci?: string; anakart_kontrol?: string };
}

export interface Psu extends BasePart {
  guc_w?: number;
  efficiency?: string;
  form_factor?: string;
  moduler?: string;
  baglantilar?: { pcie_8pin_adet?: number; pcie_12vhpwr_adet?: number; eps_8pin_adet?: number; sata_adet?: number };
  uyumluluk?: { onerilen_gpu_tgp_max_w?: number; oneri?: string };
  boyut?: string;
}

export interface Kasa extends BasePart {
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
}

export interface Depolama extends BasePart {
  form_factor?: string;
  m2_boy?: string;
  arayuz?: { tip?: string; protokol?: string; port?: string; pcie_gen?: number; lanes?: number };
  kapasite_gb?: number;
  performans?: { okuma_mb_s?: number; yazma_mb_s?: number };
  dayaniklilik_tbw?: number;
  rpm?: number;
  onbellek_mb?: number;
  uyumluluk?: { anakart_kontrol?: string; m2_not?: string; pcie_not?: string };
}

export interface Monitor extends BasePart {
  boyut_inch?: number;
  panel?: string;
  yenileme_hizi_hz?: number;
  cozunurluk?: { ad?: string; gen?: string; yuk?: number; oran?: string };
  ozellikler?: { hdr?: boolean; fre_sync?: boolean; g_sync_compatible?: boolean; curved?: boolean; ultrawide?: boolean };
  baglantilar?: { hdmi?: number; dp?: number; usb_c_dp?: number };
}

export interface Klavye extends BasePart {
  boyut?: string;
  dizilim?: string;
  switch?: { tip?: string; hot_swap?: boolean };
  kablosuz?: boolean;
  polling_hz?: number;
  arkadan_aydinlatma?: boolean;
  keycap?: { malzeme?: string };
}

export interface Fare extends BasePart {
  sensor?: string;
  dpi?: { min?: number; max?: number };
  agirlik_g?: number;
}

export interface IslemciSogutucu extends BasePart {
  tip?: string; // Air/Liquid
  fan_sayisi?: number;
  fan_boyutu_mm?: number;
  radyator_mm?: number | null;
  pompa_rpm?: number;
  yukseklik_mm?: number;
  desteklenen_soketler?: string[];
  max_tdp_w?: number;
  rgb?: boolean;
}

export interface AllData {
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
}

