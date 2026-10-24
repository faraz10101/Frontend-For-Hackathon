import * as React from "react"
import { twMerge } from "tailwind-merge"

const VARIANTS = {
  default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
  destructive: "bg-red-600 text-white shadow-sm hover:bg-red-600/90",
  outline: "border border-slate-200 bg-white shadow-sm hover:bg-slate-100 hover:text-slate-900",
  secondary: "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-100/80",
  ghost: "hover:bg-slate-100 hover:text-slate-900",
  link: "text-primary underline-offset-4 hover:underline",
}

const SIZES = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-8",
  icon: "h-9 w-9",
}

// twMerge lets a className such as "bg-white h-10" really override the variant/size defaults.
const Button = React.forwardRef(({ className, variant = "default", size = "default", type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={twMerge(
      "inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50",
      VARIANTS[variant] || VARIANTS.default,
      SIZES[size] || SIZES.default,
      className
    )}
    {...props}
  />
))
Button.displayName = "Button"

export { Button }
