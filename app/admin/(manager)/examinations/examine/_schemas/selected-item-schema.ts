import z from "zod";
export const selectedServiceSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		price: z.number(),
		quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
		description: z.string().optional(),
	})
	.strict();

export const selectedMedicineSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
		description: z.string().optional(),
		unit: z.string(),
		dosage: z.string().min(1, "Phải viết liều dùng cho thuốc"),
	})
	.strict();
