import { ExaminationDataNeededForInvoiceTemplateType } from "@/utils/types/examination-data-needed-for-invoice-template";
import { InvoiceTemplateDataType } from "@/utils/types/invoice-template-data";
import { getDateVnTimezone } from "@/utils/get-date-vn-timezone";
import { getTimeVnTimezone } from "@/utils/get-time-vn-timezone";
import {getAgeDisplay} from "@/utils/get-age-display";

export const examinationDataToInvoiceTemplateData = (
	examination: ExaminationDataNeededForInvoiceTemplateType
): InvoiceTemplateDataType => {
	const kidAge = getAgeDisplay(examination.kidBirthDate);

	let serviceTotal = 0;

	const services = examination.services.map((service, indx) => {
		const sum = service.price * service.quantity;
		serviceTotal += sum;
		return {
			...service,
			order: indx + 1,
			sum,
		};
	});

	const medicines = examination.medicines.map((medicine, indx) => ({
		...medicine,
		order: indx + 1,
	}));

	const subTotal = serviceTotal + (examination.examinationFee ?? 0);

	let discountTotal = 0;
	const discounts = examination.discounts.map((discount, indx) => {
		const sum =
			discount.type === "fix"
				? discount.value
				: Math.round((subTotal * (discount.value / 100)) / 1000) * 1000;
		discountTotal += sum;
		return {
			...discount,
			order: indx + 1,
			unit: discount.type === "fix" ? ("đ" as const) : ("%" as const),
			sum,
		};
	});

	const finalTotal = subTotal - discountTotal;

	return {
		...examination,
		kidAge,
		serviceTotal,
		discountTotal,
		finalTotal,
		services,
		medicines,
		discounts,
		examineDate: getDateVnTimezone(new Date(examination.date)),
		examineTime: getTimeVnTimezone(new Date(examination.date)),
	};
};
