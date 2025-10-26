import { useMemo, useState } from 'react';
import { useStore } from '../state/hooks';
import type { Category, FilterSpec } from '../state/store';

export default function FilterBar({ category }: { category: Category }) {
  const { state, dispatch } = useStore();
  const existing = state?.filters?.[category] ?? {};
  const [brands, setBrands] = useState<string[]>(existing?.brands ?? []);
  const [minPrice, setMinPrice] = useState<string>(existing?.minPrice != null ? String(existing.minPrice) : '');
  const [maxPrice, setMaxPrice] = useState<string>(existing?.maxPrice != null ? String(existing.maxPrice) : '');
  const [feature, setFeature] = useState<string>(existing?.feature ?? '');
  const [inStockOnly, setInStockOnly] = useState<boolean>(existing?.inStockOnly ?? false);
  const [q, setQ] = useState<string>(existing?.q ?? '');

  // derive available brands from state.data for this category
  const availableBrands = useMemo(() => {
    const data = state?.data as unknown as Record<string, unknown> | null;
    const list = data ? (data[category] as unknown[]) : [];
    const set = new Set<string>();
    if (Array.isArray(list)) {
      for (const it of list) {
        if (!it || typeof it !== 'object') continue;
        const marka = (it as Record<string, unknown>)['marka'];
        if (typeof marka === 'string' && marka) set.add(marka);
      }
    }
    return Array.from(set).sort();
  }, [state?.data, category]);

  function apply() {
    const payload: FilterSpec = {
      brands: brands.length ? brands : undefined,
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      feature: feature || undefined,
      inStockOnly: inStockOnly || undefined,
      q: q || undefined,
    };
    dispatch({ type: 'SET_FILTERS', category, payload });
  }

  function clear() {
    setBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setFeature('');
    setInStockOnly(false);
    setQ('');
    dispatch({ type: 'SET_FILTERS', category, payload: null });
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <select multiple value={brands} onChange={(e) => setBrands(Array.from(e.target.selectedOptions, (o) => o.value))} style={{ minWidth: 160, height: 80 }}>
          {availableBrands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <input placeholder="Min fiyat" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ width: 100 }} />
        <input placeholder="Max fiyat" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: 100 }} />
        <input placeholder="Özellik ara (örn. DDR5, 144Hz, 80+ Gold)" value={feature} onChange={(e) => setFeature(e.target.value)} style={{ width: 260 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} /> Sadece stokta olanlar
        </label>
        <input placeholder="Genel ara" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 240 }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={apply} style={{ padding: '6px 10px' }}>Filtrele</button>
        <button onClick={clear} style={{ padding: '6px 10px' }}>Temizle</button>
      </div>
    </div>
  );
}
