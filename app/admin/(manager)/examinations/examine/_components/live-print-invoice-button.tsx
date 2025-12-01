"use client";

import {useFormContext, useWatch} from "react-hook-form";
import {Examination} from "@/lib/generated/prisma";
import {FormValues} from "@/app/admin/(manager)/examinations/examine/_schemas/form-schema";
import {useMemo} from "react";
import PrintInvoiceModalButton from "@/app/admin/(manager)/examinations/_components/print-invoice-modal-button";
import {ExaminationDataNeededForInvoiceTemplateType} from "@/utils/types/examination-data-needed-for-invoice-template";

type PropsType = {
	initialFormValue: Partial<Examination>;
	fee: number;
	date: Date;
}

export default function LivePrintInvoiceButton({initialFormValue, fee, date}: PropsType) {
	const {control} = useFormContext<FormValues>();

	const formValues = useWatch({control});

	const examinationForPrint = useMemo(() => {
		return {
			...initialFormValue,
			...formValues,
			kidGender: formValues.kidGender === "male",
			examinationFee: fee,
			date,
		} as unknown as ExaminationDataNeededForInvoiceTemplateType;
	}, [initialFormValue, formValues, fee, date]);

	return <PrintInvoiceModalButton examination={examinationForPrint}/>;
};