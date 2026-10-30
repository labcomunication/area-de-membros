import { MemberPage } from "@/server/member-page";
export default async function Page({
  params: promise,
}: {
  params: Promise<{ produto: string }>;
}) {
  const params = await promise;
  return <MemberPage screen="product" productId={params.produto} />;
}
