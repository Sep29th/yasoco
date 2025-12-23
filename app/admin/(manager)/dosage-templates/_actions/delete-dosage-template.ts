"use server";

import {requireAuth} from "@/lib/auth";
import {redirect} from "next/navigation";
import {deleteDosageTemplate} from "@/lib/dosage-template";

export default async function deleteDosageTemplateAction(formData: FormData) {
	const auth = await requireAuth();

	if (!auth.permissions.includes("medicine:update")) {
		redirect("/admin/forbidden");
	}

	const id = String(formData.get("id") ?? "").trim();
	const page = String(formData.get("page") ?? "").trim();

	const buildRedirectUrl = (error?: string) => {
		const params = new URLSearchParams();
		if (page) params.set("page", page);
		if (error) params.set("error", error);

		const query = params.toString();
		return `/admin/dosage-templates${query ? `?${query}` : ""}`;
	};

	if (!id) {
		redirect(buildRedirectUrl("Thiếu mã mẫu tắt để xóa"));
	}

	try {
		await deleteDosageTemplate(id);
		redirect(buildRedirectUrl());
	} catch (error) {
		const isNextRedirectError =
			typeof error === "object" &&
			error !== null &&
			"digest" in error &&
			(error as { digest?: string }).digest?.includes("NEXT_REDIRECT");

		if (isNextRedirectError) {
			throw error;
		}

		console.error("[deleteDosageTemplateAction] Failed to delete dosage template", error);
		const message =
			error instanceof Error ? error.message : "Không thể xóa mẫu tắt";
		redirect(buildRedirectUrl(message));
	}
}