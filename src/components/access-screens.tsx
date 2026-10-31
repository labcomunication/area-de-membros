"use client";
import { MemberLink as Link } from "./member-link";
import { useEffect, useState } from "react";
import { screenHref } from "@/config/navigation";
export function AccessScreen({
  kind,
  preview = false,
  expired = false,
}: {
  kind: "login" | "sent" | "verify";
  preview?: boolean;
  expired?: boolean;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState(kind === "sent" ? 60 : 0);
  useEffect(() => {
    if (remaining <= 0) return;
    const id = setTimeout(() => setRemaining(remaining - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);
  async function requestLink(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setBusy(true);
    setError("");
    try {
      const email = event
        ? String(new FormData(event.currentTarget).get("email") ?? "")
        : "";
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError(
          "O envio de links ainda não está disponível. Nenhum e-mail foi enviado.",
        );
        return;
      }
      // TODO: redirect only after a real, reviewed provider integration exists.
      setError("Não foi possível confirmar o envio. Tente mais tarde.");
    } catch {
      setError("Não foi possível conectar. Tente novamente mais tarde.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div role={preview ? undefined : "main"} className="access-wrap">
      <a className="wordmark" href={screenHref("login", preview)}>
        <span className="brand-mark" aria-hidden="true">
          m.
        </span>
        Seu espaço
      </a>
      <section className="access-card">
        <div className="eyebrow">SEUS MATERIAIS, NO SEU TEMPO</div>
        <span className="access-icon" aria-hidden="true">
          {kind === "sent" ? "✉" : kind === "verify" ? "◷" : "↗"}
        </span>
        <h1>
          {kind === "login"
            ? "Acesse seus materiais"
            : kind === "sent"
              ? preview
                ? "Confira seu e-mail"
                : "Envio ainda indisponível"
              : "Link expirado ou já usado"}
        </h1>
        {expired && (
          <p className="notice" data-state="expired">
            Sua sessão expirou. Solicite um novo link para continuar.
          </p>
        )}
        {kind === "login" ? (
          <>
            <p>
              Digite o e-mail usado na compra. Você não precisa de senha para
              acessar.
            </p>
            <form onSubmit={requestLink}>
              <label htmlFor="email">E-mail usado na compra</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                required
              />
              <button className="button" type="submit" disabled={busy}>
                {busy ? "Aguarde…" : "Enviar link de acesso"}
              </button>
            </form>
            <p className="microcopy">
              Caso haja materiais associados ao e-mail, você receberá as
              instruções de acesso quando o serviço estiver disponível.
            </p>
          </>
        ) : kind === "sent" ? (
          <>
            <p>
              {preview
                ? "Exemplo de confirmação: enviamos um link para a***@exemplo.test."
                : "O serviço de acesso está em preparação. Nenhum envio foi confirmado."}
            </p>
            <p>
              Verifique também a caixa de spam. O link será de uso único e terá
              validade curta.
            </p>
            <button
              className="button"
              disabled={remaining > 0 || busy}
              onClick={() => {
                setRemaining(60);
                void requestLink();
              }}
            >
              Reenviar link{remaining > 0 ? ` (${remaining}s)` : ""}
            </button>
            <Link className="text-link" href={screenHref("login", preview)}>
              Usar outro e-mail
            </Link>
          </>
        ) : (
          <>
            <p>
              Por segurança, os links de acesso têm validade limitada e só podem
              ser usados uma vez.
            </p>
            <Link className="button" href={screenHref("login", preview)}>
              Enviar novo link
            </Link>
          </>
        )}
        {error && (
          <p role="alert" className="notice">
            {error}
          </p>
        )}
        <p className="access-support">
          Não recebeu?{" "}
          <Link href={preview ? screenHref("support", true) : "/ajuda"}>
            Fale com o suporte
          </Link>
        </p>
      </section>
      <p className="access-footer">Um espaço para continuar aprendendo.</p>
    </div>
  );
}
