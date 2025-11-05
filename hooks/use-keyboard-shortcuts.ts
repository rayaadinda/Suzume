"use client"

import * as React from "react"

export interface KeyboardShortcut {
	key: string
	ctrlKey?: boolean
	metaKey?: boolean
	shiftKey?: boolean
	altKey?: boolean
	description: string
	action: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			for (const shortcut of shortcuts) {
				const {
					key,
					ctrlKey = false,
					metaKey = false,
					shiftKey = false,
					altKey = false,
					action,
				} = shortcut

				const ctrlOrMeta = ctrlKey || metaKey
				const matchesCtrl = ctrlOrMeta
					? event.ctrlKey || event.metaKey
					: !event.ctrlKey && !event.metaKey
				const matchesShift = shiftKey === event.shiftKey
				const matchesAlt = altKey === event.altKey
				const matchesKey = event.key.toLowerCase() === key.toLowerCase()

				if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
					event.preventDefault()
					action()
					break
				}
			}
		}

		document.addEventListener("keydown", handleKeyDown)
		return () => document.removeEventListener("keydown", handleKeyDown)
	}, [shortcuts])
}
