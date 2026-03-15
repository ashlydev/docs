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
        "flex h-11 w-full rounded-2xl border border-white/10 bg-surface-2/80 px-4 py-2 text-sm text-text outline-none transition placeholder:text-muted/70 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/20",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
