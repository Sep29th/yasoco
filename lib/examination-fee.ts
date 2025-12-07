import prisma from "@/lib/prisma";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

export const getExaminationFee = async () => {
	"use cache";
	cacheTag("examination-fee");
	cacheLife("max");
	const fee = await prisma.examinationFee.findFirst({
		select: { id: true, value: true },
	});

	return fee;
};

export const upsertExaminationFee = async (value: number) => {
	if (!Number.isInteger(value) || value < 0) {
		throw new Error("Giá khám không hợp lệ");
	}

	revalidateTag("examination-fee", { expire: 0 });

	const existed = await prisma.examinationFee.findFirst({
		select: { id: true },
	});

	if (existed) {
		return prisma.examinationFee.update({
			where: { id: existed.id },
			data: { value },
		});
	}

	return prisma.examinationFee.create({
		data: { value },
	});
};
