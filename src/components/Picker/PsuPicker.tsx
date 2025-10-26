// src/components/Picker/PsuPicker.tsx
import { useState } from 'react';
import { useStore } from '../../state/hooks';
import { psuEnough } from '../../utils/compat';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect width="100%" height="100%" fill="%23e6e6e6"/></svg>';

export default function PsuPicker() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState('');
  const list = state.data?.psu ?? [];
  const cpu = state.data?.islemci?.find((c) => c.id === state.selected['islemci']) ?? null;
  const gpu = state.data?.ekran_karti?.find((g) => g.id === state.selected['ekran_karti']) ?? null;

  const filtered = list.filter((p) => {
    const out = (p.stok && typeof p.stok === 'object' ? (p.stok as any).durum === 'out_of_stock' : false);
    if (out) return false;
    if (q && !((p.marka ?? p.ad ?? p.id) as string).toLowerCase().includes(q.toLowerCase())) return false;
    const ok = psuEnough(p, cpu ?? undefined, gpu ?? undefined);
    return ok.ok;
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="PSU ara" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((p) => {
          const out = (p.stok && typeof p.stok === 'object' ? (p.stok as any).durum === 'out_of_stock' : false);
          return (
            <li key={p.id} className="picker-item">
              <div>
                <div className="item-title">{p.marka ?? p.id} {p.model ?? ''} {out ? <span style={{ fontSize: 12, color: '#f88', marginLeft: 8 }}>Stokta yok</span> : null}</div>
                <div className="item-sub">{p.guc_w ?? '-'}W • {p.efficiency ?? '-'}</div>
              </div>
              <div className="price-area">
                <button disabled={out} onClick={() => dispatch({ type: 'SELECT', category: 'psu', id: p.id })} style={{ padding: '6px 10px' }}>
                  {Number(p.fiyat_try ?? 0).toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
       </ul>
     </section>
   );
 }
