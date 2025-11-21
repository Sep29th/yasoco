import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { getMidnightRevalidateSeconds } from "./utils";
import { DateString } from "@/utils/types/date-string";

async function _getTodayAppointmentCount() {
	const today = new Date();
	const startOfDay = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
		0,
		0,
		0
	);
	const endOfDay = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
		23,
		59,
		59
	);

	const count = await prisma.examination.count({
		where: { date: { gte: startOfDay, lt: endOfDay } },
	});

	return count;
}

export const getTodayAppointmentCount = unstable_cache(
	_getTodayAppointmentCount,
	["examination", "today"],
	{
		revalidate: getMidnightRevalidateSeconds(),
		tags: ["examination", "today"],
	}
);

export const getPaginationExamination = async (
	page: number,
	pageSize: number,
	data:
		| { mode: "all" }
		| {
				mode: "day";
				date: DateString;
		  }
) => {
	const where =
		data.mode === "day"
			? {
					date: {
						gte: new Date(data.date),
						lt: new Date(
							new Date(data.date).setDate(new Date(data.date).getDate() + 1)
						),
					},
			  }
			: undefined;

	const [total, examinations] = await Promise.all([
		prisma.examination.count({ where }),
		prisma.examination.findMany({
			where,
			orderBy: { date: data.mode === "all" ? "desc" : "asc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
			select: {
				id: true,
				parentName: true,
				parentPhone: true,
				kidName: true,
				kidBirthDate: true,
				kidGender: true,
				date: true,
				status: true,
				type: true,
			},
		}),
	]);

	return { total, examinations };
};
