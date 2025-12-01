const formatter = new Intl.DateTimeFormat("vi-VN", {
	timeZone: "Asia/Ho_Chi_Minh",
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
})

export function getDateVnTimezone(date: Date) {
	return formatter.format(date);
}