"use server";

import { requireAuth } from "@/lib/auth";
import { deleteUser } from "@/lib/user";
import { redirect } from "next/navigation";

export async function deleteUserAction(formData: FormData) {
  const auth = await requireAuth();

  if (!auth.permissions.includes("user:delete")) {
    redirect("/admin/forbidden");
  }

  const id = String(formData.get("id") ?? "").trim();
  const page = String(formData.get("page") ?? "").trim();

  const buildRedirectUrl = (error?: string) => {
    const params = new URLSearchParams();
    if (page) params.set("page", page);
    if (error) params.set("error", error);

    const query = params.toString();
    return `/admin/users${query ? `?${query}` : ""}`;
  };

  if (!id) {
    redirect(buildRedirectUrl("Thiếu mã người dùng để xóa"));
  }

  try {
    const count = await deleteUser(id);

    if (count === 0) {
      redirect(buildRedirectUrl("Người dùng không tồn tại hoặc đã bị xóa"));
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

    console.error("[deleteUserAction] Failed to delete user", error);
    const message =
      error instanceof Error ? error.message : "Không thể xóa người dùng";
    redirect(buildRedirectUrl(message));
  }
}

