import z from "zod";

export const dosageTemplateSchema = z.object({
	shortcut: z.string().min(1, "Phải nhập nội dung tắt"),
	content: z.string().min(1, "Phải nhập nội dung")
})

export type FormValues = z.infer<typeof dosageTemplateSchema>