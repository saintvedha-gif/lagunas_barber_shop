"use server";

import { cookies } from "next/headers";
import { authApi } from "@/lib/api";

export async function loginAction(usuario: string, password: string, recordar = false) {
  let data: { token: string; admin: unknown };
  try {
    data = await authApi.login(usuario, password) as { token: string; admin: unknown };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("429")) throw new Error("429");
    throw new Error("Credenciales inválidas");
  }
  const cookieStore = await cookies();
  cookieStore.set("auth_token", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: recordar ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
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
