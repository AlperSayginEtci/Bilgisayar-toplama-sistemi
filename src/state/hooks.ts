// src/state/hooks.ts
import { useContext } from 'react';
import { StoreContext } from './internalContext';
import type { Category } from './store';
import type { State } from './store';

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function calcTotal(state: State): number {
  if (!state.data) return 0;
  let sum = 0;
  type Displayable = { id?: string | number; fiyat_try?: number | string };
  for (const [cat, id] of Object.entries(state.selected)) {
    const category = cat as Category;
    const list = (state.data as unknown as Record<string, Array<Record<string, unknown>>> | null)?.[category];
    if (!list) continue;
    const item = list.find((x) => ((x as unknown) as Displayable).id === id) as Displayable | undefined;
    if (!item) continue;
    sum += Number(item.fiyat_try ?? 0);
  }
  return sum;
}
