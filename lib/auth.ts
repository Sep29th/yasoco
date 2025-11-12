import { cookies } from "next/headers";
import { verifyAccessToken, verifyRefreshToken } from "./jwt";
import prisma from "./prisma";
import { cache } from "react";
import { redirect } from "next/navigation";

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
    const payload = verifyRefreshToken(refreshToken); // <-- Thêm dòng này
    if (payload && payload.jti) {
      await prisma.session.deleteMany({ where: { id: payload.jti } });
    }
  }
}
