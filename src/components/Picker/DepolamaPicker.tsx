// src/components/Picker/DepolamaPicker.tsx
import { useState } from 'react';
import { useStore } from '../../state/hooks';
import { storageCompatible } from '../../utils/compat';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect width="100%" height="100%" fill="%23e6e6e6"/></svg>';

export default function DepolamaPicker() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState('');
  const list = state.data?.depolama ?? [];
  const board = state.data?.anakart?.find((b) => b.id === state.selected['anakart']) ?? null;

  const filtered = list.filter((d) => {
    const out = (d.stok && typeof d.stok === 'object' ? (d.stok as any).durum === 'out_of_stock' : false);
    if (out) return false;
    if (q && !((d.marka ?? d.ad ?? d.id) as string).toLowerCase().includes(q.toLowerCase())) return false;
    const ok = storageCompatible(board ?? undefined, d);
    return ok.ok;
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Depolama ara" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((d) => {
          const out = (d.stok && typeof d.stok === 'object' ? (d.stok as any).durum === 'out_of_stock' : false);
          return (
            <li key={d.id} className="picker-item">
              <div>
                <div className="item-title">{d.marka ?? d.id} {d.model ?? ''} {out ? <span style={{ fontSize: 12, color: '#f88', marginLeft: 8 }}>Stokta yok</span> : null}</div>
                <div className="item-sub">{d.form_factor ?? '-'} • {d.kapasite_gb ?? '-'}GB</div>
              </div>
              <div className="price-area">
                <button disabled={out} onClick={() => dispatch({ type: 'SELECT', category: 'depolama', id: d.id })} style={{ padding: '6px 10px' }}>
                  {Number(d.fiyat_try ?? 0).toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
