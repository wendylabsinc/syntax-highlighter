import * as React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/

function ColorPicker({
  className,
  disabled,
  id,
  label = "Color",
  onValueChange,
  value,
}: {
  className?: string
  disabled?: boolean
  id?: string
  label?: string
  onValueChange: (value: string) => void
  value: string
}) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const normalizedValue = HEX_COLOR_PATTERN.test(value) ? value : "#000000"

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value.trim()
    if (HEX_COLOR_PATTERN.test(nextValue)) {
      onValueChange(nextValue.toLowerCase())
    }
  }

  return (
    <div
      className={cn("flex min-w-0 items-center gap-2", className)}
      data-slot="color-picker"
    >
      <label className="sr-only" htmlFor={inputId}>
        {label}
      </label>
      <input
        aria-label={label}
        className="h-8 w-10 shrink-0 cursor-pointer rounded-lg border border-input bg-transparent p-1 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        data-slot="color-picker-swatch"
        disabled={disabled}
        id={inputId}
        type="color"
        value={normalizedValue}
        onChange={(event) => onValueChange(event.currentTarget.value)}
      />
      <Input
        aria-label={`${label} hex`}
        className="font-mono uppercase"
        disabled={disabled}
        inputMode="text"
        pattern="#[0-9a-fA-F]{6}"
        value={normalizedValue.toUpperCase()}
        onChange={handleTextChange}
      />
    </div>
  )
}

export { ColorPicker }
