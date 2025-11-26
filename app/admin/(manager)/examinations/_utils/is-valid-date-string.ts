import { DateString } from "@/utils/types/date-string";
export function isValidDateString(value: string): value is DateString {
	return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
