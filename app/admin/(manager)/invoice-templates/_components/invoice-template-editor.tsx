/* eslint-disable @next/next/no-img-element */
"use client";
import {useEffect, useRef} from "react";
import {EditorContent, JSONContent, useEditor} from "@tiptap/react";
import InvoiceTemplateEditorToolbar
	from "@/app/admin/(manager)/invoice-templates/_components/invoice-template-editor-toolbar";
import {
	invoiceTemplateTipTapExtensions,
	printFont,
} from "@/lib/constants/invoice-template";
import {UseFormReturn, useWatch} from "react-hook-form";
import {FormValues} from "@/app/admin/(manager)/invoice-templates/_schemas/invoice-template-schema";

type PropsType = {
	content: PrismaJson.EditorContentType | undefined;
	onChange: (content: PrismaJson.EditorContentType) => void;
	disabled?: boolean;
	background?: boolean;
	form: UseFormReturn<FormValues, unknown, FormValues>
};

export default function InvoiceTemplateEditor({
																								content,
																								onChange,
																								disabled = false,
																								background,
																								form
																							}: PropsType) {
	const contentRef = useRef<JSONContent | null>(content ?? null);
	const isUpdatingRef = useRef<boolean>(false);

	const editor = useEditor({
		immediatelyRender: false,
		extensions: invoiceTemplateTipTapExtensions,
		content: content || {type: "doc", content: []},
		editable: !disabled,
		editorProps: {
			attributes: {
				class: `prose prose-sm focus:outline-none w-full max-w-full min-h-[130px] leading-snug`,
			},
		},
		onBlur: ({editor}) => {
			if (!isUpdatingRef.current) {
				const json = editor.getJSON();
				contentRef.current = json;
				onChange(json);
			}
		},
	});

	const backgroundImageUrl = useWatch({control: form.control, name: "backgroundImage"});

	useEffect(() => {
		if (editor) {
			editor.setEditable(!disabled);
		}
	}, [disabled, editor]);

	useEffect(() => {
		if (!editor || !editor.isInitialized) return;
		const currentContent = editor.getJSON();
		const newContent = content || {type: "doc", content: []};
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
				<InvoiceTemplateEditorToolbar
					editor={editor}
					background={true}
					onBackgroundChange={(newUrl: string) => form.setValue("backgroundImage", newUrl)}
				/>
			</div>
			<div className="flex-1 overflow-y-auto p-4 flex justify-center bg-gray-100">
				<div
					className={`bg-white shadow-lg print:shadow-none invoice-template relative ${printFont.className}`}
					style={{
						width: "148mm",
						minHeight: "210mm",
						padding: "5mm 10mm",
						boxSizing: "border-box",
					}}
					onClick={() => !disabled && editor?.chain().focus().run()}
				>
					{backgroundImageUrl && (
						<div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden rounded-sm">
							<img
								src={backgroundImageUrl}
								alt="Invoice Background"
								className="w-full h-full object-contain object-center opacity-[0.15]"
							/>
						</div>
					)}
					<div className="relative z-10">
						<EditorContent editor={editor} />
					</div>
				</div>
			</div>
		</div>
	);
}