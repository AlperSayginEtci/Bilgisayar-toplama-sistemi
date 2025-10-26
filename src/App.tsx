import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { StoreProvider } from './state/store';
import { useStore } from './state/hooks';
import AnakartPicker from './components/Picker/AnakartPicker';
import Summary from './components/Summary';
import CpuPicker from './components/Picker/CpuPicker';
import RamPicker from './components/Picker/RamPicker';
import GpuPicker from './components/Picker/GpuPicker';
import PsuPicker from './components/Picker/PsuPicker';
import KasaPicker from './components/Picker/KasaPicker';
import DepolamaPicker from './components/Picker/DepolamaPicker';
import MonitorPicker from './components/Picker/MonitorPicker';
import KlavyePicker from './components/Picker/KlavyePicker';
import FarePicker from './components/Picker/FarePicker';
import IslemciSogutucuPicker from './components/Picker/IslemciSogutucuPicker';
import FilterBar from './components/FilterBar';

const PICKERS = [
  { key: 'anakart', label: 'Anakart', comp: <AnakartPicker /> },
  { key: 'islemci', label: 'İşlemci', comp: <CpuPicker /> },
  { key: 'ram', label: 'RAM', comp: <RamPicker /> },
  { key: 'ekran_karti', label: 'Ekran Kartı', comp: <GpuPicker /> },
  { key: 'psu', label: 'PSU', comp: <PsuPicker /> },
  { key: 'kasa', label: 'Kasa', comp: <KasaPicker /> },
  { key: 'depolama', label: 'Depolama', comp: <DepolamaPicker /> },
  { key: 'monitor', label: 'Monitör', comp: <MonitorPicker /> },
  { key: 'klavye', label: 'Klavye', comp: <KlavyePicker /> },
  { key: 'fare', label: 'Fare', comp: <FarePicker /> },
  { key: 'islemci_sogutucu', label: 'CPU Soğutucu', comp: <IslemciSogutucuPicker /> },
];

function App() {
  const [active, setActive] = useState('anakart');
  const BOTTOM_BAR_HEIGHT = 80;

  return (
    <StoreProvider>
      {/* Summary is fixed top-right */}
      <Summary />

      <div style={{ padding: 16, paddingBottom: BOTTOM_BAR_HEIGHT + 24 }}>
        <main>
          <h1 style={{ marginTop: 0 }}>Bilgisayar Toplama</h1>

          {/* Filter bar for active category */}
          <FilterBar category={active as any} />

          {/* Picker card: fixed area with its own vertical scroll so switching pickers doesn't change overall size */}
          <div className="picker-card picker-card--content">
            {PICKERS.find((p) => p.key === active)?.comp}
          </div>
        </main>
      </div>

      {/* Bottom picker strip - full width fixed */}
      {/* Bottom strip rendered as a child so it can read store state via useStore */}
      <BottomStrip active={active} setActive={setActive} />
    </StoreProvider>
  );
}

export default App

function BottomStrip({ active, setActive }: { active: string; setActive: (k: string) => void }) {
  // This component is rendered inside StoreProvider so useStore hook works here
  const { state } = useStore();

  // Define prerequisite mapping: which previous key must be selected for a given category
  const prereq: Record<string, string | null> = {
    anakart: null,
    islemci: 'anakart',
    ram: 'islemci',
    ekran_karti: 'ram',
    psu: 'ekran_karti',
    kasa: 'psu',
    depolama: 'kasa',
    monitor: 'depolama',
    klavye: 'monitor',
    fare: 'klavye',
    islemci_sogutucu: 'fare',
  };

  const isEnabled = (key: string) => {
    const need = prereq[key];
    if (!need) return true;
    return Boolean(state.selected?.[need]);
  };

  return (
    <div className="picker-strip">
      {PICKERS.map((p) => {
        const enabled = isEnabled(p.key);
        return (
          <button
            key={p.key}
            onClick={() => enabled && setActive(p.key)}
            className={`picker-strip-button ${active === p.key ? 'active' : ''} ${enabled ? '' : 'locked'}`}
            title={!enabled ? `Önce ${prereq[p.key]} seçin` : undefined}
            disabled={!enabled}
            aria-disabled={!enabled}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
