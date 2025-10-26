// src/state/internalContext.tsx
import { createContext } from 'react';
import type { Category } from './store';
import type { AllData } from '../data/loader';

type State = {
  data: AllData | null;
  selected: Partial<Record<Category, string>>;
  loading: boolean;
};

type Action = { type: 'SET_DATA'; payload: AllData } | { type: 'SELECT'; category: Category; id: string | null } | { type: 'RESET' } | { type: 'SET_LOADING'; payload: boolean };

export const StoreContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | undefined>(undefined);

