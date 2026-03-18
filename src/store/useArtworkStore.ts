import { create } from "zustand"

type Artwork = {
  id: string
  title?: string
  artist?: string
  imageUrl: string
  width_cm: number
  height_cm: number
}

type State = {
  selected: Artwork | null
  lastClosedAt: number
  open: (a: Artwork) => void
  close: () => void
}

export const useArtworkStore = create<State>((set) => ({
  selected: null,
  lastClosedAt: 0,
  open: (a) => set({ selected: a }),
  close: () =>
    set({
      selected: null,
      lastClosedAt: Date.now(),
    }),
}))