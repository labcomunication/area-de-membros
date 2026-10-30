"use client";
import { MemberLink as Link } from "./member-link";
import { useState } from "react";
import { products, type Product, type Module } from "@/config/members";
import { AssetPlaceholder, ProductCard } from "./product-card";
import { screenHref } from "@/config/navigation";
export function ProductDetail({
  product,
  entitled,
  preview,
  entitlements = [],
}: {
  product: Product;
  entitled: boolean;
  preview: boolean;
  entitlements?: readonly string[];
}) {
  const [tab, setTab] = useState("Conteúdo");
  if (!entitled)
    return (
      <>
        <div className="breadcrumb">
          <Link href={screenHref("products", preview)}>Meus Produtos</Link>
          <span>/</span>Material bloqueado
        </div>
        <div className="locked-product">
          <AssetPlaceholder label={product.cover.slot} />
          <div>
            <span className="eyebrow">ACESSO A OUTRA COLEÇÃO</span>
            <h1>{product.title}</h1>
            <p>{product.description}</p>
            <p className="notice">
              Este material faz parte de outra oferta. Ele ainda não está na sua
              biblioteca.
            </p>
            <button className="button buy" disabled>
              Conhecer oferta · Em breve
            </button>
            <Link className="text-link" href={screenHref("offers", preview)}>
              Ver ofertas especiais
            </Link>
          </div>
        </div>
      </>
    );
  return (
    <>
      <div className="breadcrumb">
        <Link href={screenHref("products", preview)}>Meus Produtos</Link>
        <span>/</span>
        {product.title}
      </div>
      <header className="product-header">
        <AssetPlaceholder label={product.cover.slot} />
        <div>
          <span className="eyebrow">SUA COLEÇÃO</span>
          <h1>{product.title}</h1>
          <p>{product.description}</p>
          <p className="progress-label">
            0 de {product.modules.length} módulos concluídos
          </p>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Progresso da coleção"
            aria-valuenow={0}
            aria-valuemin={0}
            aria-valuemax={product.modules.length}
          />
          <Link
            className="button"
            href={screenHref(
              "module",
              preview,
              product.id,
              product.modules[0]?.id,
            )}
          >
            Ver primeiro módulo <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>
      <div className="tabs" role="tablist" aria-label="Seções do produto">
        {["Conteúdo", "Bônus", "Materiais"].map((t) => (
          <button
            role="tab"
            aria-selected={tab === t}
            id={`tab-${t}`}
            aria-controls="product-panel"
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <section
        role="tabpanel"
        id="product-panel"
        aria-labelledby={`tab-${tab}`}
      >
        {tab === "Conteúdo" ? (
          <div className="module-list">
            {product.modules.map((module, index) => (
              <Link
                className="module-row"
                key={module.id}
                href={screenHref("module", preview, product.id, module.id)}
              >
                <span className="module-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <strong>{module.title}</strong>
                  <span className="module-meta">
                    {module.type.toUpperCase()} ·{" "}
                    {module.type === "pdf" ? "PDF pendente" : "Vídeo em breve"}
                  </span>
                </span>
                <span className="module-tag">Em breve</span>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        ) : tab === "Bônus" ? (
          <div className="product-grid compact">
            {products
              .filter((p) => p.kind === "bonus")
              .map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  preview={preview}
                  owned={entitlements.includes(p.id)}
                />
              ))}
          </div>
        ) : (
          <div className="state-panel">
            <h2>Materiais de apoio</h2>
            <p>PDF pendente — aguardando arquivo.</p>
            <button className="button" disabled>
              Baixar materiais · Em breve
            </button>
          </div>
        )}
      </section>
    </>
  );
}
export function ModuleView({
  product,
  module,
  entitled,
  preview,
}: {
  product: Product;
  module: Module;
  entitled: boolean;
  preview: boolean;
}) {
  if (!entitled)
    return (
      <ProductDetail product={product} entitled={false} preview={preview} />
    );
  const index = product.modules.findIndex((m) => m.id === module.id);
  return (
    <>
      <div className="breadcrumb">
        <Link href={screenHref("products", preview)}>Meus Produtos</Link>
        <span>/</span>
        <Link href={screenHref("product", preview, product.id)}>
          {product.title}
        </Link>
      </div>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            MÓDULO {String(index + 1).padStart(2, "0")} /{" "}
            {String(product.modules.length).padStart(2, "0")}
          </span>
          <h1>{module.title}</h1>
        </div>
        <span className="pill">{module.type.toUpperCase()}</span>
      </div>
      <section className="viewer-placeholder">
        <span className="state-icon" aria-hidden="true">
          ▤
        </span>
        <h2>
          {module.type === "pdf"
            ? "PDF pendente — aguardando arquivo"
            : "Vídeo em breve"}
        </h2>
        <p>O material será disponibilizado aqui quando estiver pronto.</p>
        {preview && <code>slot: {module.asset.slot}</code>}
      </section>
      <div className="module-actions">
        <button className="button" disabled>
          Baixar PDF
        </button>
        <button className="button outline" disabled>
          Marcar como concluído
        </button>
      </div>
      <div className="module-pagination">
        {index > 0 ? (
          <Link
            className="button outline"
            href={screenHref(
              "module",
              preview,
              product.id,
              product.modules[index - 1].id,
            )}
          >
            ← Anterior
          </Link>
        ) : (
          <span />
        )}
        {index < product.modules.length - 1 ? (
          <Link
            className="button outline"
            href={screenHref(
              "module",
              preview,
              product.id,
              product.modules[index + 1].id,
            )}
          >
            Próximo módulo →
          </Link>
        ) : (
          <Link href={screenHref("product", preview, product.id)}>
            Voltar à coleção
          </Link>
        )}
      </div>
    </>
  );
}
