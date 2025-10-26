import type { FilterSpec } from '../state/store';

type Item = Record<string, unknown> | null | undefined;

function inStock(item: Item): boolean {
  if (!item || typeof item !== 'object') return false;
  const stok = (item as Record<string, unknown>)['stok'];
  if (typeof stok === 'string') return stok !== 'out_of_stock';
  if (stok && typeof stok === 'object') {
    const durum = (stok as Record<string, unknown>)['durum'];
    return typeof durum === 'string' ? durum !== 'out_of_stock' : true;
  }
  return true;
}

function asString(val: unknown): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return '';
}

export function matchesFilters(item: unknown, filters?: FilterSpec): boolean {
  if (!filters) return true;
  if (!item || typeof item !== 'object') return false;

  const obj = item as Record<string, unknown>;

  // brands
  if (filters.brands && filters.brands.length > 0) {
    const marka = asString(obj['marka']) || asString(obj['ad']) || '';
    if (!filters.brands.includes(marka)) return false;
  }

  // price
  const rawPrice = obj['fiyat_try'];
  const price = typeof rawPrice === 'number' ? rawPrice : typeof rawPrice === 'string' ? Number(rawPrice.replace(/[^0-9.-]+/g, '')) : 0;
  if (filters.minPrice != null) {
    if (price < (filters.minPrice ?? 0)) return false;
  }
  if (filters.maxPrice != null) {
    if (price > (filters.maxPrice ?? Infinity)) return false;
  }

  // inStock
  if (filters.inStockOnly) {
    if (!inStock(obj)) return false;
  }

  // feature: match against etiketler, ad, model, seri
  if (filters.feature) {
    const f = String(filters.feature).toLowerCase();
    const etiketler = obj['etiketler'];
    let tags = '';
    if (Array.isArray(etiketler)) tags = etiketler.map((x) => asString(x)).join(' ');
    const hay = (tags + ' ' + asString(obj['ad']) + ' ' + asString(obj['model']) + ' ' + asString(obj['seri'])).toLowerCase();
    if (!hay.includes(f)) return false;
  }

  return true;
}
