export const formatDate = (date: Date | string | null | undefined): string => {
	if (!date) return "";
	const dateObj = typeof date === "string" ? new Date(date) : date;
	return new Intl.DateTimeFormat("vi-VN", {
		timeZone: process.env.TZ,
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(dateObj);
};
