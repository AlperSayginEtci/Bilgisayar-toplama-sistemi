// src/components/Picker/KlavyePicker.tsx
import { useStore } from '../../state/hooks';
import type { Klavye } from '../../data/loader';
import { matchesFilters } from '../../utils/filters';

// Define a proper type for keyboard items
interface KeyboardItem {
  id: string;
  marka: string;
  ad: string;
  boyut?: string;
  dizilim?: string;
  switch?: {
    tip: string;
    hot_swap: boolean;
  };
  kablosuz?: boolean;
  polling_hz?: number;
  arkadan_aydinlatma?: boolean;
  keycap?: {
    malzeme: string;
  };
  fiyat_try?: number;
  stok?: string | { durum: string };
}

// helper: check out_of_stock safely
function isOutOfStock(item: KeyboardItem) {
  const s = item.stok;
  if (s == null) return false;
  if (typeof s === 'string') return s === 'out_of_stock';
  if (typeof s === 'object') return s.durum === 'out_of_stock';
  return false;
}

export default function KlavyePicker() {
  const { state, dispatch } = useStore();
  const globalQ = state.filters?.['klavye']?.q ?? '';
  const list: KeyboardItem[] = (state.data?.klavye ?? []).map((k: Klavye) => ({
    id: k.id ?? '',
    marka: k.marka ?? '',
    ad: k.ad ?? '',
    boyut: k.boyut ?? '',
    dizilim: k.dizilim ?? '',
    switch: k.switch ?? { tip: '', hot_swap: false },
    kablosuz: k.kablosuz ?? false,
    polling_hz: k.polling_hz ?? 0,
    arkadan_aydinlatma: k.arkadan_aydinlatma ?? false,
    keycap: k.keycap ?? { malzeme: '' },
    fiyat_try: k.fiyat_try ?? 0,
    stok: k.stok && typeof k.stok === 'object' && 'durum' in k.stok ? k.stok.durum : '',
  }));

  const filters = state.filters?.['klavye'];
  const filtered = list.filter((k) => {
    const hay = `${k.marka} ${k.ad}`.toLowerCase();
    return !isOutOfStock(k) && (!globalQ || hay.includes(globalQ.toLowerCase())) && matchesFilters(k as unknown, filters);
  });
  const prevSelected = state.selected['monitor'];
  const locked = !prevSelected; // require Monitor first

  return (
    <section className="picker-section">
      <div className="picker-controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {/* Removed local search input; using global filters['klavye'].q instead */}
      </div>
      <ul className="picker-list" style={{ padding: 0 }}>
        {filtered.map((k) => {
          const out = isOutOfStock(k);
          const itemDisabled = out || locked;

          // Build displayModel and displayDetails without duplication.
          const brand = k.marka ?? '';
          const adRaw = (k.ad ?? '').trim();
          // tokens that represent size/layout provided separately
          const detailsTokens = [k.boyut, k.dizilim].filter(Boolean).map(String).map((t) => t.trim()).filter(Boolean);

          // helper: escape regex
          const esc = (s: string) => s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');

          // compact helper: lowercase and remove all non-alphanumeric chars -> used for robust matching
          const compact = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '').trim();

          // detect which tokens are present in the original adRaw using flexible regex (handles TR-Q, TR Q, etc.)
          // we only need tokensPresent during construction; remove unused var to satisfy linter

          // More robust ad cleaning: split ad into parts and remove parts matching detail tokens
          const adNoBrand = brand ? adRaw.replace(new RegExp(`\\b${esc(brand)}\\b`, 'ig'), '').trim() : adRaw;
          const adParts = adNoBrand.split(/[^a-zA-Z0-9%-]+/).filter(Boolean);
          const detailCompacts = detailsTokens.map((t) => compact(t));
          const keptParts = adParts.filter((p) => {
            const pc = compact(p);
            // remove if exactly equals a detail token or contains it (safe check)
            for (const dc of detailCompacts) {
              if (!dc) continue;
              if (pc === dc) return false;
              if (pc.includes(dc)) return false;
              if (dc.includes(pc)) return false;
            }
            return true;
          });
          const adClean = keptParts.join(' ').trim();

          let displayModel = `${brand}${adClean ? ' ' + adClean : ''}`.trim().replace(/\b(\S+)(?:\s+\1\b)+/ig, '$1');
          // extra safety: remove any remaining detail tokens from displayModel (flexible match using lookarounds)
          for (const t of detailsTokens) {
            const parts = String(t).split(/[^a-zA-Z0-9]+/).filter(Boolean).map(esc);
            if (parts.length === 0) continue;
            const pattern = parts.join('(?:[-\\s]+)');
            // use lookbehind/lookahead to match whole token sequences regardless of dashes/spaces
            const rAll = new RegExp(`(?<=^|\\s)${pattern}(?=\\s|$)`, 'ig');
            displayModel = displayModel.replace(rAll, '').replace(/\s+/g, ' ').trim();
          }
          // ensure brand appears at start only once: remove any brand occurrences and re-prepend once
          if (brand) {
            const rBrandAll = new RegExp(`\\b${esc(brand)}\\b`, 'ig');
            displayModel = displayModel.replace(rBrandAll, '').replace(/\s+/g, ' ').trim();
            displayModel = `${brand}${displayModel ? ' ' + displayModel : ''}`.trim();
          }

          // show size and layout explicitly in details (e.g. "TKL • TR-Q")
          const displayDetails = [k.boyut, k.dizilim].filter(Boolean).join(' • ').trim();
          const switchText = k.switch ? `Switch: ${k.switch.tip} ${k.switch.hot_swap ? '(Hot-swap)' : '(Hot-swap yok)'}` : '';

          return (
            <li key={k.id} className="picker-item" style={{ padding: 12, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="item-title" style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset', fontWeight: 600, lineHeight: 1.2, marginBottom: 6 }}>{displayModel}</div>
                <div className="item-sub" style={{ lineHeight: 1.3 }}>
                  {displayDetails ? <div>{displayDetails}</div> : null}
                  <div className="item-sub-line" style={{ fontSize: 13, marginTop: 6 }}>
                    {switchText}{switchText ? ' • ' : ''}
                    {k.kablosuz ? 'Kablosuz • ' : ''}
                    {k.polling_hz ? `Polling: ${k.polling_hz} Hz • ` : ''}
                    {k.arkadan_aydinlatma ? `Aydınlatma` : ''}
                    {k.keycap?.malzeme ? ` • Keycap: ${k.keycap.malzeme}` : ''}
                  </div>
                </div>
              </div>
              <div style={{ marginLeft: 12, display: 'flex', alignItems: 'center' }}>
                <button disabled={itemDisabled} onClick={() => dispatch({ type: 'SELECT', category: 'klavye', id: k.id })} style={{ padding: '8px 12px' }}>
                  {Number(k.fiyat_try ?? 0).toLocaleString('tr-TR')} TRY
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {locked ? <div style={{ padding: 12, color: '#ffdd99' }}>Önce bir Monitör seçin.</div> : null}
    </section>
  );
}
