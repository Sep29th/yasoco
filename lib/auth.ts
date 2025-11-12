import { cookies, headers } from "next/headers";
import {
  AccessTokenPayload,
  generateTokenPair,
  RefreshTokenPayload,
  verifyAccessToken,
  verifyRefreshToken,
} from "./jwt";
import prisma from "./prisma";
import { cache } from "react";
import { redirect } from "next/navigation";

export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!accessToken || !refreshToken) {
    return null;
  }

  let payload: AccessTokenPayload | RefreshTokenPayload | null =
    verifyAccessToken(accessToken);

  if (payload) {
    return payload as AccessTokenPayload;
  }

  payload = verifyRefreshToken(refreshToken);

  if (!payload || !payload.jti) {
    return null;
  }

  const isValid = await prisma.$transaction(async (tx) => {
    const session = await tx.session.delete({
      where: { id: payload.jti },
      select: { id: true },
    });
    if (!session) return null;

    const isActive = await tx.user.findUnique({
      where: { id: payload.userId },
      select: { isActive: true, isDeleted: true },
    });

    if (!isActive || !isActive.isActive || isActive.isDeleted) return null;

    const newSession = await tx.session.create({
      data: {
        userId: payload.userId,
        agent: (await headers()).get("user-agent") || "unknown",
      },
      select: { id: true },
    });

    const permissions = await tx.user.allPermissions(payload.userId);

    const tokenPair = await generateTokenPair(
      payload.userId,
      newSession.id,
      permissions
    );

    return { tokenPair, payload: { userId: payload.userId, permissions } };
  });

  if (!isValid) return null;

  cookieStore.set("accessToken", isValid.tokenPair.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15,
  });

  cookieStore.set("refreshToken", isValid.tokenPair.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return isValid.payload;
});

export const requireAuth = cache(async (returnTo?: string) => {
  const auth = await verifySession();

  if (!auth)
    redirect(`/admin/sign-in${returnTo ? `?returnTo=${returnTo}` : ""}`);

  return auth;
});

export const getCurrentUser = cache(async () => {
  const accessTokenPayload = await requireAuth();
  return prisma.user.findUnique({ where: { id: accessTokenPayload.userId } });
});
