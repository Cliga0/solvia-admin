import { create } from "zustand";

interface StoreConfig<T> {
  initialState: T;
}

export function createStore<T extends object>(
  _name: string,
  config: StoreConfig<T>,
) {
  return create<T>()(() => ({
    ...config.initialState,
  }));
}
