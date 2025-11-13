import { cookies, headers } from "next/headers";
import {
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
} from "./jwt";
import prisma from "./prisma";
import { cache } from "react";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";

export const getAuthPayload = cache(async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    console.error("Không tìm thấy AccessToken dù đã qua middleware");
    return null;
  }

  const payload = verifyAccessToken(accessToken);

  if (!payload) {
    console.error("AccessToken không hợp lệ dù đã qua middleware");
    return null;
  }

  return payload;
});

export const requireAuth = cache(async () => {
  const accessTokenPayload = await getAuthPayload();

  if (!accessTokenPayload) {
    redirect("/admin/sign-in?error=session");
  }

  return accessTokenPayload;
});

export const getCurrentUser = cache(async () => {
  const accessTokenPayload = await requireAuth();

  return prisma.user.findUnique({
    where: { id: accessTokenPayload.userId },
  });
});

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    if (payload && payload.jti) {
      await prisma.session.deleteMany({ where: { id: payload.jti } });
    }
  }
}

export async function signIn(phone: string, password: string) {
  const signInResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { phone },
      select: { id: true, isActive: true, isDeleted: true, password: true },
    });

    if (!user || !user.isActive || user.isDeleted)
      return "Tài khoản không tồn tại hoặc đã bị dừng hoạt động";

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) return "Sai mật khẩu";

    const newSession = await tx.session.create({
      data: {
        userId: user.id,
        agent: (await headers()).get("user-agent") || "unknown",
        expireAt: new Date(new Date().getTime() + 60 * 60 * 24 * 7 * 1000),
      },
      select: { id: true },
    });

    const permissions = await tx.user.allPermissions(user.id);

    return { user, newSession, permissions };
  });

  if (typeof signInResult == "string")
    return {
      password: { errors: [signInResult] },
      values: {
        phone,
        password,
      },
    };

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

  return true;
}

export async function refreshSession(
  refreshToken: string,
  agent: string | null
) {
  const payload = verifyRefreshToken(refreshToken);

  if (!payload || !payload.jti) {
    return null;
  }

  const isValid = await prisma.$transaction(async (tx) => {
    const session = await tx.session.deleteMany({
      where: { id: payload.jti },
    });
    if (session.count === 0) return null;

    const user = await tx.user.findUnique({
      where: { id: payload.userId },
      select: { isActive: true, isDeleted: true },
    });

    if (!user || !user.isActive || user.isDeleted) return null;

    const newSession = await tx.session.create({
      data: {
        userId: payload.userId,
        agent: agent || "unknown",
        expireAt: new Date(new Date().getTime() + 60 * 60 * 24 * 7 * 1000),
      },
      select: { id: true },
    });

    const permissions = await tx.user.allPermissions(payload.userId);

    return { newSessionId: newSession.id, permissions };
  });

  if (!isValid) return null;

  const tokenPair = await generateTokenPair(
    payload.userId,
    isValid.newSessionId,
    isValid.permissions
  );

  return {
    tokenPair,
    payload: { userId: payload.userId, permissions: isValid.permissions },
  };
}
