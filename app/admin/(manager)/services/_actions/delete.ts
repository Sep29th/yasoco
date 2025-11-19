"use server";

import { deleteService } from "@/lib/service";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function deleteServiceAction(formData: FormData) {
  const auth = await requireAuth();

  if (!auth.permissions.includes("service:delete")) {
    redirect("/admin/forbidden");
  }

  const id = String(formData.get("id") ?? "").trim();
  const page = String(formData.get("page") ?? "").trim();

  const buildRedirectUrl = (error?: string) => {
    const params = new URLSearchParams();
    if (page) params.set("page", page);
    if (error) params.set("error", error);

    const query = params.toString();
    return `/admin/services${query ? `?${query}` : ""}`;
  };

  if (!id) {
    redirect(buildRedirectUrl("Thiếu mã dịch vụ để xóa"));
  }

  try {
    const deletedCount = await deleteService(id);

    if (deletedCount === 0) {
      redirect(buildRedirectUrl("Dịch vụ không tồn tại hoặc đã bị xóa"));
    }

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

    console.error("[deleteServiceAction] Failed to delete service", error);
    const message =
      error instanceof Error ? error.message : "Không thể xóa dịch vụ";
    redirect(buildRedirectUrl(message));
  }
}
