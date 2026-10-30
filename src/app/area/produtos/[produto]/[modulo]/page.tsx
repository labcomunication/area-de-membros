import { MemberPage } from "@/server/member-page";
export default async function Page({
  params: promise,
}: {
  params: Promise<{ produto: string; modulo: string }>;
}) {
  const params = await promise;
  return (
    <MemberPage
      screen="module"
      productId={params.produto}
      moduleId={params.modulo}
    />
  );
}
