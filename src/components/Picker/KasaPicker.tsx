// src/components/Picker/KasaPicker.tsx
import { useState } from 'react';
import { useStore } from '../../state/hooks';
import { caseFits } from '../../utils/compat';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect width="100%" height="100%" fill="%23e6e6e6"/></svg>';

export default function KasaPicker() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState('');
  const list = state.data?.kasa ?? [];
  const board = state.data?.anakart?.find((b) => b.id === state.selected['anakart']) ?? null;
  const gpu = state.data?.ekran_karti?.find((g) => g.id === state.selected['ekran_karti']) ?? null;
  const cooler = state.data?.islemci_sogutucu?.find((c) => c.id === state.selected['islemci_sogutucu']) ?? null;

  const filtered = list.filter((k) => {
    const out = (k.stok && typeof k.stok === 'object' ? (k.stok as any).durum === 'out_of_stock' : false);
    if (out) return false;
    if (q && !((k.marka ?? k.ad ?? k.id) as string).toLowerCase().includes(q.toLowerCase())) return false;
    const ok = caseFits(k, board ?? undefined, gpu ?? undefined, cooler ?? undefined);
    return ok.ok;
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Kasa ara" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((k) => {
          const out = (k.stok && typeof k.stok === 'object' ? (k.stok as any).durum === 'out_of_stock' : false);
          return (
            <li key={k.id} className="picker-item">
              <div>
                <div className="item-title">{k.marka ?? k.id} {k.model ?? ''} {out ? <span style={{ fontSize: 12, color: '#f88', marginLeft: 8 }}>Stokta yok</span> : null}</div>
                <div className="item-sub">Destek: {Array.isArray(k.mobo_dest) ? k.mobo_dest.join(', ') : (k.mobo_dest ?? '-')}</div>
              </div>
              <div className="price-area">
                <button disabled={out} onClick={() => dispatch({ type: 'SELECT', category: 'kasa', id: k.id })} style={{ padding: '6px 10px' }}>
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
