import { auth } from "@clerk/nextjs/server";

/**
 * Get the current user's ID from Clerk.
 * Returns null if the user is not authenticated.
 */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Require a user ID, throwing if not authenticated.
 */
export async function requireUserId(): Promise<string> {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}
