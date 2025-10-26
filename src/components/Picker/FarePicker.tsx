// src/components/Picker/FarePicker.tsx
import { useStore } from '../../state/hooks';
import { matchesFilters } from '../../utils/filters';
import type { Fare as FareType } from '../../data/loader';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect width="100%" height="100%" fill="%23e6e6e6"/></svg>';

export default function FarePicker() {
  const { state, dispatch } = useStore();
  const globalQ = state.filters?.['fare']?.q ?? '';
  const list: FareType[] = (state.data?.fare ?? []) as FareType[];
  const prevSelected = state.selected['klavye'];
  const locked = !prevSelected; // require Klavye first

  const filters = state.filters?.['fare'];
  const filtered = list.filter((f) => {
    const out = (f.stok && typeof f.stok === 'object' ? (f.stok as { durum?: string }).durum === 'out_of_stock' : false);
    if (out) return false;
    if (globalQ && !((f.marka ?? f.ad ?? f.id) as string).toLowerCase().includes(globalQ.toLowerCase())) return false;
    if (!matchesFilters(f, filters)) return false;
    return true;
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {/* Global search moved to FilterBar */}
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((f) => {
          const out = (f.stok && typeof f.stok === 'object' ? (f.stok as { durum?: string }).durum === 'out_of_stock' : false);
          const itemDisabled = out || locked;
          return (
            <li key={f.id} className="picker-item" style={{ opacity: locked ? 0.6 : 1 }}>
              <div>
                <div className="item-title">{f.marka ?? f.id} {f.ad ?? ''} {out ? <span style={{ fontSize: 12, color: '#f88', marginLeft: 8 }}>Stokta yok</span> : null}</div>
                <div className="item-sub">DPI: {f.dpi?.min ?? '-'}-{f.dpi?.max ?? '-'} • Ağırlık: {f.agirlik_g ?? '-' }g</div>
              </div>
              <div className="price-area">
                <button disabled={itemDisabled} onClick={() => dispatch({ type: 'SELECT', category: 'fare', id: f.id })} style={{ padding: '6px 10px' }}>
                  {Number(f.fiyat_try ?? 0).toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {locked ? <div style={{ padding: 12, color: '#ffdd99' }}>Önce bir Klavye seçin.</div> : null}
    </section>
  );
}
