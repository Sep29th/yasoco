import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  AccessTokenPayload,
} from "./lib/jwt";
import prisma from "./lib/prisma";

async function refreshSession(refreshToken: string, request: NextRequest) {
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
        agent: request.headers.get("user-agent") || "unknown",
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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const publicAdminRoutes = ["/admin/sign-in"];

    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    let sessionPayload: AccessTokenPayload | null = null;
    let newTokens: { accessToken: string; refreshToken: string } | null = null;

    if (accessToken) {
      sessionPayload = verifyAccessToken(accessToken);
    }

    if (!sessionPayload && refreshToken) {
      const refreshResult = await refreshSession(refreshToken, request);
      if (refreshResult) {
        sessionPayload = refreshResult.payload;
        newTokens = refreshResult.tokenPair;
      }
    }

    const isAuthenticated = !!sessionPayload;

    if (isAuthenticated && publicAdminRoutes.includes(pathname)) {
      const returnTo = request.nextUrl.searchParams.get("returnTo");
      const redirectUrl = new URL(returnTo || "/admin", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (!isAuthenticated && !publicAdminRoutes.includes(pathname)) {
      const returnTo = `${pathname}${request.nextUrl.search || ""}`;
      const redirectUrl = new URL("/admin/sign-in", request.url);

      if (returnTo) {
        redirectUrl.searchParams.set("returnTo", returnTo);
      }

      const response = NextResponse.redirect(redirectUrl);
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }

    const response = NextResponse.next();

    if (newTokens) {
      response.cookies.set("accessToken", newTokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 15,
      });
      response.cookies.set("refreshToken", newTokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
