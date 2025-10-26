// src/components/Picker/RamPicker.tsx
import { useState } from 'react';
import { useStore } from '../../state/hooks';
import { ramCompatible } from '../../utils/compat';
import { matchesFilters } from '../../utils/filters';
import type { Ram as RamType, Anakart as AnakartType } from '../../data/loader';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect width="100%" height="100%" fill="%23e6e6e6"/></svg>';

// helper: strip speed tokens from model string (e.g. "DDR5-5200" or "-5200")
function sanitizeModel(model?: string | null) {
  if (!model) return '';
  let s = String(model);
  // remove explicit DDR+speed (e.g. DDR5-5200 or DDR4 3600)
  s = s.replace(/\bDDR\d+[- ]?\d{3,4}\b/ig, '');
  // remove standalone DDR5/DDR4 if desired (we keep type separately elsewhere) - but only remove if followed/preceded by speed removal
  s = s.replace(/\bDDR\d+\b/ig, '');
  // remove trailing -5200 or similar patterns
  s = s.replace(/[-–—]\s*\d{3,4}\b/g, '');
  // remove MHz tokens
  s = s.replace(/\b\d{3,4}\s*MHz\b/ig, '');
  // collapse spaces
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

export default function RamPicker() {
  const { state, dispatch } = useStore();
  const globalQ = state.filters?.['ram']?.q ?? '';
  const list: RamType[] = (state.data?.ram ?? []) as RamType[];
  const board: AnakartType | null = (state.data?.anakart ?? []).find((b) => b.id === state.selected['anakart']) ?? null;
  const prevSelected = state.selected['islemci'];
  const locked = !prevSelected; // require CPU selected first

  const filters = state.filters?.['ram'];
  const filtered = list.filter((r) => {
    const out = (r.stok && typeof r.stok === 'object' ? (r.stok as { durum?: string }).durum === 'out_of_stock' : false);
    if (out) return false;
    if (globalQ && !((r.marka ?? r.ad ?? r.id) as string).toLowerCase().includes(globalQ.toLowerCase())) return false;
    if (!ramCompatible(board ?? undefined, r)) return false;
    if (!matchesFilters(r, filters)) return false;
    return true;
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {/* Global search moved to FilterBar */}
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((r) => {
          const out = (r.stok && typeof r.stok === 'object' ? (r.stok as { durum?: string }).durum === 'out_of_stock' : false);
          const itemDisabled = out || locked;

          // compute display values
          const kitGb = r.kapasite_kit_gb ?? (r.kapasite_modul_gb && r.modul_sayisi ? r.kapasite_modul_gb * r.modul_sayisi : null);
          const modulDesc = (r.modul_sayisi && r.kapasite_modul_gb) ? `${r.modul_sayisi}x${r.kapasite_modul_gb}` : (r.modul_sayisi ? `${r.modul_sayisi} modül` : null);

          // get speed: prefer hiz_mhz (number) else first profile
          let speedVal: number | null = null;
          if (typeof r.hiz_mhz === 'number') speedVal = r.hiz_mhz;
          else if (typeof r.hiz_mhz === 'string') {
            const n = parseInt(r.hiz_mhz.replace(/\D/g, ''), 10);
            if (!isNaN(n)) speedVal = n;
          } else if (Array.isArray(r.hiz_profilleri_mhz) && r.hiz_profilleri_mhz.length) {
            const first = r.hiz_profilleri_mhz[0];
            const n = parseInt(String(first).replace(/\D/g, ''), 10);
            if (!isNaN(n)) speedVal = n;
          }

          const specs: string[] = [];
          if (kitGb) specs.push(`${kitGb} GB`);
          if (r.tip) specs.push(r.tip);
          if (speedVal) specs.push(`${speedVal} MHz`);
          if (modulDesc) specs.push(modulDesc);

          const specLine = specs.join(' • ');

          const displayModel = sanitizeModel(r.model);

          return (
            <li key={r.id} className="picker-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="item-title" style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset', fontWeight: 600 }}>{r.marka ?? r.ad ?? r.id} {displayModel ? displayModel : ''} {out ? <span style={{ fontSize: 12, color: '#f88', marginLeft: 8 }}>Stokta yok</span> : null}</div>
                  <div className="item-sub" style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset' }}>{specLine}</div>
                </div>
              </div>
              <div className="price-area" style={{ marginLeft: 12 }}>
                <button disabled={itemDisabled} onClick={() => dispatch({ type: 'SELECT', category: 'ram', id: r.id })} style={{ padding: '6px 10px' }}>
                  {Number(r.fiyat_try ?? 0).toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {locked ? <div style={{ padding: 12, color: '#ffdd99' }}>Önce bir İşlemci (CPU) seçin.</div> : null}
    </section>
  );
}
