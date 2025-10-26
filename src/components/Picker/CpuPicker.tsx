
import { useStore } from '../../state/hooks';
import { cpuCompatible } from '../../utils/compat';
import { matchesFilters } from '../../utils/filters';
import type { Islemci as IslemciType, Anakart as AnakartType } from '../../data/loader';

export default function CpuPicker() {
  const { state, dispatch } = useStore();
  const globalQ = state.filters?.['islemci']?.q ?? '';

  const list: IslemciType[] = (state.data?.islemci ?? []) as IslemciType[];
  const board: AnakartType | null = (state.data?.anakart ?? []).find((b) => b.id === state.selected['anakart']) ?? null;
  const prevSelected = state.selected['anakart'];
  const locked = !prevSelected; // require anakart first

  const filters = state.filters?.['islemci'];
  const filtered = list.filter((c) => {
    if (globalQ && !String((c.marka ?? c.model ?? c.id)).toLowerCase().includes(globalQ.toLowerCase())) return false;
    if (!cpuCompatible(board ?? undefined, c)) return false;
    if (!matchesFilters(c, filters)) return false;
    return true;
  });

  return (
    <section className="picker-section">
      <div style={{ height: 8 }} />

      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((c) => {
          const out = (c.stok && typeof c.stok === 'object' ? (c.stok as { durum?: string }).durum === 'out_of_stock' : false);
          const itemDisabled = out || locked;
          return (
            <li key={c.id} className="picker-item" style={{ opacity: locked ? 0.6 : 1 }}>
              <div>
                <div className="item-title">{c.marka ?? c.id} {c.model ?? ''} {out ? <span style={{ fontSize: 12, color: '#f88', marginLeft: 8 }}>Stokta yok</span> : null}</div>
                <div className="item-sub">TDP: {c.tdp_w ?? '-'}W • Soket: {c.soket ?? '-'}</div>
              </div>
              <div className="price-area">
                <button disabled={itemDisabled} onClick={() => dispatch({ type: 'SELECT', category: 'islemci', id: c.id })} style={{ padding: '6px 10px' }}>
                  {Number(c.fiyat_try ?? 0).toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {locked ? <div style={{ padding: 12, color: '#ffdd99' }}>Önce bir Anakart seçin (soldaki alt çubuktan veya Anakart sekmesinden).</div> : null}
    </section>
  );
}
