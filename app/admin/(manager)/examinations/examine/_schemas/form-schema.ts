import z from "zod";
import { isEmptyJSONContent } from "@/components/tiptap-editor";
import { JSONContent } from "@tiptap/react";
import {
	selectedMedicineSchema,
	selectedServiceSchema,
} from "./selected-item-schema";
import { discountSchema } from "@/app/admin/(manager)/examinations/examine/_schemas/discount-schema";
export const createFormSchema = (
	mode: "receive" | "examine" | "pay" | "edit"
) => {
	return z
		.object({
			parentName: z.string(),
			address: z.string(),
			parentPhone: z
				.string()
				.regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "SĐT không đúng định dạng"),
			kidName: z.string().min(1, "Vui lòng nhập tên bé"),
			kidGender: z.enum(["male", "female"], {
				message: "Vui lòng chọn giới tính",
			}),
			kidBirthDate: z.date({ message: "Vui lòng chọn ngày sinh" }),
			kidWeight: z
				.number({ message: "Vui lòng nhập cân nặng" })
				.min(0.1, "Cân nặng phải lớn hơn 0"),
			medicalHistory: z.custom<JSONContent>().optional(),
			symptoms: z.custom<JSONContent>().optional(),
			diagnose: z.custom<JSONContent>().optional(),
			services: z.array(selectedServiceSchema),
			medicines: z.array(selectedMedicineSchema),
			note: z.custom<JSONContent>().optional(),
			discounts: z.array(discountSchema),
		})
		.superRefine((data, ctx) => {
			if (mode === "examine") {
				if (!data.diagnose || isEmptyJSONContent(data.diagnose)) {
					ctx.addIssue({
						code: "custom",
						message: "Vui lòng nhập chẩn đoán",
						path: ["diagnose"],
					});
				}
			}
		})
		.strict();
};
export type FormValues = z.infer<ReturnType<typeof createFormSchema>>;
