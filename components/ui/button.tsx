import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex touch-manipulation items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-stone-950 shadow-[0_16px_36px_rgba(0,0,0,0.26)] hover:bg-[#d8c1a3]",
        secondary:
          "border border-white/10 bg-white/[0.04] text-text hover:border-white/16 hover:bg-white/[0.07]",
        ghost: "bg-transparent text-muted hover:bg-white/[0.05] hover:text-text"
      },
      size: {
        default: "h-11 px-5",
        sm: "h-10 px-4 text-xs",
        lg: "h-12 px-6 text-[15px]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = "Button";

export { Button };
