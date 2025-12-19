import { z } from "zod";

export const articleNameSchema = z.object({
	["article-name"]: z.string().min(1, "Tên cần ít nhất 1 ký tự"),
});

export type FormValues = z.infer<typeof articleNameSchema>;
