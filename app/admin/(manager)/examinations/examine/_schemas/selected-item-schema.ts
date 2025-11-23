import z from 'zod';

export const selectedItemSchema = z.object({
	id: z.string(),
	name: z.string(),
	price: z.number().optional(),
	unit: z.string().optional(),
	description: z.string().optional().nullable(),
	quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
});
