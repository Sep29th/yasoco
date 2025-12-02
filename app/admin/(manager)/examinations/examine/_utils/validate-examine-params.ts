import { ExamineParams } from "../_types/examine-params";
export function validateExamineParams(params: ExamineParams) {
	const { examinationId, returnTo, isReReceive } = params;
	const finalReturnTo =
		typeof returnTo === "string" && returnTo.trim() !== ""
			? returnTo
			: "/admin/examinations";
	return { examinationId, returnTo: finalReturnTo, isReReceive: isReReceive ? true : false };
}
