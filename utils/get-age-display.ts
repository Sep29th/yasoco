import {
	differenceInYears,
	differenceInMonths,
	differenceInDays,
	addMonths
} from "date-fns";

export const getAgeDisplay = (birthDate: Date | undefined) => {
	if (!birthDate) return "";

	const now = new Date();
	if (birthDate > now) return "chưa sinh"; // Xử lý trường hợp chọn ngày tương lai (nếu có)

	const months = differenceInMonths(now, birthDate);
	const daysTotal = differenceInDays(now, birthDate);

	// 1. Trên 36 tháng: Hiện tuổi
	if (months > 36) {
		const years = differenceInYears(now, birthDate);
		return `${years} tuổi`;
	}

	// 2. Từ 3 đến 36 tháng: Hiện tháng
	if (months >= 3) {
		return `${months} tháng`;
	}

	// 3. Ít hơn 3 tháng (nhưng >= 1 tháng): Hiện tháng và ngày
	if (months >= 1) {
		const dateAtMonthAnniversary = addMonths(birthDate, months);
		const daysRest = differenceInDays(now, dateAtMonthAnniversary);
		return `${months} tháng ${daysRest} ngày`;
	}

	if (daysTotal == 0) return "hôm nay";
	// 4. Ít hơn 1 tháng: Chỉ hiện ngày
	return `${daysTotal} ngày`;
};