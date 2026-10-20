# 🖥️ PC Builder — Compatibility-Aware PC Configurator

A single-page web app that guides users step by step through building a desktop PC. At each step it hides or flags parts that are incompatible with what has already been chosen, and it keeps a running total price. Built with **React 19 + TypeScript + Vite**.

> The UI is in Turkish (the project was built for a Turkish-speaking audience); the code and this documentation are in English.

## Features

- **Guided build flow across 11 categories:** Motherboard → CPU → RAM → GPU → PSU → Case → Storage → Monitor → Keyboard → Mouse → CPU Cooler. A step unlocks only after the previous one is chosen
- **Compatibility engine** (`src/utils/compat.ts`) that checks:
  - CPU ↔ motherboard: vendor, socket and supported generations
  - RAM ↔ motherboard: memory type (DDR4/DDR5), max speed, slot count
  - GPU ↔ motherboard: PCIe x16 slot availability and PCIe generation (shows a bandwidth warning)
  - PSU: wattage headroom (CPU TDP + GPU TGP + 150 W) and the 12VHPWR connector
  - Case: motherboard form factor, GPU length, cooler height clearance
  - Cooler: socket support and TDP rating
  - Storage: SATA ports and M.2 NVMe slots, including PCIe generation
- **Cascade reset:** changing an earlier part automatically clears the later selections that depend on it
- **Filtering and search** by brand, price range, feature tags (e.g. DDR5, 144 Hz, 80+ Gold) and stock status
- **Stock awareness:** out-of-stock items are greyed out and cannot be selected
- **Live summary panel** with the total price in TRY
- **Persistence:** the build is saved to `localStorage` and restored on reload
- **Dataset:** 330 products (30 per category) as typed JSON files

## Tech Stack

| Area | Tools |
|---|---|
| UI | React 19 (function components and hooks) |
| Language | TypeScript (strict typed part models in `src/types/parts.ts`) |
| State | `useReducer` + Context (a custom store, no external library) |
| Build | Vite |
| Styling | CSS + Tailwind CSS |
| Data | Static JSON in `public/data/` |

## Project Structure

```
src/
├── components/
│   ├── Picker/          # one picker per category (CpuPicker, RamPicker, GpuPicker, …)
│   ├── FilterBar.tsx    # brand / price / feature / stock filters
│   └── Summary.tsx      # fixed selection summary and total
├── state/               # reducer-based store, cascade-clear logic, hooks
├── utils/
│   ├── compat.ts        # compatibility rules
│   └── filters.ts       # filter helpers
├── data/loader.ts       # loads all JSON datasets
└── types/parts.ts       # TypeScript interfaces for every part type
public/data/*.json       # product catalog
```

## Getting Started

```bash
git clone https://github.com/AlperSayginEtci/Bilgisayar-toplama-sistemi.git
cd Bilgisayar-toplama-sistemi
npm install
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`).

```bash
npm run build     # type-check and production build
npm run preview   # preview the production build
```

## Possible Improvements
- Unit tests for the compatibility rules
- Shareable build links (encode the selection in the URL)
- Fetch live prices from an API instead of static JSON
