"use server";

import { getCurrentUser, requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
// import { revalidateTag } from "next/cache";

export const createArticle = async (title: string) => {
	const auth = await requireAuth();

	if (!auth.permissions.includes("article:create")) {
		throw new Error("Không có quyền tạo bài viết");
	}
	const currentUser = await getCurrentUser();
	try {
		const result = await prisma.$transaction(async (tx) => {
			const existed = await tx.article.findFirst({
				where: { title },
				select: { id: true },
			});

			if (existed) throw new Error("Tên đã tồn tại");
			// revalidateTag("invoice-template-all", { expire: 0 });
			return await tx.article.create({
				data: { title, content: { type: "doc" }, authorId: currentUser.id },
				select: { id: true },
			});
		});

		return { success: true, message: result.id };
	} catch (e: unknown) {
		if (e instanceof Error) {
			return { success: false, message: e.message };
		} else {
			return { success: false, message: "Lỗi không xác định" };
		}
	}
};
