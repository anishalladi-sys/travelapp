import { getSessionAction } from "@/app/auth/actions";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await getSessionAction();
  return NextResponse.json(result);
}