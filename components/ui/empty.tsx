import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const Empty = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"flex min-h-[400px] flex-col items-center justify-center gap-2 text-center",
			className
		)}
		{...props}
	/>
))
Empty.displayName = "Empty"

const EmptyHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex flex-col items-center gap-2", className)}
		{...props}
	/>
))
EmptyHeader.displayName = "EmptyHeader"

const emptyMediaVariants = cva("flex items-center justify-center", {
	variants: {
		variant: {
			icon: "size-12 rounded-md bg-muted text-muted-foreground",
			image: "size-32",
			illustration: "size-48",
		},
	},
	defaultVariants: {
		variant: "icon",
	},
})

const EmptyMedia = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof emptyMediaVariants>
>(({ className, variant, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(emptyMediaVariants({ variant }), className)}
		{...props}
	/>
))
EmptyMedia.displayName = "EmptyMedia"

const EmptyTitle = React.forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h3 ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
))
EmptyTitle.displayName = "EmptyTitle"

const EmptyDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
))
EmptyDescription.displayName = "EmptyDescription"

const EmptyContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("mt-4 flex flex-col items-center gap-2", className)}
		{...props}
	/>
))
EmptyContent.displayName = "EmptyContent"

export {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
}
