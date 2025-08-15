"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Monitor, MoreHorizontal, Minimize2, Maximize2 } from "lucide-react"

type Density = "compact" | "comfortable" | "spacious"

export function DensityToggle() {
  const [density, setDensity] = useState<Density>("comfortable")

  useEffect(() => {
    // Load saved density from localStorage
    const savedDensity = localStorage.getItem("ui-density") as Density
    if (savedDensity) {
      setDensity(savedDensity)
    }
  }, [])

  useEffect(() => {
    // Apply density class to body
    const root = document.documentElement
    root.classList.remove("density-compact", "density-comfortable", "density-spacious")
    root.classList.add(`density-${density}`)
    
    // Save to localStorage
    localStorage.setItem("ui-density", density)
  }, [density])

  const densityOptions = [
    {
      value: "compact" as const,
      label: "Compact",
      description: "More content in less space",
      icon: Minimize2,
    },
    {
      value: "comfortable" as const,
      label: "Comfortable",
      description: "Balanced spacing",
      icon: Monitor,
    },
    {
      value: "spacious" as const,
      label: "Spacious",
      description: "More breathing room",
      icon: Maximize2,
    },
  ]

  const currentOption = densityOptions.find(option => option.value === density)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {currentOption ? (
            <currentOption.icon className="h-4 w-4" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle density</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {densityOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setDensity(option.value)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <option.icon className="mr-2 h-4 w-4" />
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground">
                  {option.description}
                </div>
              </div>
            </div>
            {density === option.value && (
              <div className="h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

