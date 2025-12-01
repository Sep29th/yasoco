import {ExaminationDataNeededForInvoiceTemplateType} from "@/utils/types/examination-data-needed-for-invoice-template";

export type InvoiceTemplateDataType = ExaminationDataNeededForInvoiceTemplateType & {
	serviceTotal: number;
	medicineTotal: number;
	discountTotal: number;
	finalTotal: number;
	examineDate: string;
	examineTime: string;
	services: (PrismaJson.ServiceSnapshotType[0] & { order: number; sum: number })[];
	medicines: (PrismaJson.MedicineSnapshotType[0] & { order: number; sum: number })[];
	discounts: (PrismaJson.DiscountSnapshotType[0] & { order: number; sum: number; unit: "đ" | "%" })[];
}