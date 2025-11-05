"use client"

import { useState } from "react"
import { TaskSidebar } from "@/components/task/sidebar/task-sidebar"
import { TaskHeader } from "@/components/task/header/task-header"
import { TaskBoard } from "@/components/task/board/task-board"
import { SidebarProvider } from "@/components/ui/sidebar"
import { WebSocketProvider } from "@/components/websocket-provider"
import { CommandPalette } from "@/components/command-palette"

export default function Home() {
	const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

	return (
		<WebSocketProvider>
			<SidebarProvider>
				<TaskSidebar />
				<div className="flex-1 flex flex-col overflow-hidden h-screen">
					<TaskHeader
						onOpenCommandPalette={() => setCommandPaletteOpen(true)}
					/>
					<main className="w-full h-full overflow-x-auto">
						<TaskBoard />
					</main>
				</div>
				<CommandPalette
					open={commandPaletteOpen}
					setOpen={setCommandPaletteOpen}
				/>
			</SidebarProvider>
		</WebSocketProvider>
	)
}
