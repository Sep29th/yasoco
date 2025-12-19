"use server";

import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export const deleteInvoiceTemplate = async (formData: FormData) => {
	const auth = await requireAuth();

	if (!auth.permissions.includes("invoice-template:delete")) {
		throw new Error("Không có quyền xóa mẫu đơn");
	}
	const id = String(formData.get("id") ?? "").trim();
	const page = String(formData.get("page") ?? "").trim();
	try {
		const result = (await prisma.invoiceTemplate.deleteMany({ where: { id } }))
			.count;
		if (result > 0) {
			revalidateTag("invoice-template-all", { expire: 0 });
		}

		redirect(`/admin/invoice-templates?page=${page}`);
	} catch (error) {
		const isNextRedirectError =
			typeof error === "object" &&
			error !== null &&
			"digest" in error &&
			(error as { digest?: string }).digest?.includes("NEXT_REDIRECT");

		if (isNextRedirectError) {
			throw error;
		}

		console.error("[deleteInvoiceTemplateAction] Failed to delete invoice template", error);
		const message =
			error instanceof Error ? error.message : "Không thể xóa thuốc";
		redirect(
			((error?: string) => {
				const params = new URLSearchParams();
				if (page) params.set("page", page);
				if (error) params.set("error", error);

				const query = params.toString();
				return `/admin/invoice-template${query ? `?${query}` : ""}`;
			})(message)
		);
	}
};
