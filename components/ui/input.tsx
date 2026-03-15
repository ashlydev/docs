import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-white/10 bg-surface-2/90 px-4 py-2 text-sm text-text outline-none transition placeholder:text-muted/70 focus:border-[rgba(204,176,137,0.38)] focus:ring-2 focus:ring-[rgba(204,176,137,0.12)]",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
