// src/components/Picker/GpuPicker.tsx
import { useStore } from '../../state/hooks';
import { matchesFilters } from '../../utils/filters';
import type { EkranKarti as EkranKartiType, Anakart as AnakartType } from '../../data/loader';

export default function GpuPicker() {
  const { state, dispatch } = useStore();
  const globalQ = state.filters?.['ekran_karti']?.q ?? '';
  const list: EkranKartiType[] = (state.data?.ekran_karti ?? []) as EkranKartiType[];
  const board: AnakartType | null = (state.data?.anakart ?? []).find((b) => b.id === state.selected['anakart']) ?? null;
  const prevSelected = state.selected['ram'];
  const locked = !prevSelected; // require RAM first

  const filters = state.filters?.['ekran_karti'];
  const filtered = list.filter((g) => {
    const out = (g.stok && typeof g.stok === 'object' ? (g.stok as { durum?: string }).durum === 'out_of_stock' : false);
    if (out) return false;
    if (globalQ && !((g.marka ?? g.ad ?? g.id) as string).toLowerCase().includes(globalQ.toLowerCase())) return false;
    if (!matchesFilters(g, filters)) return false;
    return true;
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {/* Global search moved to FilterBar */}
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((g) => {
          const out = (g.stok && typeof g.stok === 'object' ? (g.stok as { durum?: string }).durum === 'out_of_stock' : false);
          const itemDisabled = out || locked;
          return (
            <li key={g.id} className="picker-item" style={{ opacity: locked ? 0.6 : 1 }}>
              <div>
                <div className="item-title">{g.marka ?? g.id} {g.model ?? ''} {out ? <span style={{ fontSize: 12, color: '#f88', marginLeft: 8 }}>Stokta yok</span> : null}</div>
                <div className="item-sub">VRAM: {g.vram?.boyut_gb ?? '-'}GB • PCIe: {g.pcie_arayuz?.surum ?? '-'}</div>
              </div>
              <div className="price-area">
                <button disabled={itemDisabled} onClick={() => dispatch({ type: 'SELECT', category: 'ekran_karti', id: g.id })} style={{ padding: '6px 10px' }}>
                  {Number(g.fiyat_try ?? 0).toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {locked ? <div style={{ padding: 12, color: '#ffdd99' }}>Önce bir RAM seçin.</div> : null}
    </section>
  );
}
