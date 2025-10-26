// src/components/Picker/DepolamaPicker.tsx
import { useStore } from '../../state/hooks';
import { storageCompatible } from '../../utils/compat';
import { matchesFilters } from '../../utils/filters';
import type { Depolama as DepolamaType, Anakart as AnakartType } from '../../data/loader';

export default function DepolamaPicker() {
  const { state, dispatch } = useStore();
  const globalQ = state.filters?.['depolama']?.q ?? '';
  const list: DepolamaType[] = (state.data?.depolama ?? []) as DepolamaType[];
  const board: AnakartType | null = (state.data?.anakart ?? []).find((b) => b.id === state.selected['anakart']) ?? null;
  const prevSelected = state.selected['kasa'];
  const locked = !prevSelected; // require Kasa first

  const filters = state.filters?.['depolama'];
  const filtered = list.filter((d) => {
    const out = (d.stok && typeof d.stok === 'object' ? (d.stok as { durum?: string }).durum === 'out_of_stock' : false);
    if (out) return false;
    if (globalQ && !((d.marka ?? d.ad ?? d.id) as string).toLowerCase().includes(globalQ.toLowerCase())) return false;
    if (!matchesFilters(d, filters)) return false;
    return true;
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {/* Global search moved to FilterBar */}
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((d) => {
          const out = (d.stok && typeof d.stok === 'object' ? (d.stok as { durum?: string }).durum === 'out_of_stock' : false);
          const itemDisabled = out || locked;

          // performance read/write
          const okuma = d.performans?.okuma_mb_s ?? d.performans?.read_mb_s ?? null;
          const yazma = d.performans?.yazma_mb_s ?? d.performans?.write_mb_s ?? null;

          return (
            <li key={d.id} className="picker-item" style={{ padding: 12, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="item-title" style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset', lineHeight: 1.25, fontWeight: 600, marginBottom: 6 }}>
                  {d.marka ?? d.id} {d.model ?? ''} {out ? <span style={{ fontSize: 12, color: '#f88', marginLeft: 8 }}>Stokta yok</span> : null}
                </div>
                <div className="item-sub" style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset', lineHeight: 1.3 }}>
                  <div>{d.form_factor ?? '-'} • {d.kapasite_gb ?? '-'} GB</div>
                  <div>Okuma: {okuma ? `${Number(okuma).toLocaleString('tr-TR')} MB/s` : '-'} • Yazma: {yazma ? `${Number(yazma).toLocaleString('tr-TR')} MB/s` : '-'}</div>
                </div>
              </div>

              <div style={{ marginLeft: 12, display: 'flex', alignItems: 'center' }}>
                <button disabled={itemDisabled} onClick={() => dispatch({ type: 'SELECT', category: 'depolama', id: d.id })} style={{ padding: '8px 12px' }}>
                  {Number(d.fiyat_try ?? 0).toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {locked ? <div style={{ padding: 12, color: '#ffdd99' }}>Önce bir Kasa seçin.</div> : null}
    </section>
  );
}
