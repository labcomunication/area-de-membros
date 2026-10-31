import { MemberPage } from "@/server/member-page";
export default async function Page({
  params: promise,
}: {
  params: Promise<{ slug: string }>;
}) {
  const params = await promise;
  return <MemberPage screen="category" categoryId={params.slug} />;
}
