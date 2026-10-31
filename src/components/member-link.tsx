"use client";
import NextLink from "next/link";
import { createContext, useContext, type ComponentProps } from "react";
const FixtureProfile = createContext<string | null>(null);
export function GalleryProvider({
  profile,
  children,
}: {
  profile: string;
  children: React.ReactNode;
}) {
  return (
    <FixtureProfile.Provider value={profile}>
      {children}
    </FixtureProfile.Provider>
  );
}
/** Carry only fixture selection between local gallery screens; never a session. */
export function MemberLink({
  href,
  ...props
}: ComponentProps<typeof NextLink>) {
  const profile = useContext(FixtureProfile);
  if (profile && typeof href === "string" && href.startsWith("/wireframes?")) {
    const url = new URL(href, "https://local.invalid");
    url.searchParams.set("profile", profile);
    href = url.pathname + url.search + url.hash;
  }
  return <NextLink href={href} {...props} />;
}
