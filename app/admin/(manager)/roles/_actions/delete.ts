"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function deleteRoleAction(formData: FormData) {
  await requireAuth();

  const id = formData.get("id");

  if (typeof id !== "string") return;

  await prisma.role.delete({ where: { id } });

  // After deleting, navigate back to roles list
  redirect("/admin/roles");
}
