import * as React from "react";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-clay-lg border border-clay-border bg-clay-raised text-card-foreground shadow-clay-raised transition-shadow duration-200 hover:shadow-clay-modal",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h3
      ref={ref}
      className={cn("text-heading-lg font-serif text-card-foreground", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-body-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0 border-t border-clay-border", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

/** Card with media slot at top — for trip/itinerary previews */
export interface CardWithMediaProps extends CardProps {
  media?: React.ReactNode;
  mediaPosition?: "top" | "bottom";
}

export const CardWithMedia = React.forwardRef<HTMLDivElement, CardWithMediaProps>(
  ({ className, media, mediaPosition = "top", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-clay-lg border border-clay-border bg-clay-raised text-card-foreground shadow-clay-raised transition-shadow duration-200 hover:shadow-clay-modal overflow-hidden",
        className
      )}
      {...props}
    >
      {mediaPosition === "top" && media && (
        <div className="aspect-video w-full overflow-hidden">
          <div className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
            {media}
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
      {mediaPosition === "bottom" && media && (
        <div className="aspect-video w-full overflow-hidden border-t border-clay-border">
          <div className="w-full h-full object-cover">
            {media}
          </div>
        </div>
      )}
    </div>
  )
);
CardWithMedia.displayName = "CardWithMedia";