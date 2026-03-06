import { create } from 'zustand'

interface PlaybackState {
  currentTime: number
  isPlaying: boolean
  speed: number
  duration: number
  setDuration: (d: number) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
  setSpeed: (s: number) => void
  seek: (t: number) => void
  tick: (dt: number) => void
  reset: () => void
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  currentTime: 0,
  isPlaying: false,
  speed: 1,
  duration: 9,

  setDuration: (d) => set({ duration: d }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set(s => ({ isPlaying: !s.isPlaying })),
  setSpeed: (speed) => set({ speed }),
  seek: (t) => set(s => ({ currentTime: Math.max(0, Math.min(t, s.duration)) })),
  tick: (dt) => {
    const { currentTime, speed, duration, isPlaying } = get()
    if (!isPlaying) return
    const next = currentTime + dt * speed
    if (next >= duration) {
      set({ currentTime: duration, isPlaying: false })
    } else {
      set({ currentTime: next })
    }
  },
  reset: () => set({ currentTime: 0, isPlaying: false }),
}))
