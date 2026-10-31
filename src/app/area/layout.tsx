import { redirect } from "next/navigation";
import { readVerifiedSession } from "@/server/session";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await readVerifiedSession())) redirect("/entrar?expirado=1");
  return children;
}
