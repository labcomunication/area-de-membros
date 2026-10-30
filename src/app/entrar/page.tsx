import { AccessScreen } from "@/components/access-screens";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ expirado?: string }>;
}) {
  return (
    <AccessScreen
      kind="login"
      expired={(await searchParams).expirado === "1"}
    />
  );
}
