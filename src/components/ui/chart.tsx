"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/cn"

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    theme?: Record<string, string>
  }
}

const ChartContext = React.createContext<{
  config: ChartConfig
} | null>(null)

export function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer")
  }
  return context
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ReactNode
  }
>(({ id, className, config, children, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-grid-horizontal_line]:stroke-gray-150 [&_.recharts-cartesian-grid-vertical_line]:stroke-gray-150 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-gray-150 [&_.recharts-dot]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid-concentric-path]:stroke-gray-150 [&_.recharts-polar-grid-radial-line]:stroke-gray-150 [&_.recharts-radial-bar-background-sector]:fill-gray-100 [&_.recharts-sector.recharts-tooltip-cursor]:fill-gray-100 [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: Object.entries(config)
              .map(([key, value]) => {
                const color = value.color
                if (!color) return null
                return `[data-chart="${key}"] { --color-${key}: ${color}; }`
              })
              .filter(Boolean)
              .join("\n"),
          }}
        />
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    active?: boolean
    payload?: any[]
    label?: any
    labelFormatter?: (label: any) => React.ReactNode
    labelClassName?: string
    formatter?: any
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    config?: ChartConfig
    nameKey?: string
    labelKey?: string
  }
>(
  (
    {
      active,
      payload,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      hideLabel = false,
      hideIndicator = false,
      indicator = "dot",
      config,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    if (!active || !payload || !payload.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-gray-100 bg-white p-2.5 shadow-xl text-xs text-black"
      >
        {!hideLabel && (
          <div className={cn("font-medium", labelClassName)}>{label}</div>
        )}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const dataKey = nameKey || item.name || item.dataKey
            const value = item.value

            return (
              <div
                key={index}
                className="flex items-center gap-1.5 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-gray-500"
              >
                {!hideIndicator && (
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      indicator === "dot" && "bg-current",
                      indicator === "line" && "h-0.5 w-3 bg-current"
                    )}
                    style={{
                      backgroundColor: item.color || item.fill || '#0012FF',
                    }}
                  />
                )}
                <span className="text-gray-500">{item.name || dataKey}</span>
                <span className="font-mono font-semibold text-black ml-auto">
                  {typeof value === "number" ? value.toLocaleString() : value}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export const ChartTooltip = RechartsPrimitive.Tooltip
