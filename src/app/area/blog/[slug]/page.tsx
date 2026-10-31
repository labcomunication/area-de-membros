import { MemberPage } from "@/server/member-page";
export default async function Page({
  params: promise,
}: {
  params: Promise<{ slug: string }>;
}) {
  const params = await promise;
  return <MemberPage screen="article" postSlug={params.slug} />;
}
