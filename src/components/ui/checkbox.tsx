import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  checked,
  onCheckedChange,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive> & {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <CheckboxPrimitive
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded border border-primary bg-background data-[checked]:bg-primary data-[checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="h-3 w-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive>
  )
}

export { Checkbox }
