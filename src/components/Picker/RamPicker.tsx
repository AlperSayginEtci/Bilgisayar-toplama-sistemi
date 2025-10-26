// src/components/Picker/RamPicker.tsx
import { useState } from 'react';
import { useStore } from '../../state/hooks';
import { ramCompatible } from '../../utils/compat';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect width="100%" height="100%" fill="%23e6e6e6"/></svg>';

export default function RamPicker() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState('');
  const list = state.data?.ram ?? [];
  const board = state.data?.anakart?.find((b) => b.id === state.selected['anakart']) ?? null;

  const filtered = list.filter((r) => {
    const out = (r.stok && typeof r.stok === 'object' ? (r.stok as any).durum === 'out_of_stock' : false);
    if (out) return false;
    if (q && !((r.marka ?? r.ad ?? r.id) as string).toLowerCase().includes(q.toLowerCase())) return false;
    return ramCompatible(board ?? undefined, r);
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="RAM ara" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((r) => {
          const out = (r.stok && typeof r.stok === 'object' ? (r.stok as any).durum === 'out_of_stock' : false);
          return (
            <li key={r.id} className="picker-item">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                  <div className="item-title">{r.marka ?? r.id} {r.model ?? ''} {out ? <span style={{ fontSize: 12, color: '#f88', marginLeft: 8 }}>Stokta yok</span> : null}</div>
                  <div className="item-sub">{r.kapasite_kit_gb ?? (r.kapasite_modul_gb ? r.kapasite_modul_gb + 'GB' : '')} • {r.tip ?? '-'} • {r.modul_sayisi ?? '-'} modül</div>
                </div>
              </div>
              <div className="price-area">
                <button disabled={out} onClick={() => dispatch({ type: 'SELECT', category: 'ram', id: r.id })} style={{ padding: '6px 10px' }}>
                  {Number(r.fiyat_try ?? 0).toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
