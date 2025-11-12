"use server";

import { redirect } from "next/navigation";
import { SignInState } from "./_types/form-messages";
import { SignInSchema } from "./schema";
import prisma from "@/lib/prisma";
import { cookies, headers } from "next/headers";
import { generateTokenPair } from "@/lib/jwt";
import bcrypt from "bcrypt";

async function authenticateUser(
  phone: string,
  password: string,
  returnTo: string | null
): Promise<SignInState> {
  const signInResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { phone } });

    if (!user || !user.isActive || user.isDeleted)
      return "Tài khoản không tồn tại hoặc đã bị dừng hoạt động";

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) return "Sai mật khẩu";

    const newSession = await tx.session.create({
      data: {
        userId: user.id,
        agent: (await headers()).get("user-agent") || "unknown",
      },
      select: { id: true },
    });

    const permissions = await tx.user.allPermissions(user.id);

    return { user, newSession, permissions };
  });

  if (typeof signInResult == "string")
    return { password: { errors: [signInResult] } };

  const tokenPair = await generateTokenPair(
    signInResult.user.id,
    signInResult.newSession.id,
    signInResult.permissions
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

  redirect(returnTo ?? "/admin");
}

export async function signInAction(
  data: SignInSchema,
  returnTo: string | null
): Promise<SignInState> {
  try {
    return authenticateUser(data.phone, data.password, returnTo);
  } catch (error) {
    console.error(error);
    return {
      password: {
        errors: ["Đã xảy ra lỗi không mong muốn. Vui lòng thử lại"],
      },
    };
  }
}
