import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  size = "md",
  rounded = "full",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "sm" | "md" | "lg";
  rounded?: "full" | "md" | "lg" | "none";
}) {
  const sizeClass = {
    sm: "size-6",
    md: "size-8",
    lg: "size-10",
  }[size];

  const roundedClass = {
    full: "rounded-full",
    md: "rounded-md",
    lg: "rounded-lg",
    none: "rounded-none",
  }[rounded];

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex shrink-0 overflow-hidden",
        sizeClass,
        roundedClass,
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  src,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  // Determine if src is from S3
  const isS3Url = src?.includes("s3") || src?.includes("amazonaws.com");
  
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      src={src}
      crossOrigin={isS3Url ? "anonymous" : undefined}
      {...props}
    />
  )
}

function getInitials(name: string): string {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function AvatarFallback({
  className,
  name,
  children,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> & {
  name?: string;
}) {
  const content = children ?? (name ? getInitials(name) : "?");

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    >
      {content}
    </AvatarPrimitive.Fallback>
  );
}

export { Avatar, AvatarImage, AvatarFallback }
