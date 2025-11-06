import { createClient } from "@supabase/storage-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const storageClient = createClient(supabaseUrl, supabaseKey, {
	headers: {
		Authorization: `Bearer ${supabaseKey}`,
	},
})

export const notesStorage = storageClient.from("notes")

export async function uploadImage(file: File): Promise<string> {
	const fileName = `${Date.now()}-${file.name}`

	const { data, error } = await notesStorage.upload(fileName, file)

	if (error) {
		throw new Error(`Failed to upload image: ${error.message}`)
	}

	const { data: publicUrl } = notesStorage.getPublicUrl(fileName)

	return publicUrl.publicUrl
}

export async function deleteImage(url: string): Promise<void> {
	const fileName = url.split("/").pop()
	if (!fileName) return

	const { error } = await notesStorage.remove([fileName])

	if (error) {
		throw new Error(`Failed to delete image: ${error.message}`)
	}
}
