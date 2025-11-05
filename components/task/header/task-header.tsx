"use client"

import * as React from "react"
import { Home, ChevronRight } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"
import { TaskFilters } from "./task-filters"
import { TaskSort } from "./task-sort"
import { ViewModeSwitcher } from "./view-mode-switcher"

interface TaskHeaderProps {
	onOpenCommandPalette?: () => void
}

export function TaskHeader({}: TaskHeaderProps = {}) {
	return (
		<div className="border-b border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
			<div className="flex items-center justify-between px-6 py-4">
				<div className="flex flex-col gap-3">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<SidebarTrigger />
						<Link
							href="/dashboard"
							className="flex items-center gap-1.5 hover:text-foreground transition-colors"
						>
							<Home className="size-3.5" />
							<span>Dashboard</span>
						</Link>
						<ChevronRight className="size-3.5" />
						<span className="text-foreground font-medium">Overview</span>
					</div>

					<div className="flex items-center justify-between gap-4">
						<h1 className="text-2xl font-semibold tracking-tight">
							Task Management
						</h1>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between px-6 pb-4">
				<ViewModeSwitcher />

				<div className="flex items-center gap-2">
					<TaskFilters />
					<TaskSort />
				</div>
			</div>
		</div>
	)
}
