"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TiptapToolbar from "./tiptap-toolbar";

interface TiptapEditorProps {
	content?: JSONContent | string | null;
	onChange: (content: JSONContent) => void;
	disabled?: boolean;
}

const isEmptyJSONContent = (
	content: JSONContent | string | null | undefined
): boolean => {
	if (!content) return true;
	if (typeof content === "string") return content.trim().length === 0;

	if (content.type === "doc") {
		if (!content.content || content.content.length === 0) return true;

		const hasContent = content.content.some((node) => {
			if (node.type === "paragraph") {
				if (node.content && Array.isArray(node.content)) {
					return node.content.some((textNode) => {
						if (
							textNode.type === "text" &&
							textNode.text &&
							typeof textNode.text === "string"
						) {
							return textNode.text.trim().length > 0;
						}
						return false;
					});
				}
				return false;
			}
			return true;
		});

		return !hasContent;
	}

	return false;
};

const TiptapEditor: React.FC<TiptapEditorProps> = ({
	content,
	onChange,
	disabled = false,
}) => {
	const normalizedContent = useMemo<JSONContent | null | undefined>(() => {
		if (typeof content === "string") {
			return {
				type: "doc",
				content: [
					{ type: "paragraph", content: [{ type: "text", text: content }] },
				],
			};
		}
		return content;
	}, [content]);

	const contentRef = useRef<JSONContent | null | undefined>(normalizedContent);
	const isUpdatingRef = useRef(false);

	const editor = useEditor({
		immediatelyRender: false,
		extensions: [StarterKit, Underline],
		content: normalizedContent || { type: "doc", content: [] },
		editable: !disabled,
		editorProps: {
			attributes: {
				class: `prose prose-sm focus:outline-none w-full max-w-full h-[130px] p-1 text-sm leading-snug ${
					disabled ? "text-gray-500 cursor-not-allowed bg-gray-50" : ""
				}`,
			},
		},
		onUpdate: ({ editor }) => {
			if (!isUpdatingRef.current) {
				const json = editor.getJSON();
				contentRef.current = json;
				onChange(json);
			}
		},
	});

	useEffect(() => {
		if (editor) {
			editor.setEditable(!disabled);
		}
	}, [disabled, editor]);

	useEffect(() => {
		if (!editor) return;

		const currentContent = editor.getJSON();
		const currentContentStr = JSON.stringify(currentContent);
		const newContentStr = JSON.stringify(
			normalizedContent || { type: "doc", content: [] }
		);

		if (
			currentContentStr !== newContentStr &&
			contentRef.current !== normalizedContent
		) {
			isUpdatingRef.current = true;
			editor.commands.setContent(
				normalizedContent || { type: "doc", content: [] }
			);
			contentRef.current = normalizedContent;
			setTimeout(() => {
				isUpdatingRef.current = false;
			}, 0);
		}
	}, [normalizedContent, editor]);

	return (
		<div
			className={`w-full border border-gray-300 rounded-md bg-white flex flex-col overflow-hidden tiptap-editor-wrapper ${
				disabled ? "border-gray-200 bg-gray-50" : "border-gray-300"
			}`}
		>
			<TiptapToolbar editor={editor} disabled={disabled} />
			<div
				className="flex-1 overflow-y-auto min-h-[130px] max-h-[200px] tiptap-content"
				onClick={() => !disabled && editor?.chain().focus().run()}
			>
				<EditorContent editor={editor} />
			</div>
		</div>
	);
};

export { isEmptyJSONContent };
export default TiptapEditor;
