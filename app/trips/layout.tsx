import { getUserId } from "@/lib/data/auth";
import { redirect } from "next/navigation";

export default async function TripsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/login");
  }
  return <>{children}</>;
}