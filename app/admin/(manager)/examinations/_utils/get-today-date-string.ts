import { DateString } from "@/utils/types/date-string";
export function getTodayDateString(): DateString {
	const timeZone = "Asia/Ho_Chi_Minh";
	const vnDate = new Intl.DateTimeFormat("sv-SE", {
		timeZone: timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
	return vnDate as DateString;
}
