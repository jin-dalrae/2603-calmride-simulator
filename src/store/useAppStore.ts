import { create } from 'zustand'

interface AppState {
  screen: 'simulator' | 'data'
  setScreen: (screen: 'simulator' | 'data') => void
}

export const useAppStore = create<AppState>((set) => ({
  screen: 'simulator',
  setScreen: (screen) => set({ screen }),
}))
