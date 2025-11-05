import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

// Public routes that don't require authentication
const publicRoutes = ["/login", "/signup"]

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Allow public routes
	if (publicRoutes.includes(pathname)) {
		return NextResponse.next()
	}

	// Allow API routes and static files
	if (
		pathname.startsWith("/api/") ||
		pathname.startsWith("/_next/") ||
		pathname.startsWith("/favicon") ||
		pathname.includes(".")
	) {
		return NextResponse.next()
	}

	// Check if user has a session cookie (optimistic check)
	// For security, always validate the session on the server side in pages/routes
	const sessionCookie = getSessionCookie(request)

	if (!sessionCookie) {
		// No session cookie, redirect to login
		const loginUrl = new URL("/login", request.url)
		loginUrl.searchParams.set("from", pathname)
		return NextResponse.redirect(loginUrl)
	}

	// Session cookie exists, allow the request
	// The actual session validation will happen in server components/actions
	return NextResponse.next()
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
}
