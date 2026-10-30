"use client";
import { MemberLink as Link } from "./member-link";
import { useState } from "react";
import type { Screen } from "@/config/members";
import { navigation, screenHref } from "@/config/navigation";
export function Navigation({
  screen,
  preview,
}: {
  screen: Screen;
  preview: boolean;
}) {
  const [open, setOpen] = useState(false);
  const item = (entry: (typeof navigation)[number]) => (
    <Link
      key={entry.screen}
      href={screenHref(entry.screen, preview)}
      aria-current={entry.screen === screen ? "page" : undefined}
      onClick={() => setOpen(false)}
    >
      <span aria-hidden="true">{entry.icon}</span>
      {entry.label}
    </Link>
  );
  return (
    <>
      <aside className="sidebar">
        <Link className="wordmark" href={screenHref("home", preview)}>
          <span className="brand-mark" aria-hidden="true">
            m.
          </span>
          <span>
            Seu espaço<span className="wordmark-sub">ÁREA DE MEMBROS</span>
          </span>
        </Link>
        <span className="nav-label">SUA BIBLIOTECA</span>
        <nav aria-label="Principal">{navigation.map(item)}</nav>
        <div className="sidebar-bottom">
          <p>
            Um espaço para aprender,
            <br />
            no seu tempo.
          </p>
          <Link href={screenHref("login", preview)}>
            Sair da área <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </aside>
      <header className="mobile-header">
        <Link href={screenHref("home", preview)} className="wordmark">
          <span className="brand-mark" aria-hidden="true">
            m.
          </span>
          Seu espaço
        </Link>
        <Link
          href={screenHref("account", preview)}
          aria-label="Minha conta"
          className="avatar"
        >
          A
        </Link>
      </header>
      <nav className="bottom-nav" aria-label="Navegação mobile">
        {[navigation[0], navigation[1], navigation[3]].map(item)}
        <button
          type="button"
          aria-label="Mais opções"
          aria-expanded={open}
          aria-controls="more-navigation"
          onClick={() => setOpen(!open)}
        >
          <span aria-hidden="true">☰</span>Mais
        </button>
      </nav>
      {open && (
        <div className="drawer" id="more-navigation">
          <div className="drawer-heading">
            <strong>Mais opções</strong>
            <button
              type="button"
              aria-label="Fechar opções"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <nav aria-label="Mais opções">{navigation.slice(2).map(item)}</nav>
        </div>
      )}
    </>
  );
}
