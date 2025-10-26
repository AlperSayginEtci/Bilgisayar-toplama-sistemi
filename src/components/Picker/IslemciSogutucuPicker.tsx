// src/components/Picker/IslemciSogutucuPicker.tsx
import { useState } from 'react';
import { useStore } from '../../state/hooks';
import { coolerCompatible } from '../../utils/compat';

export default function IslemciSogutucuPicker() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState('');
  const list = state.data?.islemci_sogutucu ?? [];
  const cpu = state.data?.islemci?.find((c) => c.id === state.selected['islemci']) ?? null;
  const kasa = state.data?.kasa?.find((k) => k.id === state.selected['kasa']) ?? null;

  const filtered = list.filter((c) => {
    const out = (c.stok && typeof c.stok === 'object' ? (c.stok as { durum?: string }).durum === 'out_of_stock' : false);
    if (q && !String(c.marka ?? c.ad ?? c.id).toLowerCase().includes(q.toLowerCase())) return false;
    const ok = coolerCompatible(c, cpu ?? undefined, kasa ?? undefined);
    return ok.ok;
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Soğutucu ara" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((c) => {
          const out = (c.stok && typeof c.stok === 'object' ? (c.stok as { durum?: string }).durum === 'out_of_stock' : false);
          const sockets = Array.isArray(c.desteklenen_soketler) ? c.desteklenen_soketler.join(', ') : (c.desteklenen_soketler ?? '-');
          const maxTdp = c.max_tdp_w ?? '-';
          const height = c.yukseklik_mm ?? c.yukseklik ?? '-';
          const fanCount = c.fan_sayisi ?? '-';
          const radiator = c.radyator_mm ?? '-';

          return (
            <li key={c.id} className="picker-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                  <div className="item-title">
                    {c.marka ?? c.ad ?? c.id} {c.model ?? ''} {out ? <span style={{ fontSize: 12, color: '#f88', marginLeft: 8 }}>Stokta yok</span> : null}
                  </div>
                  <div className="item-sub">
                    Tip: {c.tip ?? '-'} • Soketler: {sockets} • Max TDP: {maxTdp}W
                    <br />Yükseklik: {height}mm • Fan: {fanCount} • Radyatör: {radiator}mm {c.rgb ? '• RGB' : ''}
                  </div>
                </div>
              </div>
              <div className="price-area">
                <button disabled={out} onClick={() => dispatch({ type: 'SELECT', category: 'islemci_sogutucu', id: c.id })} style={{ padding: '6px 10px' }}>
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
