"use client";
import React, {useEffect, useRef, useState, useTransition} from "react";
import {Editor} from "@tiptap/react";
import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	Bold,
	Columns2,
	ImageIcon,
	Italic,
	List,
	ListOrdered,
	Minus,
	Underline,
	Loader2,
} from "lucide-react";
import uploadImage from "@/app/admin/(manager)/invoice-templates/_actions/upload-image";

type PropsType = {
	editor: Editor | null;
};

export default function InvoiceTemplateEditorToolbar({editor}: PropsType) {
	const [, setForceUpdate] = useState(0);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		if (!editor) return;
		const update = () => setForceUpdate((prev) => prev + 1);
		editor.on("transaction", update);
		return () => {
			editor.off("transaction", update);
		};
	}, [editor]);

	if (!editor) {
		return null;
	}

	const setFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		if (value === "paragraph") {
			editor.chain().focus().setParagraph().run();
			return;
		}
		const level = parseInt(value, 10) as 1 | 2 | 3 | 4 | 5 | 6;
		editor.chain().focus().setHeading({level}).run();
	};

	const currentFontValue = editor.isActive("heading", {level: 1})
		? "1"
		: editor.isActive("heading", {level: 2})
			? "2"
			: editor.isActive("heading", {level: 3})
				? "3"
				: editor.isActive("heading", {level: 4})
					? "4"
					: editor.isActive("heading", {level: 5})
						? "5"
						: editor.isActive("heading", {level: 6})
							? "6"
							: "paragraph";

	const addSplitLayout = () => {
		editor
			.chain()
			.focus()
			.insertTable({rows: 1, cols: 2, withHeaderRow: false})
			.run();
	};

	const handleAddImageClick = () => {
		if (!fileInputRef.current) return;
		fileInputRef.current.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append("file", file);

		startTransition(async () => {
			const result = await uploadImage(formData);

			if (result.success && result.url) {
				editor.chain().focus().setImage({src: result.url}).run();
			} else {
				console.error("Upload failed:", result.error);
				alert("Có lỗi xảy ra khi tải ảnh lên.");
			}

			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		});
	};

	return (
		<div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-2 items-center sticky top-0 z-10">
			<select
				className="p-1 border rounded text-sm bg-white"
				onChange={setFontSize}
				value={currentFontValue}
			>
				<option value="paragraph">Normal</option>
				<option value="1">H1 rất lớn</option>
				<option value="2">H2 lớn</option>
				<option value="3">H3 trung bình</option>
				<option value="4">H4 hơi nhỏ</option>
				<option value="5">H5 nhỏ</option>
				<option value="6">H6 rất nhỏ</option>
			</select>

			<div className="w-px h-6 bg-gray-300 mx-1"/>

			<button
				type="button"
				onClick={() => editor.chain().focus().toggleBold().run()}
				className={`p-1 rounded hover:bg-gray-200 ${
					editor.isActive("bold") ? "bg-gray-200 text-[#A6CF52]" : ""
				}`}
				title="Bold"
			>
				<Bold size={18}/>
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				className={`p-1 rounded hover:bg-gray-200 ${
					editor.isActive("italic") ? "bg-gray-200 text-[#A6CF52]" : ""
				}`}
				title="Italic"
			>
				<Italic size={18}/>
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				className={`p-1 rounded hover:bg-gray-200 ${
					editor.isActive("underline") ? "bg-gray-200 text-[#A6CF52]" : ""
				}`}
				title="Underline"
			>
				<Underline size={18}/>
			</button>

			<div className="w-px h-6 bg-gray-300 mx-1"/>

			<button
				type="button"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={`p-1 rounded hover:bg-gray-200 ${
					editor.isActive("bulletList") ? "bg-gray-200 text-[#A6CF52]" : ""
				}`}
			>
				<List size={18}/>
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={`p-1 rounded hover:bg-gray-200 ${
					editor.isActive("orderedList") ? "bg-gray-200 text-[#A6CF52]" : ""
				}`}
			>
				<ListOrdered size={18}/>
			</button>

			<div className="w-px h-6 bg-gray-300 mx-1"/>

			<button
				type="button"
				onClick={() => editor.chain().focus().setTextAlign("left").run()}
				className="p-1 rounded hover:bg-gray-200"
			>
				<AlignLeft size={18}/>
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().setTextAlign("center").run()}
				className="p-1 rounded hover:bg-gray-200"
			>
				<AlignCenter size={18}/>
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().setTextAlign("right").run()}
				className="p-1 rounded hover:bg-gray-200"
			>
				<AlignRight size={18}/>
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().setTextAlign("justify").run()}
				className="p-1 rounded hover:bg-gray-200"
			>
				<AlignJustify size={18}/>
			</button>

			<div className="w-px h-6 bg-gray-300 mx-1"/>

			<button
				type="button"
				onClick={handleAddImageClick}
				disabled={isPending}
				className="p-1 rounded hover:bg-gray-200 flex items-center gap-1 relative"
				title="Thêm ảnh"
			>
				{isPending ? (
					<Loader2 size={18} className="animate-spin text-[#A6CF52]"/>
				) : (
					<ImageIcon size={18}/>
				)}
			</button>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={handleFileChange}
			/>

			<button
				type="button"
				onClick={addSplitLayout}
				className="p-1 rounded hover:bg-gray-200"
				title="Layout 2 bên (Space Between)"
			>
				<Columns2 size={18}/>
			</button>

			<button
				type="button"
				onClick={() => editor.chain().focus().setHorizontalRule().run()}
				className="p-1 rounded hover:bg-gray-200"
				title="Đường kẻ ngang"
			>
				<Minus size={18}/>
			</button>
		</div>
	);
}