
## ✨ Proje: PC Toplama
"PC Toplama" tek sayfa (SPA) React + TypeScript projesidir. Amaç; /public/data içindeki JSON veri setlerini kullanarak, kullanıcıların adım adım parça seçip uyumlu bir bilgisayar toplamasını sağlamak, filtreleme/arama ve stok kontrolü gibi kullanıcı dostu özellikler sunmaktır.

Kullanım senaryosu örneği: kullanıcı önce bir anakart seçer, ona uygun işlemciler listelenir; ardından RAM, GPU, PSU, Kasa vb. sırasıyla seçilir. Uyumsuz parçalar pasif/gizli veya uyarılı gösterilir.

## 🛠 Temel Özellikler
- Adım adım seçim akışı: Anakart → İşlemci → RAM → Ekran Kartı → PSU → Kasa → Depolama → Monitör → Klavye → Fare → CPU Soğutucu
- Uyumluluk kuralları uygulaması (anakart-CPU, anakart-RAM, anakart-GPU, kasa-uyumları, PSU-güç/konnektör, depolama-m.2/sata kontrolleri vb.)
- Stok kontrolü: stokta olmayan ürünler gri gösterilir ve seçilemez.
- Filtreleme & arama: marka, fiyat aralığı, özellik (örn. DDR5, 144Hz, 80+ Gold) — global FilterBar ile picker içeriğini filtreleme
- Seçim özeti ve toplam fiyat: sabit özet paneli (sağ/üst)
- Seçimlerin saklanması: localStorage ile sayfa yenilense bile seçimler korunur
- UI iyileştirmeleri: alt picker şeridi, sabit orta liste alanı, öğe kartlarında stok/özellik bilgileri
- Tip güvenliği: TypeScript arayüzleri (`src/types/parts.ts`) — kodun okunabilirliği ve bakım kolaylığı için

## 🧩 Kullanılan Teknolojiler
- React (Function components + Hooks)
- TypeScript
- Vite (dev server / build)
- Tailwind CSS (isteğe bağlı; proje içinde temel stiller kullanılabilir)
- Yerel JSON verileri: /public/data/*.json

> Not: Projede hem klasik CSS hem de Tailwind parçaları bulunabilir. Tailwind veya PostCSS ayarlarında "type": "module" içeren package.json olduğu durumlarda `postcss.config.cjs` kullanılması gerekebilir (aşağıda hata giderme bölümünde kısa not var).

## 🚀 Başlarken (Hızlı kurulum)
Terminal/komut istemcisinde proje klasörüne gidin (ör: repository root) ve aşağıyı çalıştırın:

```bash
npm install
npm run dev
```

- `npm run dev` ardından Vite dev sunucusu açılır (ör. http://localhost:5173 veya konsolda verilen port).
- Eğer Tailwind kurulum adımlarını uygulamak isterseniz:
  - `npm install -D tailwindcss postcss autoprefixer` (Windows cmd için && yerine ayrı satırlarda çalıştırın)
  - `npx tailwindcss init -p` (veya manuel `postcss.config.cjs` oluşturun)
  - PostCSS konfigürasyonunda `@tailwindcss/postcss` eklentisi gerekebilir; hata ile karşılaşırsanız README altındaki Hata Giderme bölümüne bakın.

## 📁 Proje Yapısı (Önemli dosyalar)
Aşağıda projede sık kullanacağınız ana dizin ve dosyaların özeti var:

- `public/data/` — Tüm JSON veri dosyaları (anakart.json, islemci.json, ram.json, ekran_karti.json, psu.json, kasa.json, depolama.json, monitor.json, klavye.json, fare.json, islemci_sogutucu.json)
- `src/`
  - `main.tsx`, `index.css` — uygulama giriş noktası
  - `App.tsx` — ana layout: FilterBar, picker-card, bottom picker strip, Summary
  - `App.css` — uygulamaya ait global stiller
  - `data/loader.ts` — JSON dosyalarını fetch eden yardımcı; tipleri `src/types/parts.ts` üzerinden alır
  - `types/parts.ts` — proje genelinde kullanılan TypeScript arayüzleri (BasePart, Anakart, Islemci, Ram, ...)
  - `state/`
    - `store.tsx` — global state provider, seçili parçalar ve cascade-clear mantığı burada
    - `hooks.ts` — kolay erişim hook'ları, toplam hesaplama vb.
    - `internalContext.tsx` — context wrapper
  - `components/`
    - `Summary.tsx` — sağ üst sabit seçim özeti
    - `FilterBar.tsx` — global filtre/arama bileşeni
    - `Picker/` — her kategori için picker bileşenleri (AnakartPicker.tsx, CpuPicker.tsx, RamPicker.tsx, ...)

## 📊 Veri Kaynağı
- Tüm ürün verileri JSON formatında `public/data/` klasöründe yer alır.
- Dosyalar: `anakart.json`, `islemci.json`, `ram.json`, `ekran_karti.json`, `psu.json`, `kasa.json`, `depolama.json`, `monitor.json`, `klavye.json`, `fare.json`, `islemci_sogutucu.json`.
- `src/data/loader.ts` bu dosyaları fetch edip `AllData` tipine göre döndürür.
- Tipler ve arayüzler `src/types/parts.ts` içinde tanımlıdır; böylece bileşenler tip güvenli şekilde verilerle çalışır.

