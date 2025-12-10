"use client";
import { useEffect, useRef } from "react";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import InvoiceTemplateEditorToolbar from "@/app/admin/(manager)/invoice-templates/_components/invoice-template-editor-toolbar";
import {
	invoiceTemplateTipTapExtensions,
	printFont,
} from "@/lib/constants/invoice-template";

type PropsType = {
	content: PrismaJson.EditorContentType | undefined;
	onChange: (content: PrismaJson.EditorContentType) => void;
	disabled?: boolean;
};

export default function InvoiceTemplateEditor({
	content,
	onChange,
	disabled = false,
}: PropsType) {
	const contentRef = useRef<JSONContent | null>(content ?? null);
	const isUpdatingRef = useRef<boolean>(false);
	const editor = useEditor({
		immediatelyRender: false,
		extensions: invoiceTemplateTipTapExtensions,
		content: content || { type: "doc", content: [] },
		editable: !disabled,
		editorProps: {
			attributes: {
				class: `prose prose-sm focus:outline-none w-full max-w-full min-h-[130px] leading-snug`,
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
			contentRef.current = content ?? null;
			requestAnimationFrame(() => {
				isUpdatingRef.current = false;
			});
		}
	}, [content, editor]);

	return (
		<div
			className={`w-full border rounded-md bg-gray-50 flex flex-col overflow-hidden ${
				disabled
					? "border-gray-200 bg-gray-50 opacity-75 cursor-not-allowed"
					: "border-gray-300 bg-white"
			}`}
		>
			<div className="bg-white border-b border-gray-200 z-10 shadow-sm">
				<InvoiceTemplateEditorToolbar editor={editor} />
			</div>
			<div className="flex-1 overflow-y-auto p-4 flex justify-center bg-gray-100">
				<div
					className={`bg-white shadow-lg print:shadow-none invoice-template ${printFont.className}`}
					style={{
						width: "148mm",
						minHeight: "210mm",
						padding: "5mm",
						boxSizing: "border-box",
					}}
					onClick={() => !disabled && editor?.chain().focus().run()}
				>
					<EditorContent editor={editor} />
				</div>
			</div>
		</div>
	);
}
