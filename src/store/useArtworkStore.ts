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
  interactionSuppressed: boolean
  open: (a: Artwork) => void
  close: () => void
  suppressInteraction: (durationMs?: number) => void
}

let suppressTimer: ReturnType<typeof setTimeout> | null = null

export const useArtworkStore = create<State>((set) => ({
  selected: null,
  lastClosedAt: 0,
  interactionSuppressed: false,
  open: (a) => set({ selected: a }),
  close: () =>
    set(() => {
      if (suppressTimer) {
        clearTimeout(suppressTimer)
        suppressTimer = null
      }

      suppressTimer = setTimeout(() => {
        set({ interactionSuppressed: false })
        suppressTimer = null
      }, 700)

      return {
        selected: null,
        lastClosedAt: Date.now(),
        interactionSuppressed: true,
      }
    }),
  suppressInteraction: (durationMs = 700) =>
    set(() => {
      if (suppressTimer) {
        clearTimeout(suppressTimer)
        suppressTimer = null
      }

      suppressTimer = setTimeout(() => {
        set({ interactionSuppressed: false })
        suppressTimer = null
      }, durationMs)

      return { interactionSuppressed: true }
    }),
}))
