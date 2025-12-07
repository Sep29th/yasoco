import z from "zod";

export const discountSchema = z
	.object({
		type: z.enum(["fix", "percent"]),
		value: z.number().min(1, "Giá trị phải từ 1 trở lên"),
		description: z.string().min(1, "Phải điền lý do giảm giá"),
	})
	.strict();
