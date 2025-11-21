import {PageParams} from "@/app/admin/(manager)/examinations/_types/page-params";
import {DateString} from "@/utils/types/date-string";
import {isValidDateString} from "@/app/admin/(manager)/examinations/_utils/is-valid-date-string";
import {getTodayDateString} from "@/app/admin/(manager)/examinations/_utils/get-today-date-string";

export function validateParams(params: PageParams) {
	const mode: "all" | "day" = params.mode === "all" || params.mode === "day" ? params.mode : "day";
	const page: `${number}` = params.page && /^\d+$/.test(params.page) ? params.page : "1";
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

	return {mode, page: parseInt(page), date};
}