import { getUserId } from "@/lib/data/auth";
import { redirect } from "next/navigation";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getUserId();
  if (userId) {
    redirect("/trips");
  }
  return <>{children}</>;
}