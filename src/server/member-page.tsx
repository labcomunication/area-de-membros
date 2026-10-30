import { notFound, redirect } from "next/navigation";
import { readVerifiedSession } from "./session";
import { MembersShell } from "@/components/members-shell";
import { PageContent } from "@/components/member-pages";
import { products, posts, categories, type Screen } from "@/config/members";
export async function MemberPage({
  screen,
  productId,
  moduleId,
  postSlug,
  categoryId,
}: {
  screen: Screen;
  productId?: string;
  moduleId?: string;
  postSlug?: string;
  categoryId?: string;
}) {
  const session = await readVerifiedSession();
  if (!session) redirect("/entrar?expirado=1");
  const product = products.find((p) => p.id === productId);
  if (productId && !product) notFound();
  if (moduleId && !product?.modules.some((m) => m.id === moduleId)) notFound();
  if (postSlug && !posts.some((p) => p.slug === postSlug)) notFound();
  if (categoryId && !categories.some((c) => c.id === categoryId)) notFound();
  return (
    <MembersShell screen={screen}>
      <PageContent
        screen={screen}
        entitlements={session.productIds}
        productId={productId}
        moduleId={moduleId}
        postSlug={postSlug}
        categoryId={categoryId}
      />
    </MembersShell>
  );
}
