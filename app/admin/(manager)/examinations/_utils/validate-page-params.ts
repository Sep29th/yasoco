import { PageParams } from "@/app/admin/(manager)/examinations/_types/page-params";
import { DateString } from "@/utils/types/date-string";
import { isValidDateString } from "@/app/admin/(manager)/examinations/_utils/is-valid-date-string";
import { getTodayDateString } from "@/app/admin/(manager)/examinations/_utils/get-today-date-string";
const PHONE_REGEX = /^0\d{9}$/;
const normalizePhone = (raw?: string): string => {
	const value = (raw || "").trim();
	return PHONE_REGEX.test(value) ? value : "";
};
export function validatePageParams(params: PageParams) {
	const mode: "all" | "day" =
		params.mode === "all" || params.mode === "day" ? params.mode : "day";
	const page: `${number}` =
		params.page && /^\d+$/.test(params.page) ? params.page : "1";
	let date: DateString;
	if (mode === "day") {
		if (params.date && isValidDateString(params.date)) {
			date = params.date;
		} else {
			date = getTodayDateString();
		}
	} else {
		date = getTodayDateString();
	}
	const phone = normalizePhone(params.phone);
	return { mode, page: parseInt(page), date, phone };
}
