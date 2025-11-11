"use server"

import { db } from "@/db"
import { jobApplications } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { JobApplication, NewJobApplication } from "@/db/schema"
import { getCurrentUser } from "./users"

export async function getJobApplications(): Promise<JobApplication[]> {
	const user = await getCurrentUser()

	try {
		const applications = await db.query.jobApplications.findMany({
			where: eq(jobApplications.userId, user.id),
			orderBy: [desc(jobApplications.createdAt)],
		})

		return applications
	} catch (error) {
		console.error("Error fetching job applications:", error)
		throw new Error("Failed to fetch job applications")
	}
}

export async function getJobApplication(id: string): Promise<JobApplication> {
	const user = await getCurrentUser()

	try {
		const application = await db.query.jobApplications.findFirst({
			where: and(
				eq(jobApplications.id, id),
				eq(jobApplications.userId, user.id)
			),
		})

		if (!application) {
			throw new Error("Job application not found")
		}

		return application
	} catch (error) {
		console.error("Error fetching job application:", error)
		throw new Error("Failed to fetch job application")
	}
}

export async function createJobApplication(
	data: Omit<NewJobApplication, "userId">
): Promise<JobApplication> {
	const user = await getCurrentUser()

	try {
		const [application] = await db
			.insert(jobApplications)
			.values({
				...data,
				userId: user.id,
			})
			.returning()

		revalidatePath("/")
		return application
	} catch (error) {
		console.error("Error creating job application:", error)
		throw new Error("Failed to create job application")
	}
}

export async function updateJobApplication(
	id: string,
	data: Partial<Omit<NewJobApplication, "userId">>
): Promise<JobApplication> {
	const user = await getCurrentUser()

	try {
		const [application] = await db
			.update(jobApplications)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(
				and(eq(jobApplications.id, id), eq(jobApplications.userId, user.id))
			)
			.returning()

		if (!application) {
			throw new Error("Job application not found")
		}

		revalidatePath("/")
		return application
	} catch (error) {
		console.error("Error updating job application:", error)
		throw new Error("Failed to update job application")
	}
}

export async function deleteJobApplication(id: string): Promise<void> {
	const user = await getCurrentUser()

	try {
		await db
			.delete(jobApplications)
			.where(
				and(eq(jobApplications.id, id), eq(jobApplications.userId, user.id))
			)

		revalidatePath("/")
	} catch (error) {
		console.error("Error deleting job application:", error)
		throw new Error("Failed to delete job application")
	}
}

export async function getJobApplicationStats() {
	const user = await getCurrentUser()

	try {
		const applications = await db.query.jobApplications.findMany({
			where: eq(jobApplications.userId, user.id),
		})

		const stats = {
			total: applications.length,
			applied: applications.filter((app) => app.status === "applied").length,
			interview: applications.filter((app) => app.status === "interview")
				.length,
			offer: applications.filter((app) => app.status === "offer").length,
			rejected: applications.filter((app) => app.status === "rejected").length,
			accepted: applications.filter((app) => app.status === "accepted").length,
		}

		return stats
	} catch (error) {
		console.error("Error fetching job application stats:", error)
		throw new Error("Failed to fetch job application stats")
	}
}
