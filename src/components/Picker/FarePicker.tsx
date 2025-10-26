// src/components/Picker/FarePicker.tsx
import { useState } from 'react';
import { useStore } from '../../state/hooks';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect width="100%" height="100%" fill="%23e6e6e6"/></svg>';

export default function FarePicker() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState('');
  const list = state.data?.fare ?? [];

  const filtered = list.filter((f) => {
    const out = (f.stok && typeof f.stok === 'object' ? (f.stok as any).durum === 'out_of_stock' : false);
    if (out) return false;
    if (q && !String((f.marka ?? f.ad ?? f.id)).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Fare ara" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((f) => {
          const out = (f.stok && typeof f.stok === 'object' ? (f.stok as any).durum === 'out_of_stock' : false);
          return (
            <li key={f.id} className="picker-item">
              <div>
                <div className="item-title">{f.marka ?? f.id} {f.ad ?? ''} {out ? <span style={{ fontSize: 12, color: '#f88', marginLeft: 8 }}>Stokta yok</span> : null}</div>
                <div className="item-sub">DPI: {f.dpi?.min ?? '-'}-{f.dpi?.max ?? '-'} • Ağırlık: {f.agirlik_g ?? '-' }g</div>
              </div>
              <div className="price-area">
                <button disabled={out} onClick={() => dispatch({ type: 'SELECT', category: 'fare', id: f.id })} style={{ padding: '6px 10px' }}>
                  {Number(f.fiyat_try ?? 0).toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
