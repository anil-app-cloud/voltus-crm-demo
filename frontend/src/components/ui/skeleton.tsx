import React from "react";
import { cn } from "../../lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "default" | "circle" | "card" | "text" | "table-row";
  animate?: boolean;
}

const Skeleton = ({ 
  className, 
  variant = "default",
  animate = true,
  ...props 
}: SkeletonProps) => {
  // Base classes for all variants
  const baseClasses = cn(
    "bg-gray-200 dark:bg-gray-700",
    animate && "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:400%_100%]",
    className
  );
  
  // Variant-specific classes
  const variantClasses = {
    default: "rounded-md",
    circle: "rounded-full",
    card: "rounded-lg",
    text: "h-4 rounded w-full",
    "table-row": "h-12 rounded-md w-full",
  };
  
  return (
    <div 
      className={cn(baseClasses, variantClasses[variant])} 
      {...props} 
    />
  );
};

// Predefined skeleton components for common use cases
export const SkeletonText = ({ className, ...props }: Omit<SkeletonProps, "variant">) => {
  return <Skeleton variant="text" className={cn("h-4 w-full", className)} {...props} />;
};

export const SkeletonAvatar = ({ className, ...props }: Omit<SkeletonProps, "variant">) => {
  return <Skeleton variant="circle" className={cn("h-12 w-12", className)} {...props} />;
};

export const SkeletonButton = ({ className, ...props }: Omit<SkeletonProps, "variant">) => {
  return <Skeleton className={cn("h-10 w-24 rounded-md", className)} {...props} />;
};

export const SkeletonCard = ({ className, ...props }: Omit<SkeletonProps, "variant">) => {
  return (
    <div 
      className={cn("space-y-3", className)} 
      {...props}
    >
      <Skeleton variant="card" className="h-40" />
      <SkeletonText className="h-4 w-3/4" />
      <SkeletonText className="h-3 w-1/2" />
      <div className="flex space-x-2">
        <SkeletonButton className="h-8 w-16" />
        <SkeletonButton className="h-8 w-16" />
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, className, ...props }: Omit<SkeletonProps, "variant"> & { rows?: number }) => {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <Skeleton className="h-8 rounded-md w-full" />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton 
          key={index} 
          variant="table-row" 
          style={{ animationDelay: `${index * 100}ms` }} 
        />
      ))}
    </div>
  );
};

export default Skeleton; 