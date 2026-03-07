"use server";

import { cookies } from "next/headers";
import { authApi } from "@/lib/api";

export async function loginAction(usuario: string, password: string) {
  const data = await authApi.login(usuario, password);
  const cookieStore = await cookies();
  cookieStore.set("auth_token", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  return data.admin;
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (token) {
    try { await authApi.logout(token); } catch { /* ignorar */ }
  }
  cookieStore.delete("auth_token");
}

export async function getTokenAction(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value ?? null;
}
