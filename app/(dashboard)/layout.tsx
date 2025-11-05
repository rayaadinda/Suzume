"use client"

import { useState } from "react"
import { TaskSidebar } from "@/components/task/sidebar/task-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { WebSocketProvider } from "@/components/websocket-provider"
import { CommandPalette } from "@/components/command-palette"

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

	return (
		<WebSocketProvider>
			<SidebarProvider>
				<TaskSidebar />
				<SidebarInset>
					<main className="flex flex-1 flex-col overflow-hidden">
						{children}
					</main>
				</SidebarInset>
				<CommandPalette
					open={commandPaletteOpen}
					setOpen={setCommandPaletteOpen}
				/>
			</SidebarProvider>
		</WebSocketProvider>
	)
}
