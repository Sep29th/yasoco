"use client";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { Editor } from "@tiptap/react";
import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	Bold,
	ImageIcon,
	Italic,
	List,
	ListOrdered,
	Minus,
	Underline,
	Loader2,
	Table as TableIcon,
	Plus,
	Trash2,
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	ArrowDown,
	MoreHorizontal,
} from "lucide-react";
import uploadImage from "@/lib/upload-image";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
type PropsType = { editor: Editor | null };
export default function ArticleEditorToolbar({ editor }: PropsType) {
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
		editor.chain().focus().setHeading({ level }).run();
	};
	const currentFontValue = editor.isActive("heading", { level: 1 })
		? "1"
		: editor.isActive("heading", { level: 2 })
		? "2"
		: editor.isActive("heading", { level: 3 })
		? "3"
		: editor.isActive("heading", { level: 4 })
		? "4"
		: editor.isActive("heading", { level: 5 })
		? "5"
		: editor.isActive("heading", { level: 6 })
		? "6"
		: "paragraph";
	const insertTable = () => {
		editor
			.chain()
			.focus()
			.insertTable({ rows: 1, cols: 2, withHeaderRow: false })
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
				editor.chain().focus().setImage({ src: result.url }).run();
			} else {
				console.error("Upload failed:", result.error);
				alert("Có lỗi xảy ra khi tải ảnh lên.");
			}
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		});
	};
	const isTableActive = editor.isActive("table");
	const btnClass =
		"p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer transition-colors";
	return (
		<div className="p-2 flex flex-wrap gap-2 items-center sticky top-0 z-10">
			<select
				className="p-1 border rounded text-sm bg-white"
				onChange={setFontSize}
				value={currentFontValue}
			>
				<option value="paragraph">Normal</option>
				<option value="1">H1 rất lớn</option> <option value="2">H2 lớn</option>
				<option value="3">H3 trung bình</option>
				<option value="4">H4 hơi nhỏ</option> <option value="5">H5 nhỏ</option>
				<option value="6">H6 rất nhỏ</option>
			</select>
			<div className="w-px h-6 bg-gray-300 mx-1" />
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleBold().run()}
				className={`p-1 rounded cursor-pointer hover:bg-gray-200 ${
					editor.isActive("bold") ? "bg-gray-200 text-[#A6CF52]" : ""
				}`}
				title="Bold"
			>
				<Bold size={18} />
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				className={`p-1 rounded cursor-pointer hover:bg-gray-200 ${
					editor.isActive("italic") ? "bg-gray-200 text-[#A6CF52]" : ""
				}`}
				title="Italic"
			>
				<Italic size={18} />
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				className={`p-1 rounded cursor-pointer hover:bg-gray-200 ${
					editor.isActive("underline") ? "bg-gray-200 text-[#A6CF52]" : ""
				}`}
				title="Underline"
			>
				<Underline size={18} />
			</button>
			<div className="w-px h-6 bg-gray-300 mx-1" />
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={`p-1 rounded cursor-pointer hover:bg-gray-200 ${
					editor.isActive("bulletList") ? "bg-gray-200 text-[#A6CF52]" : ""
				}`}
			>
				<List size={18} />
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={`p-1 rounded cursor-pointer hover:bg-gray-200 ${
					editor.isActive("orderedList") ? "bg-gray-200 text-[#A6CF52]" : ""
				}`}
			>
				<ListOrdered size={18} />
			</button>
			<div className="w-px h-6 bg-gray-300 mx-1" />
			<button
				type="button"
				onClick={() => editor.chain().focus().setTextAlign("left").run()}
				className={btnClass}
			>
				<AlignLeft size={18} />
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().setTextAlign("center").run()}
				className={btnClass}
			>
				<AlignCenter size={18} />
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().setTextAlign("right").run()}
				className={btnClass}
			>
				<AlignRight size={18} />
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().setTextAlign("justify").run()}
				className={btnClass}
			>
				<AlignJustify size={18} />
			</button>
			<div className="w-px h-6 bg-gray-300 mx-1" />
			<button
				type="button"
				onClick={handleAddImageClick}
				disabled={isPending}
				className={`${btnClass} flex items-center gap-1 relative`}
				title="Thêm ảnh"
			>
				{isPending ? (
					<Loader2 size={18} className="animate-spin text-[#A6CF52]" />
				) : (
					<ImageIcon size={18} />
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
				onClick={() => editor.chain().focus().setHorizontalRule().run()}
				className={btnClass}
				title="Đường kẻ ngang"
			>
				<Minus size={18} />
			</button>
			<div className="w-px h-6 bg-gray-300 mx-1" />
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className={`${btnClass} ${
							isTableActive ? "bg-gray-200 text-[#A6CF52]" : ""
						}`}
						title="Thao tác bảng"
					>
						<TableIcon size={18} />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-56">
					<DropdownMenuLabel>Thao tác bảng</DropdownMenuLabel>
					<DropdownMenuItem onClick={insertTable} disabled={isTableActive}>
						<Plus className="mr-2 h-4 w-4" /> <span>Tạo bảng (1x2)</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
						Cột
					</DropdownMenuLabel>
					<DropdownMenuItem
						onClick={() => editor.chain().focus().addColumnBefore().run()}
						disabled={!isTableActive}
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						<span>Thêm cột bên trái</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => editor.chain().focus().addColumnAfter().run()}
						disabled={!isTableActive}
					>
						<ArrowRight className="mr-2 h-4 w-4" />
						<span>Thêm cột bên phải</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => editor.chain().focus().deleteColumn().run()}
						disabled={!isTableActive}
						className="text-red-600 focus:text-red-600 focus:bg-red-50"
					>
						<Trash2 className="mr-2 h-4 w-4" /> <span>Xóa cột</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
						Hàng
					</DropdownMenuLabel>
					<DropdownMenuItem
						onClick={() => editor.chain().focus().addRowBefore().run()}
						disabled={!isTableActive}
					>
						<ArrowUp className="mr-2 h-4 w-4" />
						<span>Thêm hàng phía trên</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => editor.chain().focus().addRowAfter().run()}
						disabled={!isTableActive}
					>
						<ArrowDown className="mr-2 h-4 w-4" />
						<span>Thêm hàng phía dưới</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => editor.chain().focus().deleteRow().run()}
						disabled={!isTableActive}
						className="text-red-600 focus:text-red-600 focus:bg-red-50"
					>
						<Trash2 className="mr-2 h-4 w-4" /> <span>Xóa hàng</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => editor.chain().focus().mergeCells().run()}
						disabled={!isTableActive}
					>
						<MoreHorizontal className="mr-2 h-4 w-4" /> <span>Gộp ô</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => editor.chain().focus().splitCell().run()}
						disabled={!isTableActive}
					>
						<MoreHorizontal className="mr-2 h-4 w-4" /> <span>Chia ô</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => editor.chain().focus().deleteTable().run()}
						disabled={!isTableActive}
						className="text-red-600 focus:text-red-600 focus:bg-red-50"
					>
						<Trash2 className="mr-2 h-4 w-4" /> <span>Xóa bảng</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
