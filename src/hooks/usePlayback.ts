import { useEffect, useRef } from 'react'
import { usePlaybackStore } from '../store/usePlaybackStore'

export function usePlayback() {
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const isPlaying = usePlaybackStore(s => s.isPlaying)
  const tick = usePlaybackStore(s => s.tick)

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    lastTimeRef.current = performance.now()

    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000
      lastTimeRef.current = now
      tick(dt)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, tick])
}
