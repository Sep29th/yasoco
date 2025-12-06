"use client";
import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapToolbar from "./tiptap-toolbar";
import ImageResize from "tiptap-extension-resize-image";
import { TableKit } from "@tiptap/extension-table";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { Gapcursor } from "@tiptap/extensions";
type PropsType = {
	content?: JSONContent | null;
	onChange: (content: JSONContent) => void;
	disabled?: boolean;
	className?: string;
	editorClassname?: string;
	canUploadImage?: boolean;
	dontShowToolbar?: boolean;
};
const isEmptyJSONContent = (content: JSONContent | null): boolean => {
	if (!content) return true;
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
const TiptapEditor: React.FC<PropsType> = ({
	content,
	onChange,
	disabled = false,
	className,
	editorClassname,
	canUploadImage,
	dontShowToolbar,
}) => {
	const contentRef = useRef<JSONContent | null>(content);
	const isUpdatingRef = useRef(false);
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			Document,
			Paragraph,
			Text,
			Gapcursor,
			StarterKit,
			ImageResize.configure({
				allowBase64: true,
				HTMLAttributes: {
					style: "display: block; margin-left: auto; margin-right: auto;",
				},
			}),
			TableKit.configure({ table: { resizable: true } }),
		],
		content: content || { type: "doc", content: [] },
		editable: !disabled,
		editorProps: {
			attributes: {
				class: `prose prose-sm focus:outline-none w-full max-w-full h-[130px] p-1 text-sm leading-tight ${
					editorClassname ? editorClassname : ""
				} ${disabled ? "text-gray-500 cursor-not-allowed bg-gray-50" : ""}`,
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
		if (!editor || !editor.isInitialized) return;
		const currentContent = editor.getJSON();
		const newContent = content || { type: "doc", content: [] };
		if (JSON.stringify(currentContent) !== JSON.stringify(newContent)) {
			isUpdatingRef.current = true;
			editor.commands.setContent(newContent);
			contentRef.current = content;
			requestAnimationFrame(() => {
				isUpdatingRef.current = false;
			});
		}
	}, [content, editor]);
	return (
		<div
			className={`w-full border rounded-md bg-white flex flex-col overflow-hidden tiptap-editor-wrapper ${
				className ? className : ""
			} ${disabled ? "border-gray-200 bg-gray-50" : "border-gray-300"}`}
		>
			{!dontShowToolbar && (
				<TiptapToolbar
					editor={editor}
					disabled={disabled}
					canUploadImage={canUploadImage}
				/>
			)}
			<div
				className="flex-1 overflow-y-auto min-h-[130px] tiptap-content"
				onClick={() => !disabled && editor?.chain().focus().run()}
			>
				<EditorContent editor={editor} />
			</div>
		</div>
	);
};
export { isEmptyJSONContent };
export default TiptapEditor;
