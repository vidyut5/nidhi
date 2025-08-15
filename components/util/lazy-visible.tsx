"use client"

import { useEffect, useRef, useState } from 'react'

export function LazyVisible({
  children,
  placeholder,
  rootMargin = '200px',
  idleTimeout = 1200,
}: {
  children: React.ReactNode
  placeholder: React.ReactNode
  rootMargin?: string
  idleTimeout?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    let canceled = false
    const trigger = () => { if (!canceled) setShow(true) }

    // Prefer visibility trigger
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            trigger()
            io.disconnect()
          }
        })
      }, { rootMargin })
      if (ref.current) io.observe(ref.current)
      // Fallback to idle to avoid never-loading
      let idleHandle: any | null = null
      let timeoutId: any | null = null
      if ((window as any).requestIdleCallback) {
        idleHandle = (window as any).requestIdleCallback(trigger, { timeout: idleTimeout })
      } else {
        timeoutId = setTimeout(trigger, idleTimeout)
      }
      return () => {
        canceled = true
        io.disconnect()
        if (idleHandle != null) (window as any).cancelIdleCallback?.(idleHandle)
        if (timeoutId != null) clearTimeout(timeoutId)
      }
    }

    // No IO support; fall back to idle
    let idleHandle: any | null = null
    let timeoutId: any | null = null
    if ((window as any).requestIdleCallback) {
      idleHandle = (window as any).requestIdleCallback(trigger, { timeout: idleTimeout })
    } else {
      timeoutId = setTimeout(trigger, idleTimeout)
    }
    return () => {
      canceled = true
      if (idleHandle != null) (window as any).cancelIdleCallback?.(idleHandle)
      if (timeoutId != null) clearTimeout(timeoutId)
    }
  }, [rootMargin, idleTimeout])

  return <div ref={ref}>{show ? children : placeholder}</div>
}


