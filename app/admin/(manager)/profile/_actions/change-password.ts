"use server";

import { cookies, headers } from "next/headers";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { generateTokenPair } from "@/lib/jwt";

export async function changePasswordAction(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const auth = await requireAuth();

  const currentPassword = String(payload?.currentPassword ?? "").trim();
  const newPassword = String(payload?.newPassword ?? "").trim();
  const confirmPassword = String(payload?.confirmPassword ?? "").trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error("Vui lòng nhập đầy đủ thông tin");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Mật khẩu mới và xác nhận mật khẩu không khớp");
  }

  if (newPassword.length < 6) {
    throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { password: true },
  });

  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new Error("Mật khẩu hiện tại không đúng");
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: auth.userId },
    data: { password: hashed },
  });

  // Xóa toàn bộ session cũ của user và tạo session mới cho phiên hiện tại
  const agent = (await headers()).get("user-agent") || "unknown";

  const result = await prisma.$transaction(async (tx) => {
    await tx.session.deleteMany({ where: { userId: auth.userId } });

    const newSession = await tx.session.create({
      data: {
        userId: auth.userId,
        agent,
        expireAt: new Date(new Date().getTime() + 60 * 60 * 24 * 7 * 1000),
      },
      select: { id: true },
    });

    const permissions = await tx.user.allPermissions(auth.userId);

    return { newSessionId: newSession.id, permissions };
  });

  const tokenPair = await generateTokenPair(
    auth.userId,
    result.newSessionId,
    result.permissions
  );

  const cookieStore = await cookies();

  cookieStore.set("accessToken", tokenPair.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15,
  });

  cookieStore.set("refreshToken", tokenPair.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { ok: true };
}
