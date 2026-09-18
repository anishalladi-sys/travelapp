import { logoutAction } from "@/app/auth/actions";
import { NextResponse } from "next/server";

export async function POST() {
  await logoutAction();
  return NextResponse.json({ ok: true });
}