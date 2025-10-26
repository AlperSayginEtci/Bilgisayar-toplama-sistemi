// src/components/Picker/IslemciSogutucuPicker.tsx
import { useStore } from '../../state/hooks';
import { matchesFilters } from '../../utils/filters';
import type { IslemciSogutucu as CoolerType, Islemci as IslemciType, Kasa as KasaType } from '../../data/loader';

export default function IslemciSogutucuPicker() {
  const { state, dispatch } = useStore();
  const globalQ = state.filters?.['islemci_sogutucu']?.q ?? '';
  const list: CoolerType[] = (state.data?.islemci_sogutucu ?? []) as CoolerType[];
  const cpu: IslemciType | null = (state.data?.islemci ?? []).find((c) => c.id === state.selected['islemci']) ?? null;
  const kasa: KasaType | null = (state.data?.kasa ?? []).find((k) => k.id === state.selected['kasa']) ?? null;
  const prevSelected = state.selected['fare'];
  const locked = !prevSelected; // require Fare first

  const filters = state.filters?.['islemci_sogutucu'];
  const filtered = list.filter((c) => {
    const out = (c.stok && typeof c.stok === 'object' ? (c.stok as { durum?: string }).durum === 'out_of_stock' : false);
    if (out) return false;
    if (globalQ && !((c.marka ?? c.ad ?? c.id) as string).toLowerCase().includes(globalQ.toLowerCase())) return false;
    if (!matchesFilters(c, filters)) return false;
    return true;
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {/* Global search moved to FilterBar */}
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((c) => {
          const out = (c.stok && typeof c.stok === 'object' ? (c.stok as { durum?: string }).durum === 'out_of_stock' : false);
          const itemDisabled = out || locked;
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
                <button disabled={itemDisabled} onClick={() => dispatch({ type: 'SELECT', category: 'islemci_sogutucu', id: c.id })} style={{ padding: '6px 10px' }}>
                  {Number(c.fiyat_try ?? 0).toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {locked ? <div style={{ padding: 12, color: '#ffdd99' }}>Önce bir Fare seçin.</div> : null}
    </section>
  );
}
