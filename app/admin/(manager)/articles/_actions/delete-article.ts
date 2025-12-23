"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function deleteArticleAction(formData: FormData) {
	const id = formData.get("id")?.toString().trim();
	const page = formData.get("page")?.toString() ?? "1";
	const showInMainPage = formData.get("showInMainPage")?.toString();
	const search = formData.get("search")?.toString();

	const params = new URLSearchParams({ page });
	if (showInMainPage) params.set("showInMainPage", showInMainPage);
	if (search) params.set("search", search);

	const baseUrl = `/admin/articles?${params.toString()}`;

	if (!id) {
		redirect(`${baseUrl}&error=${encodeURIComponent("Thiếu id bài viết")}`);
	}

	try {
		await prisma.article.delete({
			where: { id },
		});

		redirect(baseUrl);
	} catch (error: unknown) {
		const isNextRedirectError =
			typeof error === "object" &&
			error !== null &&
			"digest" in error &&
			(error as { digest?: string }).digest?.includes("NEXT_REDIRECT");

		if (isNextRedirectError) {
			throw error;
		}

		console.error("[deleteArticleAction] Failed to delete article", error);
		const message =
			error instanceof Error ? error.message : "Không thể xóa thuốc";

		redirect(`${baseUrl}&error=${encodeURIComponent(message)}`);
	}
}
