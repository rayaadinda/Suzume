"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { createDefaultLabelsForUser } from "@/app/actions/default-labels"

export default function SignupPage() {
	const router = useRouter()
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")

		if (password !== confirmPassword) {
			setError("Passwords do not match")
			return
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters long")
			return
		}

		setLoading(true)

		try {
			const { data, error } = await signUp.email({
				email,
				password,
				name,
			})

			if (error) {
				setError(error.message || "Failed to create account")
				setLoading(false)
				return
			}

			if (data) {
				// Create default labels for the new user
				try {
					await createDefaultLabelsForUser(data.user.id)
				} catch (labelError) {
					console.error("Failed to create default labels:", labelError)
					// Don't block signup if label creation fails
				}

				router.push("/")
				router.refresh()
			}
		} catch (err) {
			setError("An unexpected error occurred")
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md p-8">
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-bold mb-2">Create Account</h1>
					<p className="text-muted-foreground">
						Get started with task management
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
							{error}
						</div>
					)}

					<div>
						<label htmlFor="name" className="block text-sm font-medium mb-2">
							Full Name
						</label>
						<Input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="John Doe"
							required
							autoComplete="name"
						/>
					</div>

					<div>
						<label htmlFor="email" className="block text-sm font-medium mb-2">
							Email
						</label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							required
							autoComplete="email"
						/>
					</div>

					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium mb-2"
						>
							Password
						</label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							required
							autoComplete="new-password"
							minLength={8}
						/>
						<p className="text-xs text-muted-foreground mt-1">
							Must be at least 8 characters
						</p>
					</div>

					<div>
						<label
							htmlFor="confirmPassword"
							className="block text-sm font-medium mb-2"
						>
							Confirm Password
						</label>
						<Input
							id="confirmPassword"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="••••••••"
							required
							autoComplete="new-password"
						/>
					</div>

					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Creating account..." : "Create Account"}
					</Button>
				</form>

				<div className="mt-6 text-center text-sm">
					<p className="text-muted-foreground">
						Already have an account?{" "}
						<Link
							href="/login"
							className="text-primary hover:underline font-medium"
						>
							Sign in
						</Link>
					</p>
				</div>
			</Card>
		</div>
	)
}
