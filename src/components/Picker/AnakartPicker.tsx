// src/components/Picker/AnakartPicker.tsx
import { useState } from 'react';
import { useStore } from '../../state/hooks';
import { cpuCompatible } from '../../utils/compat';

export default function AnakartPicker() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState('');
  const boards = state.data?.anakart ?? [];
  const selectedCpuId = state.selected['islemci'];
  const selectedCpu = state.data?.islemci?.find((c) => c.id === selectedCpuId) ?? null;

  if (state.loading) return <div>Yükleniyor...</div>;

  const filtered = boards.filter((b) => {
    if (!q) return true;
    const haystack = ((b.marka ?? b.ad ?? '') + ' ' + (b.model ?? '') + ' ' + String(b.id ?? '')).toLowerCase();
    return haystack.includes(q.toLowerCase());
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Anakart ara" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((b) => {
          const outOfStock = (b.stok && typeof b.stok === 'object' ? (b.stok as { durum?: string }).durum === 'out_of_stock' : false);
          const compatible = cpuCompatible(b, selectedCpu);
          const disabled = outOfStock || !compatible;
          const price = b.fiyat_try ?? 0;
          return (
            <li key={b.id} className="picker-item">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                  <div className="item-title">{b.marka ?? b.ad ?? b.id} {b.model ?? ''} {outOfStock ? <span style={{ fontSize: 12, color: '#d9534f', marginLeft: 8 }}>Stokta yok</span> : null}</div>
                  <div className="item-sub">{b.form_factor ?? '-'} • Soket: {b.soket ?? '-'} • Bellek: {b.bellek?.tip ?? '-'} ({b.bellek?.yuva_sayisi ?? '-'} yuva)</div>
                </div>
              </div>
              <div className="price-area">
                <button
                  disabled={disabled}
                  onClick={() => dispatch({ type: 'SELECT', category: 'anakart', id: b.id })}
                  title={outOfStock ? 'Stokta yok' : !compatible ? 'Seçili işlemci ile uyumsuz' : ''}
                >
                  {price.toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
