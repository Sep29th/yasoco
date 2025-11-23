import z from "zod";
import { selectedItemSchema } from "./selected-item-schema";
import { isEmptyJSONContent } from "@/components/tiptap-editor";
import { JSONContent } from "@tiptap/react";

export const createFormSchema = (mode: "receive" | "examine" | "pay") => {
	return z
		.object({
			parentName: z.string().min(1, "Vui lòng nhập tên phụ huynh"),
			parentPhone: z
				.string()
				.min(10, "SĐT phải có ít nhất 10 số")
				.regex(/^[0-9]+$/, "SĐT chỉ được chứa số"),
			kidName: z.string().min(1, "Vui lòng nhập tên bé"),
			kidGender: z.enum(["male", "female"], {
				message: "Vui lòng chọn giới tính",
			}),
			kidBirthDate: z.date({
				message: "Vui lòng chọn ngày sinh",
			}),
			kidWeight: z
				.number({
					message: "Vui lòng nhập cân nặng",
				})
				.min(0.1, "Cân nặng phải lớn hơn 0"),
			symptoms: z.custom<JSONContent>().optional(),
			diagnose: z.custom<JSONContent>().optional(),
			services: z.array(selectedItemSchema),
			medicines: z.array(selectedItemSchema),
			note: z.custom<JSONContent>().optional(),
		})
		.superRefine((data, ctx) => {
			if (mode === "examine") {
				if (!data.diagnose || isEmptyJSONContent(data.diagnose)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "Vui lòng nhập chẩn đoán",
						path: ["diagnose"],
					});
				}
			}
		});
};

export type FormValues = z.infer<ReturnType<typeof createFormSchema>>;
