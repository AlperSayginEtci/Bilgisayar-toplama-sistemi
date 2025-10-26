// src/components/Picker/GpuPicker.tsx
import { useState } from 'react';
import { useStore } from '../../state/hooks';
import { gpuCompatible } from '../../utils/compat';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect width="100%" height="100%" fill="%23e6e6e6"/></svg>';

export default function GpuPicker() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState('');
  const list = state.data?.ekran_karti ?? [];
  const board = state.data?.anakart?.find((b) => b.id === state.selected['anakart']) ?? null;

  const filtered = list.filter((g) => {
    const out = (g.stok && typeof g.stok === 'object' ? (g.stok as any).durum === 'out_of_stock' : false);
    if (out) return false;
    if (q && !((g.marka ?? g.ad ?? g.id) as string).toLowerCase().includes(q.toLowerCase())) return false;
    const comp = gpuCompatible(board ?? undefined, g);
    return comp.ok;
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Ekran kartı ara" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((g) => {
          const out = (g.stok && typeof g.stok === 'object' ? (g.stok as any).durum === 'out_of_stock' : false);
          return (
            <li key={g.id} className="picker-item">
              <div>
                <div className="item-title">{g.marka ?? g.id} {g.model ?? ''} {out ? <span style={{ fontSize: 12, color: '#f88', marginLeft: 8 }}>Stokta yok</span> : null}</div>
                <div className="item-sub">VRAM: {g.vram?.boyut_gb ?? '-'}GB • PCIe: {g.pcie_arayuz?.surum ?? '-'}</div>
              </div>
              <div className="price-area">
                <button disabled={out} onClick={() => dispatch({ type: 'SELECT', category: 'ekran_karti', id: g.id })} style={{ padding: '6px 10px' }}>
                  {Number(g.fiyat_try ?? 0).toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
