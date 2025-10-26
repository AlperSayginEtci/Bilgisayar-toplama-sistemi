import { calcTotal, useStore } from '../state/hooks';
import type { Category } from '../state/store';
import type { Anakart, Islemci, Ram, EkranKarti, Psu, Kasa, Depolama, Monitor, Klavye, Fare, IslemciSogutucu } from '../data/loader';

type AnyItem = Anakart | Islemci | Ram | EkranKarti | Psu | Kasa | Depolama | Monitor | Klavye | Fare | IslemciSogutucu | null | undefined;

type Displayable = { id?: string | number; marka?: string; ad?: string; model?: string; fiyat_try?: number | string };

export default function Summary() {
  const { state, dispatch } = useStore();
  const total = calcTotal(state);
  // Ensure the displayed order always matches the bottom picker strip
  const orderedCategories: Category[] = [
    'anakart',
    'islemci',
    'ram',
    'ekran_karti',
    'psu',
    'kasa',
    'depolama',
    'monitor',
    'klavye',
    'fare',
    'islemci_sogutucu',
  ];

  const categoryLabels: Record<string, string> = {
    anakart: 'Anakart',
    islemci: 'İşlemci',
    ram: 'RAM (Bellek)',
    ekran_karti: 'Ekran Kartı',
    psu: 'Güç Kaynağı',
    kasa: 'Kasa',
    depolama: 'Depolama',
    monitor: 'Monitör',
    klavye: 'Klavye',
    fare: 'Mouse',
    islemci_sogutucu: 'CPU Soğutucu',
  };

  return (
    <aside className="summary-fixed">
      <div className="summary-inner">
        <h3>Seçili Parçalar</h3>
        <ul>
          {/* Render selected items in the canonical order */}
          {orderedCategories.filter((c) => !!state.selected[c]).length === 0 && <li>Henüz seçim yok</li>}
          {orderedCategories.map((category) => {
            const id = state.selected[category];
            if (!id) return null;
            const list = (state.data as unknown as Record<string, AnyItem[]> | null)?.[category] as AnyItem[] | undefined;
            const item = list?.find((x) => (x as unknown as Displayable)?.id === id) as AnyItem | undefined;
            const disp = item as unknown as Displayable | undefined;
            const displayName = disp ? (disp.marka ?? disp.ad ?? disp.model ?? disp.id ?? 'Seçilmedi') : 'Seçilmedi';
            const displayModel = disp ? (disp.model ?? '') : '';
            const priceStr = disp && disp.fiyat_try ? `${Number(disp.fiyat_try).toLocaleString('tr-TR')} TRY` : '-';
            const label = categoryLabels[category] ?? category;
            return (
              <li key={category} className="summary-item">
                <div className="summary-item-left">
                  <div className="item-title">{label}: {String(displayName)}</div>
                  {displayModel && <div className="item-sub">{displayModel}</div>}
                </div>
                <div className="summary-item-right">
                  <div className="item-price">{priceStr}</div>
                  <button onClick={() => dispatch({ type: 'SELECT', category, id: null })}>Kaldır</button>
                </div>
              </li>
            );
          })}
        </ul>

        <hr />
        <div className="summary-total">
          <strong>Toplam:</strong> {total.toLocaleString('tr-TR')} TRY
        </div>
      </div>
    </aside>
  );
}
