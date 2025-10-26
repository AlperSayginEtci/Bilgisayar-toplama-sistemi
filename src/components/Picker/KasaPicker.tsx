// src/components/Picker/KasaPicker.tsx
import { useState } from 'react';
import { useStore } from '../../state/hooks';
import { matchesFilters } from '../../utils/filters';
import { caseFits } from '../../utils/compat';
import type { Kasa as KasaType, Anakart as AnakartType, EkranKarti as EkranKartiType, IslemciSogutucu as CoolerType } from '../../data/loader';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect width="100%" height="100%" fill="%23e6e6e6"/></svg>';

export default function KasaPicker() {
  const { state, dispatch } = useStore();
  const globalQ = state.filters?.['kasa']?.q ?? '';
  const list: KasaType[] = (state.data?.kasa ?? []) as KasaType[];
  const board: AnakartType | null = (state.data?.anakart ?? []).find((b) => b.id === state.selected['anakart']) ?? null;
  const gpu: EkranKartiType | null = (state.data?.ekran_karti ?? []).find((g) => g.id === state.selected['ekran_karti']) ?? null;
  const cooler: CoolerType | null = (state.data?.islemci_sogutucu ?? []).find((c) => c.id === state.selected['islemci_sogutucu']) ?? null;
  const prevSelected = state.selected['psu'];
  const locked = !prevSelected; // require PSU first

  const filters = state.filters?.['kasa'];
  const filtered = list.filter((k) => {
    const out = (k.stok && typeof k.stok === 'object' ? (k.stok as { durum?: string }).durum === 'out_of_stock' : false);
    if (out) return false;
    if (globalQ && !((k.marka ?? k.ad ?? k.id) as string).toLowerCase().includes(globalQ.toLowerCase())) return false;
    if (!matchesFilters(k, filters)) return false;
    const ok = caseFits(k, board ?? undefined, gpu ?? undefined, cooler ?? undefined);
    return ok.ok;
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {/* Global search moved to FilterBar */}
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((k) => {
          const out = (k.stok && typeof k.stok === 'object' ? (k.stok as { durum?: string }).durum === 'out_of_stock' : false);
          const itemDisabled = out || locked;

          // normalize supported mobo list (field may be mobo_dest or mobo_destek)
          const moboSupport = Array.isArray(k.mobo_dest) ? k.mobo_dest : Array.isArray(k.mobo_destek) ? k.mobo_destek : null;

          // GPU length
          const gpuMax = k.gpu_uzunluk_max_mm ?? k.gpu_uzunluk_mm ?? null;

          // PSU support
          const psuSupport = k.psu_destek ?? k.psu_dest ?? null;

          // psu_tumlesik flag
          const psuIntegrated = k.psu_tumlesik === true;

          return (
            <li key={k.id} className="picker-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ minWidth: 0 }}>
                <div className="item-title" style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset', fontWeight: 600 }}>{k.marka ?? k.ad ?? k.id} {k.model ?? ''} {out ? <span style={{ fontSize: 12, color: '#f88', marginLeft: 8 }}>Stokta yok</span> : null}</div>
                <div className="item-sub" style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset' }}>
                  <div>Tip: {k.form_factor ?? '-'}</div>
                  <div>Desteklenen anakartlar: {moboSupport ? moboSupport.join(', ') : (k.mobo_dest ? String(k.mobo_dest) : '-' )}</div>
                  <div>GPU maksimum uzunluk: {gpuMax ? `${gpuMax} mm` : '-'}</div>
                  <div>PSU destek: {psuSupport ? (Array.isArray(psuSupport) ? psuSupport.join(', ') : String(psuSupport)) : '-'} {psuIntegrated ? '(Dahili PSU)' : ''}</div>
                </div>
              </div>
              <div className="price-area" style={{ marginLeft: 12 }}>
                <button disabled={itemDisabled} onClick={() => dispatch({ type: 'SELECT', category: 'kasa', id: k.id })} style={{ padding: '6px 10px' }}>
                  {Number(k.fiyat_try ?? 0).toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
       </ul>
       {locked ? <div style={{ padding: 12, color: '#ffdd99' }}>Önce bir Güç Kaynağı (PSU) seçin.</div> : null}
     </section>
   );
 }
