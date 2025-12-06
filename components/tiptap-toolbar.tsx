import React, { useState, useEffect, useRef, useTransition } from "react";
import { Editor } from "@tiptap/react";
import {
	Bold,
	Italic,
	Underline as UnderlineIcon,
	List,
	ListOrdered,
	Loader2,
	ImageIcon,
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

interface TiptapToolbarProps {
	editor: Editor | null;
	disabled?: boolean;
	canUploadImage?: boolean;
}

const TiptapToolbar: React.FC<TiptapToolbarProps> = ({
	editor,
	disabled = false,
	canUploadImage,
}) => {
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

	if (!editor) return null;

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

	const insertTable = () => {
		editor
			.chain()
			.focus()
			.insertTable({ rows: 1, cols: 3, withHeaderRow: false })
			.run();
	};

	return (
		<div
			className={`flex flex-wrap gap-1 mb-0 p-1 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-md ${
				disabled ? "opacity-50 pointer-events-none cursor-not-allowed" : ""
			}`}
		>
			<Toggle
				onClick={() => editor.chain().focus().toggleBold().run()}
				pressed={editor.isActive("bold")}
				disabled={disabled}
			>
				<Bold size={16} />
			</Toggle>
			<Toggle
				onClick={() => editor.chain().focus().toggleItalic().run()}
				pressed={editor.isActive("italic")}
				disabled={disabled}
			>
				<Italic size={16} />
			</Toggle>
			<Toggle
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				pressed={editor.isActive("underline")}
				disabled={disabled}
			>
				<UnderlineIcon size={16} />
			</Toggle>
			<div className="w-px bg-gray-300 mx-1 h-5 self-center" />
			<Toggle
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				pressed={editor.isActive("bulletList")}
				disabled={disabled}
			>
				<List size={16} />
			</Toggle>
			<Toggle
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				pressed={editor.isActive("orderedList")}
				disabled={disabled}
			>
				<ListOrdered size={16} />
			</Toggle>

			{canUploadImage && (
				<>
					<div className="w-px bg-gray-300 mx-1 h-5 self-center" />
					<DropdownMenu>
						<DropdownMenuTrigger asChild disabled={disabled}>
							<button
								type="button"
								className={`p-1.5 rounded transition-colors duration-200 cursor-pointer ${
									isTableActive
										? "bg-[#A6CF52] text-white"
										: "bg-transparent hover:bg-gray-100 text-gray-600"
								} ${disabled ? "cursor-not-allowed" : ""}`}
							>
								<TableIcon size={16} />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" className="w-56">
							<DropdownMenuLabel>Thao tác bảng</DropdownMenuLabel>
							<DropdownMenuItem onClick={insertTable} disabled={isTableActive}>
								<Plus className="mr-2 h-4 w-4" />
								<span>Tạo bảng (1x3)</span>
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
								<Trash2 className="mr-2 h-4 w-4" />
								<span>Xóa cột</span>
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
								<Trash2 className="mr-2 h-4 w-4" />
								<span>Xóa hàng</span>
							</DropdownMenuItem>

							<DropdownMenuSeparator />

							<DropdownMenuItem
								onClick={() => editor.chain().focus().mergeCells().run()}
								disabled={!isTableActive}
							>
								<MoreHorizontal className="mr-2 h-4 w-4" />
								<span>Gộp ô</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => editor.chain().focus().splitCell().run()}
								disabled={!isTableActive}
							>
								<MoreHorizontal className="mr-2 h-4 w-4" />
								<span>Chia ô</span>
							</DropdownMenuItem>

							<DropdownMenuSeparator />

							<DropdownMenuItem
								onClick={() => editor.chain().focus().deleteTable().run()}
								disabled={!isTableActive}
								className="text-red-600 focus:text-red-600 focus:bg-red-50"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								<span>Xóa bảng</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<div className="w-px bg-gray-300 mx-1 h-5 self-center" />
					<button
						type="button"
						onClick={handleAddImageClick}
						disabled={isPending || disabled}
						className={`p-1.5 rounded transition-colors duration-200 cursor-pointer bg-transparent hover:bg-gray-100 text-gray-600 ${
							disabled ? "cursor-not-allowed" : ""
						}`}
					>
						{isPending ? (
							<Loader2 size={16} className="animate-spin text-[#A6CF52]" />
						) : (
							<ImageIcon size={16} />
						)}
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						className="hidden"
						onChange={handleFileChange}
					/>
				</>
			)}
		</div>
	);
};

interface ToggleProps {
	children: React.ReactNode;
	pressed: boolean;
	onClick: () => void;
	disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({
	children,
	pressed,
	onClick,
	disabled,
}) => {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={`p-1.5 rounded transition-colors duration-200 cursor-pointer ${
				pressed
					? "bg-[#A6CF52] text-white"
					: "bg-transparent hover:bg-gray-100 text-gray-600"
			} ${disabled ? "cursor-not-allowed" : ""}`}
		>
			{children}
		</button>
	);
};

export default TiptapToolbar;
