"use client"

import { type Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
	Bold,
	Italic,
	Strikethrough,
	Code,
	Heading1,
	Heading2,
	Heading3,
	List,
	ListOrdered,
	CheckSquare,
	Link as LinkIcon,
	Image as ImageIcon,
	Undo,
	Redo,
} from "lucide-react"
import { uploadImage } from "@/lib/storage"
import { toast } from "sonner"

interface NoteEditorMenuProps {
	editor: Editor | null
}

export function NoteEditorMenu({ editor }: NoteEditorMenuProps) {
	if (!editor) return null

	const handleImageUpload = () => {
		const input = document.createElement("input")
		input.type = "file"
		input.accept = "image/*"
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0]
			if (!file) return

			try {
				const url = await uploadImage(file)
				editor.chain().focus().setImage({ src: url }).run()
				toast.success("Image inserted")
			} catch (error) {
				toast.error("Failed to upload image")
				console.error(error)
			}
		}
		input.click()
	}

	const handleSetLink = () => {
		const url = window.prompt("Enter URL:")
		if (url) {
			editor.chain().focus().setLink({ href: url }).run()
		}
	}

	return (
		<div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleBold().run()}
				className={editor.isActive("bold") ? "bg-muted" : ""}
			>
				<Bold className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				className={editor.isActive("italic") ? "bg-muted" : ""}
			>
				<Italic className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleStrike().run()}
				className={editor.isActive("strike") ? "bg-muted" : ""}
			>
				<Strikethrough className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleCode().run()}
				className={editor.isActive("code") ? "bg-muted" : ""}
			>
				<Code className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="h-8" />

			<Button
				variant="ghost"
				size="sm"
				onClick={() =>
					editor.chain().focus().toggleHeading({ level: 1 }).run()
				}
				className={
					editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""
				}
			>
				<Heading1 className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={() =>
					editor.chain().focus().toggleHeading({ level: 2 }).run()
				}
				className={
					editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""
				}
			>
				<Heading2 className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={() =>
					editor.chain().focus().toggleHeading({ level: 3 }).run()
				}
				className={
					editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""
				}
			>
				<Heading3 className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="h-8" />

			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={editor.isActive("bulletList") ? "bg-muted" : ""}
			>
				<List className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={editor.isActive("orderedList") ? "bg-muted" : ""}
			>
				<ListOrdered className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().toggleTaskList().run()}
				className={editor.isActive("taskList") ? "bg-muted" : ""}
			>
				<CheckSquare className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="h-8" />

			<Button variant="ghost" size="sm" onClick={handleSetLink}>
				<LinkIcon className="h-4 w-4" />
			</Button>

			<Button variant="ghost" size="sm" onClick={handleImageUpload}>
				<ImageIcon className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="h-8" />

			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().undo().run()}
				disabled={!editor.can().undo()}
			>
				<Undo className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().redo().run()}
				disabled={!editor.can().redo()}
			>
				<Redo className="h-4 w-4" />
			</Button>
		</div>
	)
}
