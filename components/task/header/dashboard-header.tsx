"use client"

import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export function DashboardHeader() {
	return (
		<div className="border-b border-border bg-background">
			<div className="flex items-center justify-between px-3 lg:px-6 py-3">
				<div className="flex items-center gap-2">
					<SidebarTrigger />
					<h1 className="text-base lg:text-lg font-semibold">Dashboard</h1>
				</div>

				<div className="flex items-center gap-2 lg:gap-4">
					<Button variant="outline" className="shadow-none" asChild>
						<Link
							href="https://github.com/ln-dev7/square-ui/tree/master/templates/task-management"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Github className="size-4" />
							<span className="hidden lg:inline">GitHub</span>
						</Link>
					</Button>

					<ThemeToggle />

					<Button variant="outline" size="icon" className="shadow-none">
						<Avatar className="size-7">
							<AvatarImage src="/ln.png" alt="User" />
							<AvatarFallback>U</AvatarFallback>
						</Avatar>
					</Button>
				</div>
			</div>
		</div>
	)
}
