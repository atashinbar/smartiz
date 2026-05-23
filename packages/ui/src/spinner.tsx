import * as React from "react";
import { cn } from "./lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
} as const;

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "sm", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        className={cn(
          "inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em]",
          sizeMap[size],
          className
        )}
        {...props}
      />
    );
  }
);
Spinner.displayName = "Spinner";
