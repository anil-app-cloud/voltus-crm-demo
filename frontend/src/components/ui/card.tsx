import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

// Define card variants with animations
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all",
  {
    variants: {
      animation: {
        none: "",
        hover: "hover:shadow-md hover:border-primary/20 hover:-translate-y-1 transition-all duration-300",
        scale: "hover:scale-[1.02] hover:shadow-md transition-all duration-300",
        glow: "hover:shadow-md hover:shadow-primary/10 transition-all duration-300",
        border: "hover:border-primary/50 transition-all duration-300",
        float: "hover:-translate-y-1 hover:shadow-md transition-all duration-300",
      },
    },
    defaultVariants: {
      animation: "none",
    },
  }
)

export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {
  loading?: boolean;
}

const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ className, animation, loading, ...props }, ref) => {
  if (loading) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:400%_100%]",
          className
        )}
        aria-busy="true"
        aria-live="polite"
        {...props}
      />
    )
  }
  
  return (
    <div
      ref={ref}
      className={cn(cardVariants({ animation, className }))}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-row items-center justify-between p-4 border-b border-border/10", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-end p-4 pt-0 gap-2", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } 