"use client";
import Link from "next/link";
import { useState } from "react";
import { brand, products, categories, posts } from "@/config/members";
import { screenHref } from "@/config/navigation";
import { AssetPlaceholder, ProductCard } from "./product-card";
import { Offers } from "./offers";
import { WireframeState } from "./wireframe-state";
export function Timeline({
  preview,
  entitlements,
  empty = false,
}: {
  preview: boolean;
  entitlements: readonly string[];
  empty?: boolean;
}) {
  const [filter, setFilter] = useState("Todas");
  const [query, setQuery] = useState("");
  const owned = products.filter((p) => entitlements.includes(p.id));
  const entries = posts.filter(
    (p) =>
      query === "" ||
      p.title
        .toLocaleLowerCase("pt-BR")
        .includes(query.toLocaleLowerCase("pt-BR")),
  );
  return (
    <>
      <header className="page-heading greeting">
        <div>
          <span className="eyebrow">BOM TER VOCÊ POR AQUI</span>
          <h1>Olá, seja bem-vinda!</h1>
          <p>Aqui estão seus materiais. Qual vai ser a descoberta de hoje?</p>
        </div>
        <span className="edition">SEU PRÓXIMO CAPÍTULO</span>
      </header>
      <section className="welcome-hero">
        <div className="hero-copy">
          <span className="eyebrow">ESTE ESPAÇO É SEU</span>
          <h2>
            Aprenda no seu ritmo.
            <br />
            Crie do seu jeito.
          </h2>
          <p>
            Reúna suas coleções, explore novas ideias e encontre inspiração para
            continuar.
          </p>
          <Link className="button" href={screenHref("products", preview)}>
            Explorar meus materiais <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="hero-collage">
          <AssetPlaceholder label={brand.hero.slot} variant="wide" />
          <div>
            <AssetPlaceholder label="Imagem de apoio 01" variant="square" />
            <AssetPlaceholder label="Imagem de apoio 02" variant="square" />
          </div>
        </div>
        <span className="hero-caption">Vídeo de boas-vindas em breve</span>
      </section>
      <section className="section-block">
        <SectionHeading
          title="Seus Produtos"
          label="SUA BIBLIOTECA"
          href={screenHref("products", preview)}
          action="Ver todos"
        />
        {owned.length ? (
          <div className="product-grid carousel">
            {owned.map((p) => (
              <ProductCard key={p.id} product={p} preview={preview} />
            ))}
          </div>
        ) : (
          <WireframeState
            kind="empty"
            title="Você ainda não tem materiais"
            preview={preview}
          />
        )}
      </section>
      <section className="section-block">
        <SectionHeading title="Uma ideia para cada momento" label="COLEÇÕES" />
        <div className="chips" aria-label="Filtrar coleções">
          {["Todas", "Receitas", "Dicas", "Novidades"].map((f) => (
            <button
              className={filter === f ? "selected" : ""}
              aria-pressed={filter === f}
              key={f}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="category-grid carousel">
          {categories
            .filter((c) => filter === "Todas" || c.title === filter)
            .map((c, i) => (
              <Link
                href={`${screenHref("category", preview)}${preview ? "&category=" + c.id : ""}`}
                className="category-card"
                key={c.id}
              >
                <div className={`category-art tone-${i}`}>
                  <span aria-hidden="true">{["◌", "✳", "◈", "▥"][i]}</span>
                  <span className="category-index">0{i + 1}</span>
                </div>
                <h3>{c.title}</h3>
                <p>{c.description}</p>
                <span className="category-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            ))}
        </div>
      </section>
      <section className="section-block">
        <SectionHeading
          title="Últimas publicações"
          label="PARA LER COM CALMA"
          href={screenHref("category", preview)}
          action="Ver mais"
        />
        {empty ? (
          <WireframeState
            kind="empty"
            title="Novidades chegam em breve"
            preview={preview}
          />
        ) : (
          <>
            <label className="search-field">
              <span>Buscar publicações</span>
              <input
                type="search"
                placeholder="O que você quer aprender?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            {!entries.length ? (
              <p role="status" className="notice">
                Nenhuma publicação encontrada. Tente outra palavra.
              </p>
            ) : (
              <div className="stories-grid">
                <Link
                  className="featured-story"
                  href={screenHref("article", preview)}
                >
                  <AssetPlaceholder
                    label="Imagem da publicação"
                    variant="wide"
                  />
                  <div className="story-copy">
                    <span className="eyebrow">{entries[0].category}</span>
                    <h3>{entries[0].title}</h3>
                    <p>{entries[0].excerpt}</p>
                    <span className="story-meta">
                      {entries[0].date} · {entries[0].time}
                    </span>
                  </div>
                </Link>
                <div className="story-list">
                  {entries.slice(1).map((p) => (
                    <Link
                      href={`${screenHref("article", preview)}${preview ? "&post=" + p.slug : ""}`}
                      className="story-item"
                      key={p.slug}
                    >
                      <AssetPlaceholder
                        label="Imagem editorial"
                        variant="square"
                      />
                      <div>
                        <span className="eyebrow">{p.category}</span>
                        <h3>{p.title}</h3>
                        <span className="story-meta">{p.time}</span>
                      </div>
                      <span aria-hidden="true">↗</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
      <section className="section-block">
        <SectionHeading
          title="Aprender também é compartilhar"
          label="DESTAQUES DA COMUNIDADE"
        />
        <div className="community-grid">
          <div className="community-quote">
            <span className="quote-mark" aria-hidden="true">
              “
            </span>
            <h3>Cada descoberta merece um lugar aqui.</h3>
            <p>
              Este espaço receberá histórias e experiências da comunidade,
              sempre com autorização.
            </p>
            <span className="microcopy">Depoimento e avatar pendentes</span>
          </div>
          <AssetPlaceholder label="Destaque da comunidade" variant="wide" />
        </div>
      </section>
      <section className="section-block">
        <SectionHeading
          title="Seu próximo passo pode estar aqui"
          label="OFERTAS ESPECIAIS"
          href={screenHref("offers", preview)}
          action="Ver ofertas"
        />
        <Offers entitlements={entitlements} />
      </section>
      <section className="newsletter">
        <span className="eyebrow">CONTINUE POR PERTO</span>
        <h2>
          Novas ideias.
          <br />
          Mais motivos para criar.
        </h2>
        <p>Um espaço para receber novidades e acompanhar o que vem por aí.</p>
        <div className="newsletter-form">
          <label className="sr-only" htmlFor="newsletter-email">
            Seu e-mail para novidades
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="Seu e-mail"
            disabled
          />
          <button className="button" disabled>
            Receba novidades
          </button>
        </div>
        <small>
          Inscrições em breve. Nenhum dado é coletado neste formulário.
        </small>
      </section>
    </>
  );
}
export function SectionHeading({
  title,
  label,
  href,
  action,
}: {
  title: string;
  label: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{label}</span>
        <h2>{title}</h2>
      </div>
      {href && (
        <Link className="section-link" href={href}>
          {action} <span aria-hidden="true">↗</span>
        </Link>
      )}
    </div>
  );
}
