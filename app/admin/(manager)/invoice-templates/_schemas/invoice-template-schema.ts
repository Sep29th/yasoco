import z from "zod";

export const invoiceTemplateSchema = z.object({
	name: z.string(),
	value: z.custom<PrismaJson.EditorContentType>().optional()
})

export type FormValues = z.infer<typeof invoiceTemplateSchema>