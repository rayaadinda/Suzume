export type WebSocketMessageType =
	| "task_created"
	| "task_updated"
	| "task_deleted"
	| "task_status_changed"
	| "ping"
	| "pong"

export interface WebSocketMessage {
	type: WebSocketMessageType
	payload: Record<string, unknown>
}

export type MessageHandler = (message: WebSocketMessage) => void

class WebSocketClient {
	private ws: WebSocket | null = null
	private url: string
	private token: string | null = null
	private reconnectAttempts = 0
	private maxReconnectAttempts = 5
	private reconnectDelay = 1000 // Start with 1 second
	private messageHandlers: Set<MessageHandler> = new Set()
	private isIntentionallyClosed = false
	private pingInterval: NodeJS.Timeout | null = null

	constructor(url: string) {
		this.url = url
	}

	connect(token: string) {
		if (this.ws?.readyState === WebSocket.OPEN) {
			console.log("WebSocket already connected")
			return
		}

		if (!token) {
			console.warn("WebSocket token is empty, cannot connect")
			return
		}

		this.token = token
		this.isIntentionallyClosed = false

		try {
			// Add token as query parameter for authentication
			const wsUrl = `${this.url}?token=${encodeURIComponent(token)}`
			this.ws = new WebSocket(wsUrl)

			this.ws.onopen = () => {
				console.log("WebSocket connected")
				this.reconnectAttempts = 0
				this.reconnectDelay = 1000
				this.startPingInterval()
			}

			this.ws.onmessage = (event) => {
				try {
					const message: WebSocketMessage = JSON.parse(event.data)

					// Handle pong messages (keep-alive)
					if (message.type === "pong") {
						return
					}

					// Notify all message handlers
					this.messageHandlers.forEach((handler) => handler(message))
				} catch (error) {
					console.error("Error parsing WebSocket message:", error)
				}
			}

			this.ws.onerror = (error) => {
				console.error("WebSocket error:", error)
			}

			this.ws.onclose = (event) => {
				console.log("WebSocket closed:", event.code, event.reason)
				this.stopPingInterval()

				// Attempt reconnection if not intentionally closed
				if (
					!this.isIntentionallyClosed &&
					this.reconnectAttempts < this.maxReconnectAttempts
				) {
					this.reconnectAttempts++
					console.log(
						`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms...`
					)

					setTimeout(() => {
						if (this.token) {
							this.connect(this.token)
						}
					}, this.reconnectDelay)

					// Exponential backoff
					this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000) // Max 30 seconds
				} else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
					console.error("Max reconnection attempts reached")
				}
			}
		} catch (error) {
			console.error("Error creating WebSocket:", error)
		}
	}

	disconnect() {
		this.isIntentionallyClosed = true
		this.stopPingInterval()
		if (this.ws) {
			this.ws.close()
			this.ws = null
		}
	}

	send(message: WebSocketMessage) {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(message))
		} else {
			console.warn("WebSocket is not connected, cannot send message")
		}
	}

	addMessageHandler(handler: MessageHandler) {
		this.messageHandlers.add(handler)
		return () => this.messageHandlers.delete(handler)
	}

	private startPingInterval() {
		this.pingInterval = setInterval(() => {
			if (this.ws?.readyState === WebSocket.OPEN) {
				this.send({ type: "ping", payload: {} })
			}
		}, 30000) // Ping every 30 seconds
	}

	private stopPingInterval() {
		if (this.pingInterval) {
			clearInterval(this.pingInterval)
			this.pingInterval = null
		}
	}

	isConnected(): boolean {
		return this.ws?.readyState === WebSocket.OPEN
	}
}

// Singleton instance
let wsClient: WebSocketClient | null = null

export function getWebSocketClient(): WebSocketClient {
	if (!wsClient) {
		const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws"
		wsClient = new WebSocketClient(wsUrl)
	}
	return wsClient
}

export function disconnectWebSocket() {
	if (wsClient) {
		wsClient.disconnect()
		wsClient = null
	}
}
