// src/components/Picker/KlavyePicker.tsx
import { useState } from 'react';
import { useStore } from '../../state/hooks';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect width="100%" height="100%" fill="%23e6e6e6"/></svg>';

export default function KlavyePicker() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState('');
  const list = state.data?.klavye ?? [];

  const filtered = list.filter((k) => {
    const out = (k.stok && typeof k.stok === 'object' ? (k.stok as any).durum === 'out_of_stock' : false);
    if (out) return false;
    if (q && !String((k.marka ?? k.ad ?? k.id)).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Klavye ara" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((k) => {
          const out = (k.stok && typeof k.stok === 'object' ? (k.stok as any).durum === 'out_of_stock' : false);
          return (
            <li key={k.id} className="picker-item">
              <div>
                <div className="item-title">{k.marka ?? k.id} {k.ad ?? ''} {out ? <span style={{ fontSize: 12, color: '#f88', marginLeft: 8 }}>Stokta yok</span> : null}</div>
                <div className="item-sub">{k.boyut ?? '-'} • {k.dizilim ?? '-'}</div>
              </div>
              <div className="price-area">
                <button disabled={out} onClick={() => dispatch({ type: 'SELECT', category: 'klavye', id: k.id })} style={{ padding: '6px 10px' }}>
                  {Number(k.fiyat_try ?? 0).toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
       </ul>
     </section>
   );
 }
