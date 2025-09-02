"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PinInputProps {
  id?: string
  name?: string
  length: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
  className?: string
}

const PinInput = React.forwardRef<HTMLDivElement, PinInputProps>(
  ({ id, name, length, value, onChange, disabled, required, className }, ref) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

    const handleInputChange = (index: number, inputValue: string) => {
      // Only allow single digits
      const digit = inputValue.replace(/\D/g, "").slice(-1)

      const newValue = value.split("")
      newValue[index] = digit

      // Fill empty slots with empty strings
      while (newValue.length < length) {
        newValue.push("")
      }

      const updatedValue = newValue.slice(0, length).join("")
      onChange(updatedValue)

      // Auto-focus next input
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
      onChange(pastedData.padEnd(length, ""))

      // Focus the next empty input or the last input
      const nextIndex = Math.min(pastedData.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
    }

    return (
      <div ref={ref} className={cn("flex space-x-2", className)} onPaste={handlePaste}>
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            id={index === 0 ? id : undefined}
            name={index === 0 ? name : undefined}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={disabled}
            required={required && index === 0}
            className={cn(
              "w-12 h-12 text-center text-lg font-semibold rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200",
            )}
          />
        ))}
      </div>
    )
  },
)
PinInput.displayName = "PinInput"

export { PinInput }
