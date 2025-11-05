"use client"

import {
	House,
	FileCheck,
	FileText,
	MessageSquare,
	CreditCard,
	Users,
	Sparkles,
	UserCog,
	GitBranch,
	Search,
	ChevronDown,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { NavUser } from "@/components/task/sidebar/nav-user"
import Link from "next/link"

interface SidebarItemProps {
	icon: React.ReactNode
	label: string
	badge?: string
	active?: boolean
	href?: string
}

function SidebarItem({ icon, label, badge, active, href }: SidebarItemProps) {
	if (href) {
		return (
			<Button
				variant="ghost"
				className={cn(
					"w-full justify-start px-3 py-2.5 h-10 text-sm font-normal",
					active
						? "bg-muted/80 text-foreground"
						: "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
				)}
				asChild
			>
				<Link href={href}>
					<div className="flex items-center gap-3 w-full">
						<div className="shrink-0">{icon}</div>
						<span className="flex-1">{label}</span>
						{badge && (
							<div className="bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center shrink-0">
								{badge}
							</div>
						)}
					</div>
				</Link>
			</Button>
		)
	}

	return (
		<Button
			variant="ghost"
			className={cn(
				"w-full justify-start px-3 py-2.5 h-10 text-sm font-normal",
				active
					? "bg-muted/80 text-foreground"
					: "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
			)}
		>
			<div className="flex items-center gap-3 w-full">
				<div className="shrink-0">{icon}</div>
				<span className="flex-1">{label}</span>
				{badge && (
					<div className="bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center shrink-0">
						{badge}
					</div>
				)}
			</div>
		</Button>
	)
}

export function TaskSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname()

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader className="">
				<div className="px-3 pt-4 border-2 border-border/50 rounded-2xl">
					<div className="flex items-center gap-3 mb-4">
						<Image
							src="/ln.png"
							alt="Team Avatar"
							className="size-10 object-cover rounded-lg"
							width={40}
							height={40}
						/>
						<div className="flex-1 min-w-0">
							<p className="text-xs text-muted-foreground">Team</p>
							<p className="font-semibold truncate">David Visuals</p>
						</div>
						<Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
							<ChevronDown className="size-4 text-muted-foreground" />
						</Button>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent className="px-3 py-4">
				<div className="space-y-0.5">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search"
							className="pl-9 h-9 bg-muted/50 border-0"
						/>
					</div>
					<SidebarItem
						icon={<House className="size-4" />}
						label="Home"
						href="/dashboard"
						active={pathname === "/dashboard"}
					/>
					<SidebarItem
						icon={<FileCheck className="size-4" />}
						label="Tasks"
						href="/tasks"
						active={pathname === "/tasks"}
					/>
					<SidebarItem icon={<FileText className="size-4" />} label="Docs" />
					<SidebarItem
						icon={<MessageSquare className="size-4" />}
						label="Chat"
					/>
					<SidebarItem
						icon={<CreditCard className="size-4" />}
						label="Payments"
					/>
					<SidebarItem icon={<Users className="size-4" />} label="Customers" />
					<SidebarItem
						icon={<Sparkles className="size-4" />}
						label="Automations"
					/>
					<SidebarItem
						icon={<UserCog className="size-4" />}
						label="User Management"
					/>
					<SidebarItem
						icon={<GitBranch className="size-4" />}
						label="Workflows"
					/>
				</div>
			</SidebarContent>

			<SidebarFooter className="p-3 border-t border-border/50">
				<SidebarItem
					icon={<UserCog className="size-4" />}
					label="Settings"
					href="/settings"
					active={pathname === "/settings"}
				/>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	)
}
