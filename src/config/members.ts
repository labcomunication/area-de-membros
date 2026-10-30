import { resolveEntitlements } from "../domain/entitlements";
export interface AssetSlot {
  slot: string;
  url: string | null;
}
export interface Module {
  id: string;
  title: string;
  type: "pdf" | "video";
  asset: AssetSlot;
}
export interface Product {
  id: string;
  title: string;
  description: string;
  kind: "principal" | "complemento" | "bonus";
  cover: AssetSlot;
  modules: Module[];
}
const slot = (name: string): AssetSlot => ({ slot: name, url: null });
export const products: Product[] = [
  {
    id: "doces-base",
    title: "Fundamentos da confeitaria",
    description: "Uma coleção para organizar os primeiros passos na cozinha.",
    kind: "principal",
    cover: slot("capa-doces-base"),
    modules: [
      {
        id: "fundamentos",
        title: "Antes de começar",
        type: "pdf",
        asset: slot("pdf-fundamentos"),
      },
      {
        id: "tecnicas",
        title: "Técnicas e preparos",
        type: "video",
        asset: slot("video-tecnicas"),
      },
      {
        id: "receitas",
        title: "Caderno de receitas",
        type: "pdf",
        asset: slot("pdf-receitas"),
      },
    ],
  },
  {
    id: "sobremesas",
    title: "Sobremesas para compartilhar",
    description: "Ideias e combinações para momentos especiais.",
    kind: "principal",
    cover: slot("capa-sobremesas"),
    modules: [
      {
        id: "caderno",
        title: "Seu caderno de sobremesas",
        type: "pdf",
        asset: slot("pdf-sobremesas"),
      },
    ],
  },
  {
    id: "guia-medidas",
    title: "Guia de medidas",
    description: "Referências para ter por perto durante os preparos.",
    kind: "bonus",
    cover: slot("capa-medidas"),
    modules: [
      {
        id: "tabela",
        title: "Tabela de medidas",
        type: "pdf",
        asset: slot("pdf-medidas"),
      },
    ],
  },
  {
    id: "precificacao",
    title: "Custos e organização",
    description: "Um complemento para planejar a rotina e os próximos passos.",
    kind: "complemento",
    cover: slot("capa-custos"),
    modules: [
      {
        id: "planejamento",
        title: "Planejamento na prática",
        type: "pdf",
        asset: slot("pdf-custos"),
      },
    ],
  },
  {
    id: "decoracao",
    title: "Acabamentos e decoração",
    description: "Explore novas possibilidades para finalizar suas criações.",
    kind: "complemento",
    cover: slot("capa-decoracao"),
    modules: [
      {
        id: "acabamentos",
        title: "Caderno de acabamentos",
        type: "pdf",
        asset: slot("pdf-decoracao"),
      },
    ],
  },
  {
    id: "checklist",
    title: "Checklist da cozinha",
    description: "Uma lista para organizar ingredientes e utensílios.",
    kind: "bonus",
    cover: slot("capa-checklist"),
    modules: [
      {
        id: "lista",
        title: "Checklist de preparo",
        type: "pdf",
        asset: slot("pdf-checklist"),
      },
    ],
  },
];
export const profiles = [
  { id: "essencial", productIds: ["doces-base", "sobremesas", "guia-medidas"] },
  { id: "organizado", productIds: ["precificacao", "checklist"] },
];
export const offerProfiles: Readonly<Record<string, string>> = {
  "fixture-offer-essencial": "essencial",
  "fixture-offer-organizado": "organizado",
};
/** Fixtures are used only by the development gallery. Never authenticate with these. */
export const fixtureEntitlements = resolveEntitlements(
  ["fixture-offer-essencial"],
  offerProfiles,
  profiles,
);
export const brand = {
  name: "Área de membros",
  hero: slot("hero-boas-vindas"),
  welcomeVideo: slot("video-boas-vindas"),
  contact: slot("contato-suporte"),
  newsletter: slot("newsletter-comunidade"),
};
export const categories = [
  {
    id: "receitas",
    title: "Receitas",
    description: "Para experimentar com calma",
  },
  {
    id: "dicas",
    title: "Dicas",
    description: "Pequenos cuidados, bons resultados",
  },
  { id: "novidades", title: "Novidades", description: "O que vem por aí" },
  {
    id: "organizacao",
    title: "Organização",
    description: "Mais leveza na sua rotina",
  },
];
export const posts = [
  {
    slug: "primeiros-passos",
    category: "dicas",
    title: "Um bom começo faz toda a diferença",
    excerpt:
      "Organize seu espaço, separe os ingredientes e encontre seu ritmo.",
    date: "Conteúdo ilustrativo",
    time: "4 min de leitura",
  },
  {
    slug: "seu-caderno",
    category: "organizacao",
    title: "Um caderno para guardar suas descobertas",
    excerpt: "Crie um lugar para registrar o que funciona para você.",
    date: "Conteúdo ilustrativo",
    time: "3 min de leitura",
  },
  {
    slug: "tempo-na-cozinha",
    category: "dicas",
    title: "Mais tempo para o que você gosta",
    excerpt: "Pequenas escolhas para simplificar os preparos.",
    date: "Conteúdo ilustrativo",
    time: "5 min de leitura",
  },
  {
    slug: "novas-combinacoes",
    category: "receitas",
    title: "Experimente uma nova combinação",
    excerpt: "Inspirações para o seu próximo momento na cozinha.",
    date: "Conteúdo ilustrativo",
    time: "2 min de leitura",
  },
];
export const screens = [
  ["login", "Login"],
  ["sent", "Link enviado"],
  ["verify", "Link expirado"],
  ["home", "Início"],
  ["article", "Artigo"],
  ["category", "Categoria"],
  ["products", "Meus Produtos"],
  ["product", "Produto"],
  ["module", "Material"],
  ["bonus", "Bônus"],
  ["offers", "Ofertas"],
  ["locked", "Produto bloqueado"],
  ["support", "Suporte"],
  ["account", "Conta"],
  ["not-found", "404"],
] as const;
export type Screen = (typeof screens)[number][0];
export const states = [
  "normal",
  "empty",
  "loading",
  "error",
  "pending",
  "expired",
] as const;
export type ViewState = (typeof states)[number];
