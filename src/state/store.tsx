// src/state/store.tsx
import React, { useEffect, useReducer } from 'react';
import type { AllData } from '../data/loader';
import { loadAllData } from '../data/loader';
import { StoreContext as InternalStoreContext } from './internalContext';

export type Category =
  | 'anakart'
  | 'islemci'
  | 'ram'
  | 'ekran_karti'
  | 'psu'
  | 'kasa'
  | 'depolama'
  | 'monitor'
  | 'klavye'
  | 'fare'
  | 'islemci_sogutucu';

export type FilterSpec = {
  brands?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
  feature?: string; // free text match against etiketler or other fields
  inStockOnly?: boolean;
  q?: string; // general search query (name/model)
};

export type State = {
  data: AllData | null;
  selected: Partial<Record<Category, string>>;
  loading: boolean;
  filters: Partial<Record<Category, FilterSpec>>;
};

const initial: State = { data: null, selected: {}, loading: true, filters: {} };

type Action =
  | { type: 'SET_DATA'; payload: AllData }
  | { type: 'SELECT'; category: Category; id: string | null }
  | { type: 'RESET' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTERS'; category: Category; payload: FilterSpec | null };

const LS_KEY = 'pc_builder_selection_v1';

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, loading: false, data: action.payload };
    case 'SELECT': {
      // cascade-clear logic: when a category is deselected or changed,
      // all downstream categories in the build order should be cleared.
      const sel = { ...state.selected };
      const order: Category[] = [
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

      const idx = order.indexOf(action.category);
      if (action.id === null) {
        // remove this category and all downstream
        if (idx >= 0) {
          for (let i = idx; i < order.length; i++) {
            delete sel[order[i]];
          }
        } else {
          delete sel[action.category];
        }
        return { ...state, selected: sel };
      }

      // setting a value: assign then clear all downstream if value changed
      const prev = sel[action.category];
      sel[action.category] = action.id;
      if (prev !== action.id && idx >= 0) {
        for (let i = idx + 1; i < order.length; i++) {
          delete sel[order[i]];
        }
      }
      return { ...state, selected: sel };
    }
    case 'RESET':
      return { ...state, selected: {} };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_FILTERS': {
      const next = { ...state.filters };
      if (action.payload == null) delete next[action.category];
      else next[action.category] = action.payload;
      return { ...state, filters: next };
    }
    default:
      return state;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    const run = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const d = await loadAllData();
        dispatch({ type: 'SET_DATA', payload: d });
      } catch (e) {
        console.error('Data load failed', e);
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    };
    run();

    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw) as Partial<Record<Category, string | undefined>>;
        // restore in dependency order to avoid cascade-clearing during restore
        const order: Category[] = [
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
        for (const k of order) {
          const val = saved[k];
          if (typeof val === 'string') {
            dispatch({ type: 'SELECT', category: k, id: val });
          }
        }
      } catch (e) {
        console.warn('Failed to restore selection from localStorage', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state.selected));
  }, [state.selected]);

  return <InternalStoreContext.Provider value={{ state, dispatch }}>{children}</InternalStoreContext.Provider>;
}

// calcTotal and useStore are moved to src/state/hooks.ts to satisfy fast-refresh ESLint rule
