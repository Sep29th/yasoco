import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export interface AccessTokenPayload {
  userId: string;
  permissions: string[];
}

export interface RefreshTokenPayload {
  userId: string;
  jti?: string;
}

export async function generateTokenPair(
  userId: string,
  jwtid: string,
  permissions: string[]
) {
  const accessToken = jwt.sign({ userId, permissions }, ACCESS_SECRET, {
    algorithm: "HS256",
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, {
    algorithm: "HS512",
    expiresIn: "7d",
    jwtid,
  });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    return null;
  }
}
