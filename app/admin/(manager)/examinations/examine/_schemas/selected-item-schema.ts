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

export const selectedMedicineSchema = selectedServiceSchema.extend({
	unit: z.string(),
}).strict();
