"use client";

import {JSONContent} from "@tiptap/react";
import TiptapEditor, {isEmptyJSONContent} from "@/components/tiptap-editor";

type PropsType = {
	label: string;
	content: JSONContent | null;
}

export default function ReadOnlyTiptap({label, content}: PropsType) {
	if (isEmptyJSONContent(content)) {
		return (
			<div className="space-y-1">
				<span className="text-sm font-medium text-gray-700">{label}</span>
				<p className="text-sm text-gray-400 italic">Không có</p>
			</div>
		);
	}
	return (
		<div className="space-y-1">
			<span className="text-sm font-medium text-gray-700">{label}</span>
			<TiptapEditor
				dontShowToolbar
				content={content}
				onChange={() => {
				}}
				disabled
			/>
		</div>
	);
}