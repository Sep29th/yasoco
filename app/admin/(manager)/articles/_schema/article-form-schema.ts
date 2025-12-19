import z from "zod";
import { JSONContent } from "@tiptap/react";

export const articleFormSchema = z.object({
	title: z
		.string()
		.min(1, "Phải nhập tiêu đề cho bài viết")
		.max(100, "Không được vượt quá 100 ký tự"),
	slug: z.string(),
	excerpt: z.string().nullable(),
	tags: z.array(z.string()),
	coverImage: z.string().min(1, "Chưa có ảnh hiện trước"),
	isPublished: z.boolean(),
	showInMainPage: z.boolean(),
	content: z.custom<JSONContent>().nullable(),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;
