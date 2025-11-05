import { useQuery } from "@tanstack/react-query"
import { useSession } from "@/lib/auth-client"

export interface User {
	id: string
	name: string
	email: string
	image?: string | null
	createdAt: Date
	updatedAt: Date
}

export function useUser() {
	const { data: session, isPending: isSessionPending } = useSession()

	const {
		data: user,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["user", session?.user?.id],
		queryFn: async () => {
			if (!session?.user?.id) {
				return null
			}

			const response = await fetch(`/api/user/${session.user.id}`)
			if (!response.ok) {
				throw new Error("Failed to fetch user")
			}
			return response.json() as Promise<User>
		},
		enabled: !!session?.user?.id,
	})

	return {
		user: user || (session?.user as User | null),
		isLoading: isLoading || isSessionPending,
		error,
	}
}
