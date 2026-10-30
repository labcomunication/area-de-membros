import { MemberLink as Link } from "./member-link";
import { Navigation } from "./navigation";
import { screenHref } from "@/config/navigation";
import type { Screen } from "@/config/members";
export function MembersShell({
  children,
  screen = "home",
  preview = false,
}: {
  children: React.ReactNode;
  screen?: Screen;
  preview?: boolean;
}) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Ir para o conteúdo
      </a>
      <Navigation screen={screen} preview={preview} />
      <div className="workspace">
        <header className="desktop-topbar">
          <span>Aprender faz parte de você.</span>
          <div>
            <span className="access-tag">ÁREA DO MEMBRO</span>
            <Link
              className="avatar"
              href={screenHref("account", preview)}
              aria-label="Minha conta"
            >
              A
            </Link>
          </div>
        </header>
        <main id="main" className="main-content">
          {children}
        </main>
        <footer className="footer">
          <span>Seu espaço de aprendizado</span>
          <Link href={screenHref("support", preview)}>Precisa de ajuda?</Link>
          <span>Conteúdo · Cuidado · Comunidade</span>
        </footer>
      </div>
    </div>
  );
}
