import prisma from "@/lib/prisma";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

export const getPaginationMedicines = async (
	page: number,
	pageSize: number
) => {
	const [total, medicines] = await Promise.all([
		prisma.medicine.count(),
		prisma.medicine.findMany({
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
	]);

	return { total, medicines };
};

export const getMedicineById = async (id: string) => {
	const medicine = await prisma.medicine.findUnique({ where: { id } });

	if (!medicine) throw new Error("Thuốc không tồn tại");

	return medicine;
};

export const createMedicine = async ({
	name,
	description,
	unit,
	originalPrice,
	price,
}: {
	name: string;
	description?: string;
	unit: string;
	originalPrice: number;
	price: number;
}) => {
	const trimmedName = name.trim();
	const trimmedUnit = unit.trim();
	const trimmedDescription = (description || "").trim() || null;

	if (!trimmedName) throw new Error("Tên thuốc là bắt buộc");
	if (!trimmedUnit) throw new Error("Đơn vị là bắt buộc");
	if (!Number.isFinite(originalPrice) || originalPrice < 0)
		throw new Error("Giá gốc thuốc không hợp lệ");
	if (!Number.isFinite(price) || price < 0)
		throw new Error("Giá thuốc không hợp lệ");

	const existed = await prisma.medicine.findFirst({
		where: {
			name: trimmedName,
		},
		select: { id: true },
	});

	if (existed) throw new Error("Thuốc này đã có rồi");

	const medicine = await prisma.medicine.create({
		data: {
			name: trimmedName,
			unit: trimmedUnit,
			description: trimmedDescription,
			originalPrice,
			price,
		},
	});
	revalidateTag("medicines-all", { expire: 0 });

	return medicine;
};

export const updateMedicine = async ({
	id,
	name,
	description,
	unit,
	originalPrice,
	price,
}: {
	id: string;
	name: string;
	description?: string;
	unit: string;
	originalPrice: number;
	price: number;
}) => {
	const trimmedName = name.trim();
	const trimmedUnit = unit.trim();
	const trimmedDescription = (description || "").trim() || null;

	if (!trimmedName) throw new Error("Tên thuốc là bắt buộc");
	if (!trimmedUnit) throw new Error("Đơn vị là bắt buộc");
	if (!Number.isFinite(originalPrice) || originalPrice < 0)
		throw new Error("Giá gốc thuốc không hợp lệ");
	if (!Number.isFinite(price) || price < 0)
		throw new Error("Giá thuốc không hợp lệ");

	const existed = await prisma.medicine.findUnique({
		where: { id },
		select: { id: true },
	});

	if (!existed) throw new Error("Thuốc không tồn tại");

	const medicine = await prisma.medicine.update({
		where: { id },
		data: {
			name: trimmedName,
			unit: trimmedUnit,
			description: trimmedDescription,
			originalPrice,
			price,
		},
	});
	revalidateTag("medicines-all", { expire: 0 });

	return medicine;
};

export const deleteMedicine = async (id: string) => {
	const result = await prisma.medicine.deleteMany({ where: { id } });
	revalidateTag("medicines-all", { expire: 0 });

	return result.count;
};

export const getAllMedicines = async () => {
	"use cache";
	cacheTag("medicines-all");
	cacheLife("max");
	const medicines = await prisma.medicine.findMany({
		orderBy: { name: "asc" },
		select: {
			id: true,
			name: true,
			unit: true,
			price: true,
			description: true,
			originalPrice: true,
		},
	});

	return medicines;
};
