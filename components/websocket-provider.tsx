"use client"

import { useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import {
	getWebSocketClient,
	disconnectWebSocket,
	type WebSocketMessage,
} from "@/lib/websocket"
import { useQueryClient } from "@tanstack/react-query"
import { useDebouncedCallback } from "use-debounce"
import { getWebSocketToken } from "@/app/actions/users"

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
	const { data: session } = useSession()
	const queryClient = useQueryClient()

	const debouncedInvalidateTasks = useDebouncedCallback(
		() => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] })
		},
		1000,
		{ leading: false, trailing: true }
	)

	useEffect(() => {
		if (!session?.user?.id) {
			return
		}

		let isMounted = true

		const connectWebSocket = async () => {
			try {
				// Get JWT token for WebSocket authentication
				const token = await getWebSocketToken()

				if (!isMounted) return

				const wsClient = getWebSocketClient()

				// Connect to WebSocket with auth token
				wsClient.connect(token)

				// Handle incoming messages
				const removeHandler = wsClient.addMessageHandler(
					(message: WebSocketMessage) => {
						console.log("Received WebSocket message:", message)

						switch (message.type) {
							case "task_created":
							case "task_updated":
							case "task_deleted":
							case "task_status_changed":
								debouncedInvalidateTasks()
								break
							default:
								console.log("Unknown message type:", message.type)
						}
					}
				)

				// Cleanup on unmount
				return () => {
					removeHandler()
					disconnectWebSocket()
				}
			} catch (error) {
				console.error("Failed to connect WebSocket:", error)
			}
		}

		connectWebSocket()

		return () => {
			isMounted = false
			disconnectWebSocket()
		}
	}, [session?.user?.id, debouncedInvalidateTasks])

	return <>{children}</>
}
