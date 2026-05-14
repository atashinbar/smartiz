import { SignJWT, jwtVerify } from "jose";
import type { UserType, AdminRole } from "@smartiz/shared";

export interface TokenPayload {
  id: number;
  userType: UserType | AdminRole;
}

export async function signToken(payload: TokenPayload, secret: string, expiresIn = "30d"): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT({ id: payload.id, userType: payload.userType })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(key);
}

export async function verifyToken(token: string, secret: string): Promise<TokenPayload> {
  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key);
  return {
    id: payload.id as number,
    userType: payload.userType as UserType | AdminRole,
  };
}
