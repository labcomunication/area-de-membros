import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  screens,
  states,
  fixtureEntitlements,
  products,
  profiles,
  offerProfiles,
  type Screen,
  type ViewState,
} from "@/config/members";
import { resolveEntitlements } from "@/domain/entitlements";
import { MembersShell } from "@/components/members-shell";
import { PageContent } from "@/components/member-pages";
import { GalleryProvider } from "@/components/member-link";
import { GalleryToolbar } from "@/components/gallery-toolbar";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // No env toggle or URL parameter can enable this gallery in production.
  if (process.env.NODE_ENV !== "development") notFound();
  const params = await searchParams;
  const screen = (
    typeof params.screen === "string" ? params.screen : "home"
  ) as Screen;
  const state = (
    typeof params.state === "string" ? params.state : "normal"
  ) as ViewState;
  if (!screens.some(([id]) => id === screen) || !states.includes(state))
    notFound();
  const props = {
    screen,
    state,
    preview: true,
    entitlements:
      params.profile === "nenhum"
        ? []
        : params.profile === "todos"
          ? products.map((p) => p.id)
          : params.profile === "organizado"
            ? resolveEntitlements(
                ["fixture-offer-organizado"],
                offerProfiles,
                profiles,
              )
            : fixtureEntitlements,
    productId: typeof params.product === "string" ? params.product : undefined,
    moduleId: typeof params.module === "string" ? params.module : undefined,
    postSlug: typeof params.post === "string" ? params.post : undefined,
    categoryId:
      typeof params.category === "string" ? params.category : undefined,
  };
  const auth = ["login", "sent", "verify"].includes(screen);
  return (
    <GalleryProvider
      profile={
        typeof params.profile === "string" ? params.profile : "essencial"
      }
    >
      <Suspense>
        <GalleryToolbar />
      </Suspense>
      {auth ? (
        <main id="main" className="gallery-access">
          <PageContent {...props} />
        </main>
      ) : (
        <MembersShell preview screen={screen}>
          <PageContent {...props} />
        </MembersShell>
      )}
    </GalleryProvider>
  );
}
