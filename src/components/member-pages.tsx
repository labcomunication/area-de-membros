"use client";
import { MemberLink as Link } from "./member-link";
import { useState } from "react";
import {
  products,
  posts,
  categories,
  type Screen,
  type ViewState,
} from "@/config/members";
import { Timeline } from "./timeline";
import { ProductCard, AssetPlaceholder } from "./product-card";
import { ProductDetail, ModuleView } from "./product-detail";
import { Offers } from "./offers";
import { WireframeState } from "./wireframe-state";
import { AccessScreen } from "./access-screens";
import { articleHref, categoryHref } from "@/config/navigation";
import { screenHref } from "@/config/navigation";
export interface PageContentProps {
  screen: Screen;
  state?: ViewState;
  preview?: boolean;
  entitlements: readonly string[];
  productId?: string;
  moduleId?: string;
  postSlug?: string;
  categoryId?: string;
}
export function PageContent({
  screen,
  state = "normal",
  preview = false,
  entitlements,
  productId,
  moduleId,
  postSlug,
  categoryId,
}: PageContentProps) {
  const header =
    screen === "home"
      ? "Início"
      : screen === "products"
        ? "Meus Produtos"
        : screen === "offers"
          ? "Ofertas especiais para você"
          : screen === "bonus"
            ? "Seus bônus"
            : screen === "support"
              ? "Como podemos ajudar?"
              : screen === "account"
                ? "Minha conta"
                : "Seus materiais";
  if (state === "loading")
    return (
      <>
        <h1>{header}</h1>
        <WireframeState kind="loading" title="Carregando" />
      </>
    );
  if (state === "error")
    return (
      <>
        <h1>{header}</h1>
        <WireframeState
          kind="error"
          title="Algo não saiu como esperado"
          preview={preview}
        />
      </>
    );
  if (state === "pending")
    return (
      <>
        <h1>{header}</h1>
        <WireframeState
          kind="pending"
          title="PDF pendente — aguardando arquivo"
          preview={preview}
        />
      </>
    );
  if (state === "expired")
    return (
      <section data-state="expired" className="state-panel">
        <h1>Sua sessão expirou</h1>
        <p>Solicite um novo link de acesso para continuar.</p>
        <Link className="button" href={screenHref("login", preview)}>
          Enviar novo link
        </Link>
      </section>
    );
  if (
    (screen === "login" || screen === "sent" || screen === "verify") &&
    state !== "empty"
  )
    return <AccessScreen kind={screen} preview={preview} />;
  if (screen === "home")
    return (
      <Timeline
        preview={preview}
        entitlements={entitlements}
        empty={state === "empty"}
      />
    );
  if (state === "empty")
    return (
      <>
        <h1>{header}</h1>
        <WireframeState
          kind="empty"
          title={
            screen === "products"
              ? "Você ainda não tem materiais"
              : screen === "offers"
                ? "Você já tem tudo! 🎉"
                : screen === "bonus"
                  ? "Seus bônus aparecerão aqui"
                  : screen === "category"
                    ? "Novidades chegam em breve"
                    : "Ainda não há conteúdo por aqui"
          }
          preview={preview}
        />
      </>
    );
  const product =
    products.find((p) => p.id === productId) ??
    products[screen === "locked" ? 3 : 0];
  if (screen === "product" || screen === "locked")
    return (
      <ProductDetail
        product={product}
        entitlements={entitlements}
        entitled={screen !== "locked" && entitlements.includes(product.id)}
        preview={preview}
      />
    );
  if (screen === "module")
    return (
      <ModuleView
        product={product}
        module={
          product.modules.find((m) => m.id === moduleId) ?? product.modules[0]
        }
        entitled={entitlements.includes(product.id)}
        preview={preview}
      />
    );
  if (screen === "products" || screen === "bonus")
    return (
      <Catalog
        bonus={screen === "bonus"}
        preview={preview}
        entitlements={entitlements}
      />
    );
  if (screen === "offers")
    return (
      <>
        <PageHeading
          title={header}
          subtitle="Descubra outras coleções e amplie suas possibilidades."
          label="APENAS PARA MEMBROS"
        />
        <Offers entitlements={entitlements} />
        <p className="microcopy offer-note">
          Preços e ofertas serão definidos pela equipe de produto. Nenhuma
          compra está habilitada.
        </p>
      </>
    );
  if (screen === "article")
    return <Article preview={preview} slug={postSlug} />;
  if (screen === "category")
    return <Category preview={preview} id={categoryId} />;
  if (screen === "support") return <Support preview={preview} />;
  if (screen === "account")
    return (
      <>
        <PageHeading
          title="Minha conta"
          subtitle="Seus dados e materiais, reunidos em um só lugar."
          label="SEU PERFIL"
        />
        <section className="account-panel">
          <div className="account-identity">
            <span className="avatar large">A</span>
            <div>
              <h2>Seu perfil</h2>
              <span className="microcopy">Dados ilustrativos</span>
            </div>
          </div>
          <label htmlFor="account-email">E-mail da conta</label>
          <input id="account-email" value="aprendiz@example.test" readOnly />
          <p>O e-mail usado na compra identifica seus materiais.</p>
          <Link className="button outline" href={screenHref("login", preview)}>
            Reenviar link de acesso
          </Link>
        </section>
        <section className="section-block">
          <h2>Suas compras</h2>
          <ul className="purchase-list">
            {products
              .filter((p) => entitlements.includes(p.id))
              .map((p) => (
                <li key={p.id}>
                  <span>
                    {p.title}
                    <small>Compra ilustrativa · Data pendente</small>
                  </span>
                  <Link href={screenHref("product", preview, p.id)}>
                    Ver material <span aria-hidden="true">↗</span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
        <Link className="button outline" href={screenHref("login", preview)}>
          Sair da conta
        </Link>
      </>
    );
  return (
    <section className="not-found">
      <span className="error-number">404</span>
      <h1>Esse caminho ainda não existe</h1>
      <p>Vamos voltar aos seus materiais?</p>
      <Link className="button" href={screenHref("home", preview)}>
        Voltar ao início
      </Link>
    </section>
  );
}
function PageHeading({
  title,
  subtitle,
  label,
}: {
  title: string;
  subtitle: string;
  label: string;
}) {
  return (
    <header className="page-heading">
      <div>
        <span className="eyebrow">{label}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </header>
  );
}
function Catalog({
  bonus,
  preview,
  entitlements,
}: {
  bonus: boolean;
  preview: boolean;
  entitlements: readonly string[];
}) {
  const [filter, setFilter] = useState("Todos");
  const owned = products.filter((p) => entitlements.includes(p.id));
  const available = (
    bonus ? products.filter((p) => p.kind === "bonus") : owned
  ).filter(
    (p) =>
      filter === "Todos" ||
      p.kind ===
        (filter === "Principais"
          ? "principal"
          : filter === "Complementos"
            ? "complemento"
            : "bonus"),
  );
  return (
    <>
      <PageHeading
        title={bonus ? "Seus bônus" : "Meus Produtos"}
        subtitle={
          bonus
            ? "Pequenos extras para acompanhar sua jornada."
            : `${owned.length} materiais para explorar no seu tempo.`
        }
        label="SUA BIBLIOTECA"
      />
      {!bonus && (
        <div className="chips" aria-label="Filtrar produtos">
          {["Todos", "Principais", "Complementos", "Bônus"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={filter === f ? "selected" : ""}
              aria-pressed={filter === f}
            >
              {f}
            </button>
          ))}
        </div>
      )}
      {available.length ? (
        <div className="product-grid">
          {available.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              owned={entitlements.includes(p.id)}
              preview={preview}
            />
          ))}
        </div>
      ) : (
        <WireframeState
          kind="empty"
          title={
            owned.length === 0 && !bonus
              ? "Você ainda não tem materiais"
              : "Nenhum material nesta categoria"
          }
          preview={preview}
        />
      )}
      <section className="section-block">
        <h2>Você também pode gostar</h2>
        <Offers entitlements={entitlements} />
      </section>
    </>
  );
}
function Article({ preview, slug }: { preview: boolean; slug?: string }) {
  const post = posts.find((p) => p.slug === slug) ?? posts[0];
  return (
    <article className="article">
      <div className="breadcrumb">
        <Link href={screenHref("home", preview)}>Início</Link>
        <span>/</span>
        <Link href={categoryHref(post.category, preview)}>{post.category}</Link>
      </div>
      <span className="eyebrow">{post.category}</span>
      <h1>{post.title}</h1>
      <p className="article-lead">{post.excerpt}</p>
      <div className="story-meta">
        {post.date} · {post.time}
      </div>
      <AssetPlaceholder label="Imagem de abertura do artigo" variant="wide" />
      <div className="article-body">
        <h2>Um espaço para suas descobertas</h2>
        <p>
          Este é um exemplo de estrutura editorial. O conteúdo final será
          preparado pela equipe e poderá reunir orientações, receitas e
          novidades das suas coleções.
        </p>
        <p>
          Por aqui, cada ideia encontra seu tempo. Você poderá salvar seus
          materiais e voltar sempre que precisar de inspiração.
        </p>
        <blockquote>
          Reserve um momento para aprender algo novo, um passo de cada vez.
        </blockquote>
        <h2>Continue explorando</h2>
        <p>Encontre outros materiais relacionados na sua biblioteca.</p>
        <Link className="button outline" href={screenHref("products", preview)}>
          Ir para Meus Produtos
        </Link>
      </div>
    </article>
  );
}
function Category({ preview, id }: { preview: boolean; id?: string }) {
  const category = categories.find((c) => c.id === id) ?? categories[1];
  const entries = posts.filter((p) => p.category === category.id);
  return (
    <>
      <div className="breadcrumb">
        <Link href={screenHref("home", preview)}>Início</Link>
        <span>/</span>Coleções
      </div>
      <PageHeading
        title={category.title}
        subtitle={category.description}
        label="EXPLORE UMA COLEÇÃO"
      />
      {entries.length ? (
        <div className="editorial-grid">
          {entries.map((p) => (
            <Link
              className="editorial-card"
              href={articleHref(p.slug, preview)}
              key={p.slug}
            >
              <AssetPlaceholder label="Imagem editorial" variant="wide" />
              <span className="eyebrow">{p.category}</span>
              <h2>{p.title}</h2>
              <p>{p.excerpt}</p>
              <span className="story-meta">{p.time}</span>
            </Link>
          ))}
        </div>
      ) : (
        <WireframeState
          kind="empty"
          title="Novidades chegam em breve"
          preview={preview}
        />
      )}
    </>
  );
}
export function Support({ preview }: { preview: boolean }) {
  const faq = [
    [
      "Como acesso meus materiais?",
      "Solicite um link de acesso usando o mesmo e-mail informado na compra. O serviço de envio será habilitado em uma próxima etapa.",
    ],
    [
      "O PDF não abre. O que fazer?",
      "Materiais marcados como pendentes ainda aguardam arquivo. Quando disponíveis, confira sua conexão e use um leitor de PDF atualizado.",
    ],
    [
      "Como solicito reembolso?",
      "As orientações e o canal de atendimento serão informados pela equipe responsável pela sua compra.",
    ],
    [
      "Como recebo outro link?",
      "Use a tela de acesso para solicitar um novo link com o e-mail da compra.",
    ],
  ];
  return (
    <>
      <PageHeading
        title="Como podemos ajudar?"
        subtitle="Encontre respostas para continuar com tranquilidade."
        label="ESTAMOS POR PERTO"
      />
      <div className="support-layout">
        <section className="faq">
          <h2>Perguntas frequentes</h2>
          {faq.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{a}</p>
              {q === "Como recebo outro link?" && (
                <Link href={screenHref("login", preview)}>
                  Ir para a tela de acesso
                </Link>
              )}
            </details>
          ))}
        </section>
        <aside className="support-card">
          <span className="state-icon" aria-hidden="true">
            ☏
          </span>
          <h2>Precisa de uma mão?</h2>
          <p>O canal de contato será disponibilizado aqui pela equipe.</p>
          <button className="button" disabled>
            Falar com o suporte
          </button>
          <p className="microcopy">Contato em preparação</p>
        </aside>
      </div>
    </>
  );
}
