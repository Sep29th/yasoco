import React, { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import {
	Bold,
	Italic,
	Underline as UnderlineIcon,
	List,
	ListOrdered,
} from "lucide-react";
interface TiptapToolbarProps {
	editor: Editor | null;
	disabled?: boolean;
}
const TiptapToolbar: React.FC<TiptapToolbarProps> = ({
	editor,
	disabled = false,
}) => {
	const [, setForceUpdate] = useState(0);
	useEffect(() => {
		if (!editor) return;
		const update = () => setForceUpdate((prev) => prev + 1);
		editor.on("transaction", update);
		return () => {
			editor.off("transaction", update);
		};
	}, [editor]);
	if (!editor) return null;
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
