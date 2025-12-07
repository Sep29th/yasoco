import prisma from "@/lib/prisma";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

export const getPaginationServices = async (page: number, pageSize: number) => {
	const [total, services] = await Promise.all([
		prisma.service.count(),
		prisma.service.findMany({
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
	]);

	return { total, services };
};

export const getServiceById = async (id: string) => {
	const service = await prisma.service.findUnique({ where: { id } });

	if (!service) throw new Error("Dịch vụ không tồn tại");

	return service;
};

export const createService = async ({
	name,
	description,
	price,
}: {
	name: string;
	description?: string;
	price: number;
}) => {
	const trimmedName = name.trim();
	const trimmedDescription = (description || "").trim() || null;

	if (!trimmedName) throw new Error("Tên dịch vụ là bắt buộc");
	if (!Number.isFinite(price) || price < 0)
		throw new Error("Giá dịch vụ không hợp lệ");

	const existed = await prisma.service.findFirst({
		where: {
			name: trimmedName,
		},
		select: { id: true },
	});

	if (existed) throw new Error("Dịch vụ này đã có rồi");

	const service = await prisma.service.create({
		data: {
			name: trimmedName,
			description: trimmedDescription,
			price,
		},
	});
	revalidateTag("services-all", { expire: 0 });
	return service;
};

export const updateService = async ({
	id,
	name,
	description,
	price,
}: {
	id: string;
	name: string;
	description?: string;
	price: number;
}) => {
	const trimmedName = name.trim();
	const trimmedDescription = (description || "").trim() || null;

	if (!trimmedName) throw new Error("Tên dịch vụ là bắt buộc");
	if (!Number.isFinite(price) || price < 0)
		throw new Error("Giá dịch vụ không hợp lệ");

	const existed = await prisma.service.findUnique({
		where: { id },
		select: { id: true },
	});

	if (!existed) throw new Error("Dịch vụ không tồn tại");

	const service = await prisma.service.update({
		where: { id },
		data: {
			name: trimmedName,
			description: trimmedDescription,
			price,
		},
	});
	revalidateTag("services-all", { expire: 0 });

	return service;
};

export const deleteService = async (id: string) => {
	const result = await prisma.service.deleteMany({ where: { id } });
	revalidateTag("services-all", { expire: 0 });

	return result.count;
};

export const getAllServices = async () => {
	"use cache";
	cacheTag("services-all");
	cacheLife("max");
	console.log("getAllServices")
	const services = await prisma.service.findMany({
		orderBy: { name: "asc" },
		select: {
			id: true,
			name: true,
			price: true,
			description: true,
		},
	});

	return services;
};
