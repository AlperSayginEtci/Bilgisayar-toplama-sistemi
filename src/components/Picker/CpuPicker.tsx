// src/components/Picker/CpuPicker.tsx
import { useState, useMemo } from 'react';
import { useStore } from '../../state/hooks';
import { cpuCompatible } from '../../utils/compat';

export default function CpuPicker() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState('');
  const [stockOnly, setStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [brands, setBrands] = useState<string[]>([]);

  const list = state.data?.islemci ?? [];
  const board = state.data?.anakart?.find((b) => b.id === state.selected['anakart']) ?? null;

  const availableBrands = useMemo(() => Array.from(new Set(list.map((c) => c.marka).filter(Boolean))) as string[], [list]);

  const filtered = list.filter((c) => {
    const out = (c.stok && typeof c.stok === 'object' ? (c.stok as { durum?: string }).durum === 'out_of_stock' : false);
    if (stockOnly && out) return false;
    if (q && !String((c.marka ?? c.model ?? c.id)).toLowerCase().includes(q.toLowerCase())) return false;
    if (brands.length > 0 && !(c.marka && brands.includes(c.marka))) return false;
    if (minPrice && Number(minPrice) > Number(c.fiyat_try ?? 0)) return false;
    if (maxPrice && Number(maxPrice) < Number(c.fiyat_try ?? 0)) return false;
    return cpuCompatible(board ?? undefined, c);
  });

  return (
    <section className="picker-section">
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <input placeholder="İşlemci ara" value={q} onChange={(e) => setQ(e.target.value)} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)} /> Stokta Olanlar
        </label>
        <input placeholder="Min fiyat" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ width: 100 }} />
        <input placeholder="Max fiyat" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: 100 }} />
      </div>

      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        {availableBrands.map((b) => (
          <label key={b} style={{ fontSize: 12 }}>
            <input
              type="checkbox"
              checked={brands.includes(b)}
              onChange={(e) => setBrands((prev) => (e.target.checked ? [...prev, b] : prev.filter((x) => x !== b)))}
            /> {b}
          </label>
        ))}
      </div>

      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((c) => {
          const out = (c.stok && typeof c.stok === 'object' ? (c.stok as { durum?: string }).durum === 'out_of_stock' : false);
          return (
            <li key={c.id} className="picker-item">
              <div>
                <div className="item-title">{c.marka ?? c.id} {c.model ?? ''} {out ? <span style={{ fontSize: 12, color: '#f88', marginLeft: 8 }}>Stokta yok</span> : null}</div>
                <div className="item-sub">TDP: {c.tdp_w ?? '-'}W • Soket: {c.soket ?? '-'}</div>
              </div>
              <div className="price-area">
                <button disabled={out} onClick={() => dispatch({ type: 'SELECT', category: 'islemci', id: c.id })} style={{ padding: '6px 10px' }}>
                  {Number(c.fiyat_try ?? 0).toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
       </ul>
     </section>
   );
 }
