// src/utils/compat.ts
import type { Anakart, Islemci, Ram, EkranKarti, Psu, Kasa, IslemciSogutucu, Depolama } from '../data/loader';

export function cpuCompatible(board: Anakart | null | undefined, cpu: Islemci | null | undefined): boolean {
  if (!board || !cpu) return true;
  const b = board.cpu_uyumluluk ?? {};
  if (b.vendor && cpu.vendor && b.vendor !== cpu.vendor) return false;
  if (b.socket && cpu.soket && b.socket !== cpu.soket) return false;
  if (b.nesiller && cpu.nesil !== undefined) return b.nesiller.includes(cpu.nesil);
  return true;
}

export function ramCompatible(board: Anakart | null | undefined, ram: Ram | null | undefined): boolean {
  if (!board || !ram) return true;
  const b = board.bellek ?? {};
  if (b.tip && ram.tip && b.tip !== ram.tip) return false;
  if (b.hiz_mhz && ram.hiz_mhz && Math.max(...b.hiz_mhz) < ram.hiz_mhz) return false;
  if (b.yuva_sayisi !== undefined && ram.modul_sayisi !== undefined && ram.modul_sayisi > b.yuva_sayisi) return false;
  return true;
}

export function gpuCompatible(board: Anakart | null | undefined, gpu: EkranKarti | null | undefined): { ok: boolean; note?: string } {
  if (!gpu) return { ok: true };
  if (!board) return { ok: true };
  const slots = board.genisleme?.pcie_x16 ?? 0;
  if (slots < 1) return { ok: false, note: 'Anakartta yeterli x16 slot yok' };
  const boardGen = board.genisleme?.pcie_gen ?? 0;
  const gpuGen = gpu.pcie_arayuz?.surum ? parseInt(gpu.pcie_arayuz.surum.replace(/\D/g, '')) : 0;
  if (gpuGen > boardGen) return { ok: true, note: 'PCIe sürüm farkı nedeniyle bant genişliği düşebilir' };
  return { ok: true };
}

export function psuEnough(psu: Psu | null | undefined, cpu: Islemci | null | undefined, gpu: EkranKarti | null | undefined): { ok: boolean; note?: string } {
  if (!psu) return { ok: false, note: 'PSU seçili değil' };
  const cpuTdp = cpu?.tdp_w ?? 0;
  const gpuTgp = gpu?.guc?.tgp_w ?? 0;
  const required = cpuTdp + gpuTgp + 150;
  if ((psu.guc_w ?? 0) < required) return { ok: false, note: `Yetersiz watt: gerek ${required}W` };
  const gpuReq = gpu?.guc?.ek_guc_konnektoru ?? [];
  if (gpuReq.includes('12VHPWR')) {
    if ((psu.baglantilar?.pcie_12vhpwr_adet ?? 0) < 1) return { ok: false, note: 'PSU 12VHPWR yok' };
  }
  return { ok: true };
}

export function caseFits(m: Kasa | null | undefined, board: Anakart | null | undefined, gpu: EkranKarti | null | undefined, cooler: IslemciSogutucu | null | undefined): { ok: boolean; note?: string } {
  if (!m) return { ok: true };
  if (board && m.mobo_destek && board.form_factor && !m.mobo_destek.includes(board.form_factor)) return { ok: false, note: 'Kasa anakart form faktörünü desteklemiyor' };
  if (gpu && m.gpu_uzunluk_max_mm && gpu.boyut?.uzunluk_mm && gpu.boyut.uzunluk_mm > m.gpu_uzunluk_max_mm) return { ok: false, note: 'GPU uzunluğu kasaya sığmıyor' };
  if (cooler && m.cpu_sogutucu_yukseklik_max_mm && cooler.yukseklik_mm && cooler.yukseklik_mm > m.cpu_sogutucu_yukseklik_max_mm) return { ok: false, note: 'Soğutucu yüksekliği kasaya sığmıyor' };
  if (m.psu_tumlesik) return { ok: true, note: 'Kasa dahili PSU kullanıyor' };
  return { ok: true };
}

export function coolerCompatible(cooler: IslemciSogutucu | null | undefined, cpu: Islemci | null | undefined, kasa: Kasa | null | undefined): { ok: boolean; note?: string } {
  if (!cooler) return { ok: true };
  if (cpu && cooler.desteklenen_soketler && cpu.soket && !cooler.desteklenen_soketler.includes(cpu.soket)) return { ok: false, note: 'Soğutucu soket uyumsuz' };
  if (cpu && cpu.tdp_w && cooler.max_tdp_w && cpu.tdp_w > cooler.max_tdp_w) return { ok: false, note: 'Soğutucu TDP yeterli değil' };
  if (kasa && kasa.cpu_sogutucu_yukseklik_max_mm && cooler.yukseklik_mm && cooler.yukseklik_mm > kasa.cpu_sogutucu_yukseklik_max_mm) return { ok: false, note: 'Kasa soğutucu yüksekliğini desteklemiyor' };
  return { ok: true };
}

export function storageCompatible(board: Anakart | null | undefined, disk: Depolama | null | undefined): { ok: boolean; note?: string } {
  if (!disk) return { ok: true };
  if (!board) return { ok: true };
  const ar = disk.arayuz?.tip ?? '';
  if (ar.includes('SATA')) {
    if ((board.depolama?.sata ?? 0) <= 0) return { ok: false, note: 'Anakartta SATA port yok' };
  }
  if (ar.includes('NVMe')) {
    if ((board.depolama?.m2 ?? 0) <= 0) return { ok: false, note: 'Anakartta M.2 NVMe yuvası yok' };
    const diskGen = disk.arayuz?.pcie_gen ?? 0;
    if ((board.depolama?.m2_pci_gen ?? 0) < diskGen) return { ok: true, note: 'Anakart PCIe gen düşük; hız düşer' };
  }
  return { ok: true };
}
