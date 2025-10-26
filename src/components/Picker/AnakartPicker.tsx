
import { useStore } from '../../state/hooks';
import { cpuCompatible } from '../../utils/compat';
import { matchesFilters } from '../../utils/filters';
import type { Anakart as AnakartType, Islemci as IslemciType } from '../../data/loader';


function isOutOfStock(item?: Partial<AnakartType> | null): boolean {
  const s = item?.stok;
  if (s == null) return false;
  // loader types define stok as object { durum?: string }
  if (typeof s === 'object') {
    return (s as { durum?: string }).durum === 'out_of_stock';
  }
  return false;
}

export default function AnakartPicker() {
  const { state, dispatch } = useStore();
  const globalQ = state.filters?.['anakart']?.q ?? '';
  const boards: AnakartType[] = (state.data?.anakart ?? []) as AnakartType[];
  const selectedCpuId = state.selected['islemci'] as string | undefined;
  const selectedCpu = (state.data?.islemci ?? []).find((c: IslemciType) => c.id === selectedCpuId) ?? null;

  if (state.loading) return <div>Yükleniyor...</div>;

  const filters = state.filters?.['anakart'];
  const filtered = boards.filter((b) => {
    if (globalQ) {
      const haystack = ((b.marka ?? b.ad ?? '') + ' ' + (b.model ?? '') + ' ' + String(b.id ?? '')).toLowerCase();
      if (!haystack.includes(globalQ.toLowerCase())) return false;
    }
    // matchesFilters already handles undefined safely
    return matchesFilters(b, filters);
  });

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {/* Search moved to FilterBar (global q) */}
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((b) => {
          const outOfStock = isOutOfStock(b);
          const compatible = cpuCompatible(b as AnakartType, selectedCpu as IslemciType | null);
          const disabled = outOfStock || !compatible;
          const price = b.fiyat_try ?? 0;

          const hizArr = Array.isArray(b.bellek?.hiz_mhz) ? (b.bellek!.hiz_mhz as number[]) : [];
          const maxRamSpeed = hizArr.length ? Math.max(...hizArr) : null;

          return (
            <li key={b.id} className="picker-item">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                  <div className="item-title">{b.marka ?? b.ad ?? b.id} {b.model ?? ''} {outOfStock ? <span style={{ fontSize: 12, color: '#d9534f', marginLeft: 8 }}>Stokta yok</span> : null}</div>
                  <div className="item-sub">
                    {b.form_factor ?? '-'} • Soket: {b.soket ?? (b.cpu_uyumluluk?.socket ?? '-') } • Bellek: {b.bellek?.tip ?? '-'} ({b.bellek?.yuva_sayisi ?? '-'} yuva)
                    {maxRamSpeed ? (<span> • Max RAM hızı: {maxRamSpeed} MHz</span>) : null}
                  </div>
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
