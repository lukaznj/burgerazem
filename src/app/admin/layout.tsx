import { redirect } from "next/navigation";
import { isAdmin } from "@/utils/adminAuth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminStatus = await isAdmin();

  if (!adminStatus) {
    redirect("/");
  }

  return <>{children}</>;
}

