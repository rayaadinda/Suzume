"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { useDebouncedCallback } from "use-debounce"
import { NoteEditorMenu } from "./note-editor-menu"
import { useEffect, memo, useRef } from "react"

interface NoteEditorProps {
	content: string
	onUpdate: (content: string, plainText: string) => void
	placeholder?: string
}

export const NoteEditor = memo(function NoteEditor({
	content,
	onUpdate,
	placeholder,
}: NoteEditorProps) {
	const isUpdatingRef = useRef(false)

	const debouncedUpdate = useDebouncedCallback((html: string, text: string) => {
		onUpdate(html, text)
	}, 1000)

	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3],
				},
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: "text-primary underline cursor-pointer",
				},
			}),
			TaskList,
			TaskItem.configure({
				nested: true,
			}),
			Image.configure({
				HTMLAttributes: {
					class: "rounded-lg max-w-full",
				},
			}),
			Placeholder.configure({
				placeholder: placeholder || "Start writing...",
			}),
		],
		content: content || "",
		editorProps: {
			attributes: {
				class:
					"prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert focus:outline-none max-w-none px-8 py-4 min-h-[500px]",
			},
		},
		onUpdate: ({ editor }) => {
			if (!isUpdatingRef.current) {
				const html = editor.getHTML()
				const text = editor.getText()
				debouncedUpdate(html, text)
			}
		},
	})

	useEffect(() => {
		if (editor && content !== editor.getHTML()) {
			isUpdatingRef.current = true
			editor.commands.setContent(content)
			setTimeout(() => {
				isUpdatingRef.current = false
			}, 100)
		}
	}, [content, editor])

	return (
		<div className="border rounded-lg overflow-hidden">
			<NoteEditorMenu editor={editor} />
			<EditorContent editor={editor} className="prose-headings:font-bold" />
		</div>
	)
})
