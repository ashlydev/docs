import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[108px] w-full rounded-[24px] border border-white/10 bg-surface-2/80 px-4 py-3 text-sm text-text outline-none transition placeholder:text-muted/70 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-500/20",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
