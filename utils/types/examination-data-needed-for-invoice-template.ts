import {Examination} from "@/lib/generated/prisma";

export type ExaminationDataNeededForInvoiceTemplateType = Omit<Examination, "status" | "type" | "createdAt" | "updatedAt" | "receivedBy" | "examinedBy" | "paidBy" | "cancelledBy" | "bookedBy">
