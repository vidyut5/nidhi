"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Script from "next/script"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { MapPin, Loader2 } from "lucide-react"

type OlaAutocompleteResult = {
  description: string
  place_id?: string
  structured_formatting?: {
    main_text?: string
    secondary_text?: string
  }
}

type SelectedLocation = {
  label: string
}

const DEFAULT_KEY = ""

export function LocationPicker({
  apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY || DEFAULT_KEY,
  className,
}: {
  apiKey?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<OlaAutocompleteResult[]>([])
  const [selected, setSelected] = useState<SelectedLocation | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const olaRef = useRef<any>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("vidyut:selectedLocation")
      if (raw) setSelected(JSON.parse(raw))
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('location-picker: failed to read selection from localStorage', e)
      }
    }
  }, [])

  const debouncedQuery = useDebounce(query, 250)

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) {
      setResults([])
      return
    }
    ;(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)
      try {
        let predictions: OlaAutocompleteResult[] = []

        const sdk = olaRef.current
        const sdkAutocomplete = sdk?.places?.autocomplete
        if (sdkReady && typeof sdkAutocomplete === 'function') {
          try {
            const sdkRes = await sdkAutocomplete.call(sdk.places, { input: debouncedQuery })
            predictions = sdkRes?.predictions || sdkRes?.results || []
          } catch {}
        }

        if (!predictions.length) {
          const url = `/api/ola/autocomplete?query=${encodeURIComponent(debouncedQuery)}`
          const res = await fetch(url, { signal: controller.signal })
          const data = await res.json()
          predictions = data?.predictions || data?.results || []
        }

        setResults(predictions)
      } catch (e) {
        if ((e as any)?.name !== "AbortError") {
          if (process.env.NODE_ENV !== 'production') {
            console.error('location-picker: autocomplete error', e)
          }
          setResults([])
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [debouncedQuery, sdkReady])

  const handleSelect = (item: OlaAutocompleteResult) => {
    const label =
      item?.structured_formatting?.main_text || item?.description || "Location"
    const selectedItem: SelectedLocation = { label }
    setSelected(selectedItem)
    try {
      localStorage.setItem(
        "vidyut:selectedLocation",
        JSON.stringify(selectedItem)
      )
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('location-picker: failed to persist selection', e)
      }
    }
    setOpen(false)
  }

  return (
    <>
      {/* Load Ola Maps Web SDK for future use; not strictly required for autocomplete */}
      <Script
        src="https://www.unpkg.com/olamaps-web-sdk@1.0.0/dist/olamaps-web-sdk.umd.js"
        strategy="afterInteractive"
        onLoad={() => {
          try {
            const g: any = (globalThis as any)
            const Ctor = g?.OlaMaps || g?.olamaps?.OlaMaps
            if (Ctor && apiKey) {
              olaRef.current = new Ctor({ apiKey })
              setSdkReady(true)
            }
          } catch (e) {
            if (process.env.NODE_ENV !== 'production') {
              console.error('location-picker: SDK init error', e)
            }
          }
        }}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={"h-9 gap-2 whitespace-nowrap " + (className || "")}
            aria-label="Set delivery location"
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Deliver to:</span>
            <span className="font-medium">
              {selected?.label || "Set location"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <div className="space-y-3">
            <div className="text-sm font-medium">Choose your location</div>
            <Input
              autoFocus
              placeholder="Enter area, city, or state"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="max-h-64 overflow-auto border rounded-md">
              {loading ? (
                <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching…
                </div>
              ) : results.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">
                  {query.length < 3
                    ? "Type at least 3 characters"
                    : "No suggestions"}
                </div>
              ) : (
                <ul className="divide-y">
                  {results.map((r, idx) => (
                    <li
                      key={idx}
                      className="p-3 hover:bg-accent cursor-pointer"
                      onClick={() => handleSelect(r)}
                    >
                      <div className="text-sm font-medium truncate">
                        {r.structured_formatting?.main_text || r.description}
                      </div>
                      {r.structured_formatting?.secondary_text && (
                        <div className="text-xs text-muted-foreground truncate">
                          {r.structured_formatting.secondary_text}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {selected && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Selected:</span>
                <Badge variant="secondary">{selected.label}</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 ml-auto"
                  onClick={() => setSelected(null)}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}

function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}


