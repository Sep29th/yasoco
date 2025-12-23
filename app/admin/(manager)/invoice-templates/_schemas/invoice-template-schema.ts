import z from "zod";

export const invoiceTemplateSchema = z.object({
	name: z.string().min(1, "Phải nhập tên của mẫu đơn"),
	value: z.custom<PrismaJson.EditorContentType>().optional(),
	backgroundImage: z.string(),
})

export type FormValues = z.infer<typeof invoiceTemplateSchema>