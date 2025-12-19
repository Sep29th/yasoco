"use client";
import { useEffect, useRef } from "react";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import { invoiceTemplateTipTapExtensions } from "@/lib/constants/invoice-template";
import ArticleEditorToolbar from "./article-editor-toolbar";

type PropsType = {
	content: PrismaJson.EditorContentType | undefined;
	onChange: (content: PrismaJson.EditorContentType) => void;
};

export default function ArticleEditor({ content, onChange }: PropsType) {
	const contentRef = useRef<JSONContent | null>(content ?? null);
	const isUpdatingRef = useRef<boolean>(false);
	const editor = useEditor({
		immediatelyRender: false,
		extensions: invoiceTemplateTipTapExtensions,
		content: content || { type: "doc", content: [] },
		editorProps: {
			attributes: {
				class: `prose prose-sm focus:outline-none w-full max-w-full min-h-[130px] leading-snug whitespace-pre-wrap`,
			},
		},
		onBlur: ({ editor }) => {
			if (!isUpdatingRef.current) {
				const json = editor.getJSON();
				contentRef.current = json;
				onChange(json);
			}
		},
	});

	useEffect(() => {
		if (!editor || !editor.isInitialized) return;
		const currentContent = editor.getJSON();
		const newContent = content || { type: "doc", content: [] };
		if (JSON.stringify(currentContent) !== JSON.stringify(newContent)) {
			isUpdatingRef.current = true;
			editor.commands.setContent(newContent);
			contentRef.current = content ?? null;
			requestAnimationFrame(() => {
				isUpdatingRef.current = false;
			});
		}
	}, [content, editor]);

	return (
		<div className="w-full flex flex-col overflow-hidden">
			<div className="bg-white border-b border-gray-200 z-10">
				<ArticleEditorToolbar editor={editor} />
			</div>
			<div className="flex-1 overflow-y-auto flex justify-center">
				<div
					className="bg-white article px-20 py-10 w-full"
					onClick={() => editor?.chain().focus().run()}
				>
					<EditorContent editor={editor} />
				</div>
			</div>
		</div>
	);
}
