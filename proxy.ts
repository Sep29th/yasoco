import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken, AccessTokenPayload } from "./lib/jwt";
import { refreshSession } from "./lib/auth";

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (pathname === "/admin" || pathname.startsWith("/admin/")) {
		const publicAdminRoutes = ["/admin/sign-in"];

		const accessToken = request.cookies.get("accessToken")?.value;
		const refreshToken = request.cookies.get("refreshToken")?.value;

		let sessionPayload: AccessTokenPayload | null = null;
		let newTokens: { accessToken: string; refreshToken: string } | null = null;

		// [LOGGING] Biến để theo dõi lý do thất bại
		let logoutReason = "No tokens found";

		if (accessToken) {
			sessionPayload = verifyAccessToken(accessToken);
			if (!sessionPayload) {
				logoutReason = "Access token invalid or expired";
			}
		}

		if (!sessionPayload && refreshToken) {
			// Access token hỏng, thử dùng refresh token
			const refreshResult = await refreshSession(
				refreshToken,
				request.headers.get("user-agent")
			);

			if (refreshResult) {
				sessionPayload = refreshResult.payload;
				newTokens = refreshResult.tokenPair;
			} else {
				// [LOGGING] Cập nhật lý do nếu refresh thất bại
				logoutReason = "Refresh token verification failed (expired/revoked)";
			}
		} else if (!sessionPayload && accessToken && !refreshToken) {
			// [LOGGING] Trường hợp có access token nhưng không có refresh token
			logoutReason = "Access token expired and no refresh token provided";
		}

		const isAuthenticated = !!sessionPayload;

		// 1. Nếu đã login mà vào trang sign-in -> Đẩy về admin dashboard
		if (isAuthenticated && publicAdminRoutes.includes(pathname)) {
			const returnTo = request.nextUrl.searchParams.get("returnTo");
			const redirectUrl = new URL(returnTo || "/admin", request.url);
			return NextResponse.redirect(redirectUrl);
		}

		// 2. Nếu chưa login và vào trang bảo mật -> Đẩy về sign-in (LOG Ở ĐÂY)
		if (!isAuthenticated && !publicAdminRoutes.includes(pathname)) {
			// [LOGGING] Log ra console server lý do bị đá ra
			console.warn(
				`[Middleware Auth] User logged out from ${pathname}. Reason: ${logoutReason}`
			);

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

		// 3. Cho phép đi tiếp
		const response = NextResponse.next();

		// Nếu có token mới (do refresh thành công), set lại cookie
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
