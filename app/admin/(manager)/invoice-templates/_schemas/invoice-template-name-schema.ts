import {z} from "zod";

export const invoiceTemplateNameSchema = z.object({
	["invoice-template-name"]: z.string().min(1, "Tên cần ít nhất 1 ký tự")
})

export type FormValues = z.infer<typeof invoiceTemplateNameSchema>