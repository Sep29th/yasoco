import { DateString } from "@/utils/types/date-string";
export type PageParams = {
	mode?: "all" | "day";
	page?: `${number}`;
	date?: DateString;
	phone?: string;
};
