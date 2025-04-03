import React, { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <input
          type="checkbox"
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="pointer-events-none absolute left-0 flex h-4 w-4 items-center justify-center opacity-0 peer-checked:opacity-100">
          <Check className="h-3 w-3 text-white" />
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox }; 