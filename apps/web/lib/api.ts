import { NextResponse } from "next/server";

export function jsonError(message: string, status: number, extra?: unknown) {
  return NextResponse.json({ error: message, details: extra }, { status });
}

export const unauthorized = () => jsonError("Not authenticated.", 401);
