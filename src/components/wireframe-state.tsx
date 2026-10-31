"use client";
import { MemberLink as Link } from "./member-link";
export function WireframeState({
  kind,
  title,
  preview = false,
  onRetry,
}: {
  kind: "empty" | "loading" | "error" | "pending";
  title: string;
  preview?: boolean;
  onRetry?: () => void;
}) {
  if (kind === "loading")
    return (
      <div
        data-state="loading"
        className="loading-state"
        role="status"
        aria-label="Carregando materiais"
      >
        <span className="sr-only">Carregando materiais</span>
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-hero" />
        <div className="product-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n}>
              <div className="skeleton skeleton-cover" />
              <div className="skeleton skeleton-line" />
            </div>
          ))}
        </div>
        <div className="skeleton skeleton-module" />
      </div>
    );
  return (
    <section
      data-state={kind}
      className={`state-panel ${kind}`}
      role={kind === "error" ? "alert" : undefined}
    >
      <span className="state-icon" aria-hidden="true">
        {kind === "error" ? "!" : kind === "pending" ? "◷" : "◇"}
      </span>
      <h2>{title}</h2>
      <p>
        {kind === "error"
          ? "Não foi possível carregar este conteúdo. Tente novamente em instantes."
          : kind === "pending"
            ? "Estamos preparando este material. Ele aparecerá aqui assim que estiver disponível."
            : "Assim que houver conteúdo disponível, você poderá encontrá-lo aqui."}
      </p>
      {kind === "error" ? (
        <div className="button-row">
          <button
            className="button"
            type="button"
            onClick={onRetry ?? (() => window.location.reload())}
          >
            Tentar de novo
          </button>
          <Link
            className="button outline"
            href={preview ? "/wireframes?screen=support" : "/area/suporte"}
          >
            Suporte
          </Link>
        </div>
      ) : kind === "empty" ? (
        <Link
          className="button outline"
          href={preview ? "/wireframes?screen=offers" : "/area/ofertas"}
        >
          Ver ofertas
        </Link>
      ) : (
        <button className="button" disabled>
          Em breve
        </button>
      )}
    </section>
  );
}
