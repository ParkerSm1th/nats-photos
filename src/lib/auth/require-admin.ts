import { clerkClient, getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { isAdmin } from "@/lib/utils";

export type AdminAuthResult =
  | { ok: true; userId: string }
  | { ok: false; response: Response };

export async function requireAdmin(
  request: Request
): Promise<AdminAuthResult> {
  const { userId } = getAuth(request as NextRequest);
  if (!userId) {
    return {
      ok: false,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await clerkClient.users.getUser(userId);
  if (!user?.publicMetadata || !isAdmin(user.publicMetadata)) {
    return {
      ok: false,
      response: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId };
}
