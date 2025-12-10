import { JSONContent } from "@tiptap/react";
import { InvoiceTemplateDataType } from "@/utils/types/invoice-template-data";
import { generateHTML } from "@tiptap/html";
import { invoiceTemplateTipTapExtensions } from "@/lib/constants/invoice-template";
import { getDateVnTimezone } from "@/utils/get-date-vn-timezone";
import { getTimeVnTimezone } from "@/utils/get-time-vn-timezone";

const vndFormatter = new Intl.NumberFormat("vi-VN");

const escapeHtml = (str: string | number | null | undefined): string => {
	if (str === null || str === undefined) return "";
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
};

const sanitizeHtml = (html: string): string => {
	if (!html) return html;
	let out = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
	out = out.replace(/\s+on\w+\s*=\s*(["'].*?["']|[^\s>]+)/gi, "");
	out = out.replace(/javascript:/gi, "");
	return out;
};

type ServiceItem = InvoiceTemplateDataType["services"][number];
type MedicineItem = InvoiceTemplateDataType["medicines"][number];
type DiscountItem = InvoiceTemplateDataType["discounts"][number];

type ArraySection<T> = {
	items: T[];
	getParams: (item: T, index: number) => Record<string, string>;
};

type ArraySections = {
	dich_vu: ArraySection<ServiceItem>;
	thuoc: ArraySection<MedicineItem>;
	giam_gia: ArraySection<DiscountItem>;
};

export function renderHtmlApplyDataToTiptapJsonContent(
	content: JSONContent,
	data: InvoiceTemplateDataType
): string {
	const rawHtml = generateHTML(content, invoiceTemplateTipTapExtensions);

	const commonParams: Record<string, string> = {
		"{{ma_kham}}": escapeHtml(data.id),
		"{{ten_phu_huynh}}": escapeHtml(data.parentName),
		"{{sdt_phu_huynh}}": escapeHtml(data.parentPhone),
		"{{ten_be}}": escapeHtml(data.kidName),
		"{{ngay_sinh_be}}": escapeHtml(
			getDateVnTimezone(new Date(data.kidBirthDate))
		),
		"{{gioi_tinh_be}}": data.kidGender ? "Nam" : "Nữ",
		"{{can_nang_be}}": escapeHtml(data.kidWeight ?? "Không có"),
		"{{tien_su_benh}}": data.medicalHistory
			? sanitizeHtml(
					generateHTML(
						data.medicalHistory || { type: "doc" },
						invoiceTemplateTipTapExtensions
					)
			  )
			: "Không có",
		"{{ngay_kham}}": escapeHtml(getDateVnTimezone(new Date(data.date))),
		"{{gio_kham}}": escapeHtml(getTimeVnTimezone(new Date(data.date))),
		"{{trieu_chung}}": data.symptoms
			? sanitizeHtml(
					generateHTML(
						data.symptoms || { type: "doc" },
						invoiceTemplateTipTapExtensions
					)
			  )
			: "Không có",
		"{{chan_doan}}": data.diagnose
			? sanitizeHtml(
					generateHTML(
						data.diagnose || { type: "doc" },
						invoiceTemplateTipTapExtensions
					)
			  )
			: "Không có",
		"{{ghi_chu}}": data.note
			? sanitizeHtml(
					generateHTML(
						data.note || { type: "doc" },
						invoiceTemplateTipTapExtensions
					)
			  )
			: "Không có",
		"{{tien_kham}}": vndFormatter.format(data.examinationFee ?? 0),
		"{{tong_tien_dv}}": vndFormatter.format(data.serviceTotal ?? 0),
		"{{tong_tien_gg}}": vndFormatter.format(data.discountTotal ?? 0),
		"{{tong_hoa_don}}": vndFormatter.format(data.finalTotal ?? 0),
	};

	const arraySections: ArraySections = {
		dich_vu: {
			items: data.services ?? [],
			getParams: (item, index) => ({
				"{{stt}}": String(item.order ?? index + 1),
				"{{ten}}": escapeHtml(item.name),
				"{{mo_ta}}": escapeHtml(item.description || ""),
				"{{don_gia}}": vndFormatter.format(item.price ?? 0),
				"{{so_luong}}": String(item.quantity ?? 0),
				"{{thanh_tien}}": vndFormatter.format(item.sum ?? 0),
			}),
		},
		thuoc: {
			items: data.medicines ?? [],
			getParams: (item, index) => ({
				"{{stt}}": String(item.order ?? index + 1),
				"{{ten}}": escapeHtml(item.name),
				"{{mo_ta}}": escapeHtml(item.description || ""),
				"{{lieu_dung}}": escapeHtml(item.dosage || ""),
				"{{don_vi}}": escapeHtml(item.unit || ""),
				"{{so_luong}}": String(item.quantity ?? 0),
			}),
		},
		giam_gia: {
			items: data.discounts ?? [],
			getParams: (item, index) => ({
				"{{stt}}": String(item.order ?? index + 1),
				"{{gia_tri}}":
					item.type === "fix"
						? vndFormatter.format(item.value ?? 0)
						: String(item.value ?? 0),
				"{{don_vi}}": escapeHtml(item.unit || ""),
				"{{mo_ta}}": escapeHtml(item.description || ""),
				"{{thanh_tien}}": vndFormatter.format(item.sum ?? 0),
			}),
		},
	};

	return rawHtml.replace(
		/{{#([\w.]+)}}([\s\S]*?){{\/\1}}|{{([\w.]+)}}/g,
		(match, sectionKey, sectionContent, variableKey) => {
			if (sectionKey) {
				const section = arraySections[sectionKey as keyof ArraySections];
				if (!section?.items?.length) return "";

				return section.items
					.map((item, index) => {
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-expect-error
						const itemParams = section.getParams(item, index);
						return sectionContent.replace(
							/{{([\w.]+)}}/g,
							(m: string, k: string) => {
								const key = `{{${k}}}`;
								return itemParams[key] ?? m;
							}
						);
					})
					.join("");
			}

			if (variableKey) {
				const key = `{{${variableKey}}}`;
				return commonParams[key] ?? match;
			}

			return match;
		}
	);
}
