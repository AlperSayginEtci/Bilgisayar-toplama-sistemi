// src/components/Picker/PsuPicker.tsx
import { useStore } from '../../state/hooks';
import { psuEnough } from '../../utils/compat';
import { matchesFilters } from '../../utils/filters';
import type { Psu as PsuType, Islemci as IslemciType, EkranKarti as EkranKartiType } from '../../data/loader';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect width="100%" height="100%" fill="%23e6e6e6"/></svg>';

export default function PsuPicker() {
  const { state, dispatch } = useStore();
  const globalQ = state.filters?.['psu']?.q ?? '';
  const list: PsuType[] = (state.data?.psu ?? []) as PsuType[];
  const cpu: IslemciType | null = (state.data?.islemci ?? []).find((c) => c.id === state.selected['islemci']) ?? null;
  const gpu: EkranKartiType | null = (state.data?.ekran_karti ?? []).find((g) => g.id === state.selected['ekran_karti']) ?? null;
  const prevSelected = state.selected['ekran_karti'];
  const locked = !prevSelected; // require GPU first

  const filters = state.filters?.['psu'];
  const filtered = list.filter((p) => {
    const out = (p.stok && typeof p.stok === 'object' ? (p.stok as { durum?: string }).durum === 'out_of_stock' : false);
    if (out) return false;
    if (globalQ && !((p.marka ?? p.ad ?? p.id) as string).toLowerCase().includes(globalQ.toLowerCase())) return false;
    if (!matchesFilters(p, filters)) return false;
    const ok = psuEnough(p, cpu ?? undefined, gpu ?? undefined);
    return ok.ok;
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {/* Global search moved to FilterBar */}
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((p) => {
          const out = (p.stok && typeof p.stok === 'object' ? (p.stok as { durum?: string }).durum === 'out_of_stock' : false);
          const itemDisabled = out || locked;
          return (
            <li key={p.id} className="picker-item" style={{ opacity: locked ? 0.6 : 1 }}>
              <div>
                <div className="item-title">{p.marka ?? p.id} {p.model ?? ''} {out ? <span style={{ fontSize: 12, color: '#f88', marginLeft: 8 }}>Stokta yok</span> : null}</div>
                <div className="item-sub">{p.guc_w ?? '-'}W • {p.efficiency ?? '-'}</div>
              </div>
              <div className="price-area">
                <button disabled={itemDisabled} onClick={() => dispatch({ type: 'SELECT', category: 'psu', id: p.id })} style={{ padding: '6px 10px' }}>
                  {Number(p.fiyat_try ?? 0).toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
       </ul>
+      {locked ? <div style={{ padding: 12, color: '#ffdd99' }}>Önce bir Ekran Kartı (GPU) seçin.</div> : null}
     </section>
   );
 }
