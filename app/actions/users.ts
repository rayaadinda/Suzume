"use server"

import { db } from "@/db"
import { users } from "@/db/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import * as jose from "jose"

export type UserData = {
	id: string
	name: string
	email: string
	image: string | null
}

// Helper function to get current user session
export async function getCurrentUser() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		throw new Error("Unauthorized")
	}

	return session.user
}

// GET all users (for assignee dropdowns)
export async function getUsers(): Promise<UserData[]> {
	await getCurrentUser() // Ensure authenticated

	try {
		const allUsers = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				image: users.image,
			})
			.from(users)

		return allUsers
	} catch (error) {
		console.error("Error fetching users:", error)
		throw new Error("Failed to fetch users")
	}
}

// GET current logged-in user
export async function getCurrentUserData(): Promise<UserData> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		throw new Error("Unauthorized")
	}

	return {
		id: session.user.id,
		name: session.user.name,
		email: session.user.email,
		image: session.user.image || null,
	}
}

// GET WebSocket JWT token for real-time updates
export async function getWebSocketToken(): Promise<string> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		throw new Error("Unauthorized")
	}

	const secret = new TextEncoder().encode(
		process.env.BETTER_AUTH_SECRET || "your-secret-key"
	)

	const token = await new jose.SignJWT({
		sub: session.user.id,
		email: session.user.email,
	})
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("24h")
		.sign(secret)

	return token
}
