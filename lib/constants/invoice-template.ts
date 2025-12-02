import { ExaminationDataNeededForInvoiceTemplateType } from "@/utils/types/examination-data-needed-for-invoice-template";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { Gapcursor } from "@tiptap/extensions";
import { ImageResize } from "tiptap-extension-resize-image";
import { TableKit } from "@tiptap/extension-table";
import Heading from "@tiptap/extension-heading";
import { Geist } from "next/font/google";

const geistSans = Geist({
	subsets: ["latin"],
	display: "swap",
});

export const invoiceTemplateCommonArgument = {
	["{{ma_kham}}"]: "Mã khám",
	["{{ten_phu_huynh}}"]: "Tên phụ huynh",
	["{{sdt_phu_huynh}}"]: "SĐT phụ huynh",
	["{{ten_be}}"]: "Tên bé",
	["{{ngay_sinh_be}}"]: "Ngày sinh bé",
	["{{gioi_tinh_be}}"]: "Giới tính bé",
	["{{can_nang_be}}"]: "Cân nặng bé",
	["{{ngay_kham}}"]: "Ngày khám",
	["{{gio_kham}}"]: "Giờ khám",
	["{{trieu_chung}}"]: "Triệu chứng",
	["{{chan_doan}}"]: "Chẩn đoán",
	["{{ghi_chu}}"]: "Ghi chú",
	["{{tien_kham}}"]: "Tiền khám",
	["{{tong_tien_dv}}"]: "Tổng tiền dịch vụ",
	["{{tong_tien_t}}"]: "Tổng tiền thuốc",
	["{{tong_tien_gg}}"]: "Tổng tiền giảm",
	["{{tong_hoa_don}}"]: "Tổng tiền hóa đơn",
};

export const invoiceTemplateServiceArgument = {
	["{{#dich_vu}}"]: "Mở liệt kê dịch vụ",
	["{{stt}}"]: "Số thứ tự",
	["{{ten}}"]: "Tên",
	["{{mo_ta}}"]: "Mô tả",
	["{{don_gia}}"]: "Đơn giá",
	["{{so_luong}}"]: "Số lượng",
	["{{thanh_tien}}"]: "Thành tiền",
	["{{/dich_vu}}"]: "Đóng liệt kê dịch vụ",
};

export const invoiceTemplateMedicineArgument = {
	["{{#thuoc}}"]: "Mở liệt kê thuốc",
	["{{stt}}"]: "Số thứ tự",
	["{{ten}}"]: "Tên",
	["{{mo_ta}}"]: "Mô tả",
	["{{don_vi}}"]: "Đơn vị",
	["{{don_gia}}"]: "Đơn giá",
	["{{lieu_dung}}"]: "Liều dùng",
	["{{so_luong}}"]: "Số lượng",
	["{{thanh_tien}}"]: "Thành tiền",
	["{{/thuoc}}"]: "Đóng liệt kê thuốc",
};

export const invoiceTemplateDiscountArgument = {
	["{{#giam_gia}}"]: "Mở liệt kê giảm giá",
	["{{stt}}"]: "Số thứ tự",
	["{{gia_tri}}"]: "Giá trị",
	["{{don_vi}}"]: "Đơn vị",
	["{{mo_ta}}"]: "Mô tả",
	["{{thanh_tien}}"]: "Thành tiền",
	["{{/giam_gia}}"]: "Đóng liệt kê giảm giá",
};

export const invoiceTemplate: [string, [string, string][]][] = [
	["Thông tin chung", Object.entries(invoiceTemplateCommonArgument)],
	["Dịch vụ", Object.entries(invoiceTemplateServiceArgument)],
	["Thuốc", Object.entries(invoiceTemplateMedicineArgument)],
	["Giảm giá", Object.entries(invoiceTemplateDiscountArgument)],
];

export const exampleInvoiceTemplateData: ExaminationDataNeededForInvoiceTemplateType =
	{
		id: "6facf040-a1bc-4aad-8db7-c331309b5f67",
		parentName: "Tên phụ huynh",
		parentPhone: "0xxxxxxxxx",
		kidName: "Tên bé",
		kidBirthDate: new Date(),
		kidGender: true,
		kidWeight: 50,
		medicalHistory: { type: "doc" },
		symptoms: { type: "doc" },
		diagnose: { type: "doc" },
		note: {
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [{ text: "Không sao cả", type: "text" }],
				},
			],
		},
		services: [
			{
				id: "6facf040-a1bc-4aad-8db7-c331309b5f66",
				name: "Dịch vụ 1",
				price: 20000,
				quantity: 2,
			},
			{
				id: "6facf040-a1bc-4aad-8db7-c331309b5f67",
				name: "Dịch vụ 2",
				price: 30000,
				quantity: 4,
				description: "Mô tả dịch vụ 2",
			},
		],
		medicines: [
			{
				id: "6facf040-a1bc-4aad-8db7-c331309b5f68",
				name: "Thuốc 1",
				price: 40000,
				quantity: 5,
				unit: "Hộp",
				description: "Mô tả thuốc 1",
				dosage: "Liều dùng thuốc 1",
			},
			{
				id: "6facf040-a1bc-4aad-8db7-c331309b5f68",
				name: "Thuốc 2",
				price: 50000,
				quantity: 5,
				unit: "Lọ",
				dosage: "Liều dùng thuốc 2",
			},
		],
		date: new Date(),
		examinationFee: 20000,
		discounts: [
			{
				type: "fix",
				value: 50000,
				description: "Giảm số tiền cố định",
			},
			{
				type: "percent",
				value: 10,
				description: "Giảm theo phần trăm",
			},
		],
	};

export const invoiceTemplateTipTapExtensions = [
	Document,
	Paragraph,
	Text,
	Gapcursor,
	StarterKit,
	TextAlign.configure({
		types: ["heading", "paragraph", "image"],
	}),
	ImageResize.configure({
		allowBase64: true,
		HTMLAttributes: {
			style: "display: block; margin-left: auto; margin-right: auto;",
		},
	}),
	TableKit.configure({ table: { resizable: true } }),
	Heading.configure({
		levels: [1, 2, 3, 4, 5, 6],
	}),
];

export const pageStyle = `
			@page { 
				size: A5 portrait;
				margin: 0;
			}
			
			@media print {
				body { 
					print-color-adjust: exact;
					-webkit-print-color-adjust: exact;
				}
			}
			
			* {
				font-family: ${geistSans.style.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
			}
			
			img {
				display: inline-block;
				vertical-align: middle;
				max-width: 100%;
			}
			
			body {
				text-align: left;
				min-height: 100%;
			}
			
			p {
				margin: 0;
				line-height: 1.2;
				white-space: pre-wrap;
			}
			
			p[style*="text-align: center"],
			div[style*="text-align: center"] {
				text-align: center;
			}
			
			p[style*="text-align: right"],
			div[style*="text-align: right"] {
				text-align: right;
			}
			
			p[style*="text-align: justify"],
			div[style*="text-align: justify"] {
				text-align: justify;
			}
			
			h1, h2, h3, h4, h5, h6 {
				font-weight: normal;
				margin: 0;
				line-height: 1.2;
			}
			
			table {
				width: 100%;
				border-collapse: collapse;
			}
			
			table td {
				padding: 0;
				vertical-align: top;
				border: none !important;
			}
			
			ul, ol {
				padding-left: 1.5rem;
				margin: 0.5rem 0;
			}
			
			ul {
				list-style-type: disc;
			}
			
			ol {
				list-style-type: decimal;
			}
			
			li {
				margin: 0.25rem 0;
				display: list-item;
			}
			
			ul[data-type="taskList"] {
				list-style: none;
				padding: 0;
			}
			
			ul[data-type="taskList"] li {
				display: flex;
				align-items: flex-start;
			}
			
			ul[data-type="taskList"] li > label {
				flex: 0 0 auto;
				margin-right: 0.5rem;
				user-select: none;
			}
			
			ul[data-type="taskList"] li > div {
				flex: 1 1 auto;
			}
		`;
