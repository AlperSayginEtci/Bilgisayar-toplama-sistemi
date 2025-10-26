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

export type State = {
  data: AllData | null;
  selected: Partial<Record<Category, string>>;
  loading: boolean;
};

const initial: State = { data: null, selected: {}, loading: true };

type Action =
  | { type: 'SET_DATA'; payload: AllData }
  | { type: 'SELECT'; category: Category; id: string | null }
  | { type: 'RESET' }
  | { type: 'SET_LOADING'; payload: boolean };

const LS_KEY = 'pc_builder_selection_v1';

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, data: action.payload, loading: false };
    case 'SELECT': {
      const sel = { ...state.selected };
      if (action.id === null) delete sel[action.category];
      else sel[action.category] = action.id;
      return { ...state, selected: sel };
    }
    case 'RESET':
      return { ...state, selected: {} };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
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
        for (const k of Object.keys(saved) as Category[]) {
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
