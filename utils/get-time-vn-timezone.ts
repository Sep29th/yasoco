const formatter = new Intl.DateTimeFormat("vi-VN", {
	timeZone: "Asia/Ho_Chi_Minh",
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
})

export function getTimeVnTimezone(date: Date) {
	return formatter.format(date);
}