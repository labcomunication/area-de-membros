# Briefing inicial — Área de Membros + Timeline/Blog (base do produto)

<br>

## 1. Meta

| Campo | Valor |
| --- | --- |
| **Título** | Briefing Codex: wireframe completo + base da área de membros com timeline/blog inicial |
| **Data** | 30 out 2026 (America/Sao_Paulo) |
| **Autor** | Time LAB (Tech: Alisson · Design: Pike · Product: Zed · Gate criativo: Riccele) |
| **Audiência** | Codex (agente que vai gerar a base do produto) |
| **Objetivo** | Codex entender o produto inteiro e gerar: (1) wireframe completo de todas as telas, (2) skeleton Next.js App Router com rotas, shell, empty states, modelo de entitlement e stubs de auth/webhook |
| **Hospedagem futura** | Repositório GitHub (fluxo da área de membros); deploy Vercel só com go LAB/Alisson |

### Fora de escopo (não fazer)

- Identidade visual final (cores/fontes de marca) — vem depois com Lucas/Pike.
- Pixel, ads, n8n, automações WhatsApp.
- Capas na Cakto, criação de webhook real, CTA/publish, deploy de produção.
- Oferta “Completo R$ 47,90” (SKU ainda aberto).
- Qualquer secret, API key ou senha no repositório.
- Copiar marca, textos ou imagens de terceiros (referências = estrutura apenas).

<br>

## 2. Problema / produto a criar

Hoje a LAB vende infoprodutos (ebooks/PDF de receitas e afins) via LP + checkout Cakto. O rascunho `isabella-membros` (https://isabella-membros.vercel.app) prova a estante, mas **não tem auth real, webhook nem PDFs reais**, e usa senha demo/`?demo=` em URL pública.

**Produto:** uma plataforma de membros onde **cada infoproduto é uma página/card dentro da área logada**, com:

1. **Timeline/blog inicial** (home do membro) — feed editorial: destaques, categorias, últimas publicações, highlights, CTA de newsletter/comunidade.
2. **Meus Produtos** — catálogo do que o membro comprou (entitlement).
3. **Página do produto** — módulos, PDF, vídeo, bônus.
4. **Ofertas especiais** — upsell interno (produtos não comprados → checkout Cakto).
5. **Suporte / Bônus / Conta.**

Molde replicável: trocar tema/marca por oferta sem reescrever a plataforma.

<br>

## 3. Personas e jornada pós-compra

### Personas

| Persona | Perfil | Precisa de |
| --- | --- | --- |
| **Compradora mobile** (principal) | 30–60 anos, chega por anúncio Meta, compra R$ 10–20 via Pix, usa celular | Acesso imediato sem senha, botão grande “Acessar”, PDF que abre fácil |
| **Compradora recorrente** | Já comprou 2+ produtos | Ver tudo num lugar, descobrir novidades no feed, ofertas “só para membros” |
| **Operador LAB** (interno) | Equipe que sobe produtos | Configurar produto/PDF/capa por arquivo de config, sem mexer em UI |

### Jornada pós-compra (alvo)

```
Anúncio → LP → Checkout Cakto → purchase_approved (webhook)
   → upsert entitlement (email + offer.id → perfil/produtos)
   → e-mail com magic link (TTL curto)
   → clique → cookie httpOnly de sessão → Home (timeline)
   → Meus Produtos → Produto → PDF/vídeo
   → Ofertas especiais → Checkout Cakto → novo entitlement
```

Recuperação: tela “Reenviar link de acesso” (Pix em outro device, aba fechada).

<br>

## 4. Benchmark completo

### 4.1 Benchmark de funil/infoproduto (modelagem Luana — `/workspace/castro-zip/Info Receitas/PROJETO.md`)

Usar **só a estrutura** (não marca/textos):

- Produto barato em PDF (faixa R$ 10–18) + muitos order bumps (R$ 3,90–12,90) + upsell de assinatura/app.
- Mesmo molde repetido trocando o tema → nossa plataforma precisa ser **multi-produto por config**.
- Implicação para membros: bumps comprados = cards extras em “Meus Produtos”; não comprados = “Ofertas especiais”.
- Ponto a melhorar (área de entrega é fraca no mercado): entrega organizada, mobile-first, com feed que gera recompra.

### 4.2 Plataformas de membros (referências públicas — copiar estrutura, não visual)

| # | Referência | URL | O que copiar estruturalmente |
| --- | --- | --- | --- |
| 1 | Hotmart Club | https://hotmart.com/pt-br/club | Vitrine de produtos estilo “estante” com capas, módulos → aulas, padrão que o público BR já conhece |
| 2 | Teachable | https://teachable.com | Página de curso com currículo/módulos, progresso, botão “continuar de onde parou” |
| 3 | Circle | https://circle.so | Sidebar com espaços (conteúdo + comunidade), feed como home, combinação conteúdo + posts |
| 4 | Kajabi | https://kajabi.com | Library do membro + ofertas bloqueadas visíveis (upsell interno com cadeado) |
| 5 | NN/g — Empty states | https://www.nngroup.com/articles/empty-state-interface-design/ | Empty state que explica o estado + ação seguinte |
| 6 | Material 3 — Spacing | https://m3.material.io/foundations/layout/understanding-layout/spacing | Grid de 4/8 dp, consistência de espaçamento |

### 4.3 Padrões UX a adotar

- **Sidebar fixa** (desktop) → **bottom nav ou drawer** (mobile).
- **Home = continuar + novidades**: hero com vídeo de boas-vindas, “Seus produtos”, feed.
- **Cards de produto** com capa vertical (3:4), título, CTA único “Acessar”.
- **Upsell interno** com selo “Apenas para membros”, preço com âncora riscada, CTA distinto do “Acessar”.
- **Conteúdo bloqueado visível** (cadeado) → leva à oferta.
- **Estados explícitos**: pendente, vazio, loading (skeleton), erro.

<br>

## 5. Referências visuais

Arquivos em `/workspace/briefings/refs/` (anexar junto ao enviar ao Codex):

| Arquivo | Papel |
| --- | --- |
| `wireframe-blog-timeline-desktop-mobile.jpg` | **Imagem 1 — estrutura/layout** da timeline/blog inicial |
| `area-membros-vovo-maria.webp` | **Imagem 2 — estilo e IA** da área logada de membros |

> **Importante:** a Imagem 1 (wireframe grayscale, tema “viagem”, origem Pinterest) é **somente exemplo de estrutura/layout**. Não é identidade, tema nem conteúdo do produto. A Imagem 2 é referência de estilo/organização, não marca a copiar.

### 5.1 Imagem 1 — Wireframe timeline/blog (desktop + mobile, grayscale)

**Desktop (coluna única, container ~1200px):**

1. **Header**: logo à esquerda · nav central (5 links) · busca + botão primário pill (“Sign in”) à direita.
2. **Hero split**: esquerda = H1 grande em 3 linhas com palavra destacada em tom secundário, parágrafo curto, botão pill escuro; direita = colagem de 3 imagens (1 vertical grande + 2 menores empilhadas) sobre mapa decorativo.
3. **“Top Destinations” → nossa “Categorias/Coleções”**: título H2 + linha de chips/tabs filtráveis (“Popular”, região…, “More”) + botão outline “Explore all” à direita; grade de 4 cards verticais (imagem 3:4 + título + subtítulo).
4. **“Latest Stories” → nossas “Últimas publicações”**: H2 + botão outline “Read more articles”; layout 1 destaque grande à esquerda (imagem + categoria + título + meta data/tempo de leitura + excerpt) + lista de 3 itens à direita (thumb quadrada + categoria + título + meta).
5. **“Highlights” → nossos “Depoimentos/Destaques da comunidade”**: card de depoimento (avatar, nome, local, estrelas, título, texto) + carrossel de mídia (imagem + vídeo com play) + botão “Learn more”.
6. **Banda de newsletter** full-width (fundo cinza médio): H2 centralizado em 2 linhas, input + botão inline, microcopy legal.
7. **Footer**: logo + redes sociais; 4 colunas de links; barra inferior de copyright.

**Mobile (390px):** status bar · header (logo, busca, botão pill, hambúrguer) · hero empilhado (texto → colagem 1 grande + 2 pequenas → CTA centralizado) · categorias com dropdown “Popular” + carrossel horizontal de cards (peek do próximo card) + botão outline “Explore all” · últimas publicações = destaque full-width + lista de thumbs + botão “Read more articles”.

**Espaçamento observado:** seções separadas por ~64–80px desktop / ~48px mobile; títulos H2 com ~24px até o conteúdo; gutters de 16–24px; cantos arredondados ~8–12px; botões pill.

### 5.2 Imagem 2 — Área de membros “Cozinhando com a Vovó Maria”

- **Sidebar** verde-escuro (quase preto) com logo em selo branco no topo; itens com ícone + label: Início (ativo, pill destacada), Minhas Receitas, Módulos, Bônus, Meus Produtos, Suporte, Ofertas Especiais.
- **Saudação**: “Olá, seja bem-vindo(a)!” + subtítulo “Aqui estão todos os seus materiais”.
- **Hero** full-width com foto, headline em caixa alta à direita e **botão play** circular central (vídeo de boas-vindas).
- **“Seus Produtos”**: grade de 5 cards (capa mockup do ebook, título, botão verde “Acessar” full-width).
- **“Ofertas Especiais para Você”**: 3 cards horizontais (capa à esquerda; selo vermelho “Apenas para membros”; título; preço R$ 9,90 com âncora riscada R$ 19,90; botão vinho “Quero agora”).
- Estética warm/rustic, fundo creme, cards com sombra leve. Duas cores de CTA distintas: **acessar (verde)** vs **comprar (vinho)**.

### 5.3 Como combinar

- **Shell logado = Imagem 2** (sidebar + saudação + Seus Produtos + Ofertas).
- **Home/timeline dentro do shell = estrutura da Imagem 1** (hero, coleções, últimas publicações, destaques, banda CTA), adaptada a conteúdo de infoproduto (receitas, dicas, novidades, lançamentos).

<br>

## 6. Escopo do wireframe COMPLETO

| # | Tela | Rota sugerida | Auth |
| --- | --- | --- | --- |
| 1 | Login / pedir link mágico | `/entrar` | pública |
| 2 | Link enviado / verificar e-mail | `/entrar/enviado` | pública |
| 3 | Callback do magic link (erro/expirado) | `/entrar/verificar` | pública |
| 4 | Home / timeline | `/area` | membro |
| 5 | Post/artigo do feed | `/area/blog/[slug]` | membro |
| 6 | Categoria do feed | `/area/blog/categoria/[slug]` | membro |
| 7 | Meus Produtos | `/area/produtos` | membro |
| 8 | Página do produto | `/area/produtos/[produto]` | membro + entitlement |
| 9 | Módulo/material (PDF/vídeo) | `/area/produtos/[produto]/[modulo]` | membro + entitlement |
| 10 | Bônus | `/area/bonus` | membro |
| 11 | Ofertas especiais | `/area/ofertas` | membro |
| 12 | Produto bloqueado (sem entitlement) | estado de #8 | membro |
| 13 | Suporte / FAQ | `/area/suporte` | membro |
| 14 | Minha conta | `/area/conta` | membro |
| 15 | 404 / erro genérico | `not-found` / `error` | — |
| — | Estados: vazio, loading, PDF pendente, erro | em todas | — |

<br>

## 7. Sitemap / IA

```
/                      → redirect: /area (se sessão) ou /entrar
/entrar                → login magic link
  /enviado             → confirmação
  /verificar           → consome token → seta cookie → /area
/area                  (shell: sidebar + topbar)
  ├─ (home)            → timeline/blog
  ├─ /blog/[slug]
  ├─ /blog/categoria/[slug]
  ├─ /produtos         → Meus Produtos
  │    └─ /[produto]   → página do produto
  │         └─ /[modulo]
  ├─ /bonus
  ├─ /ofertas          → upsell interno
  ├─ /suporte
  └─ /conta
/api/webhooks/cakto    → STUB purchase_approved (não plugado)
/api/auth/magic-link   → STUB envio (não plugado)
```

**Navegação (sidebar):** Início · Meus Produtos · Módulos* · Bônus · Ofertas Especiais · Suporte · Conta.
*“Módulos” atalha para o último produto acessado; pode ser omitido no v1 (decisão Zed).

<br>

## 8. Telas em wireframe textual

Convenções: `[ ]` = bloco · espaçamentos em px (grid 4/8) · D = desktop ≥1024 · M = mobile 390.

### 8.1 Login / acesso (`/entrar`)

```
[Fundo neutro, card central max-w 420, padding 32 (M: 24)]
  [Logo/slot marca]                         mb 24
  [H1 "Acesse seus materiais"]              mb 8
  [Texto "Digite o e-mail usado na compra"] mb 24
  [Input e-mail, h 48]                      mb 16
  [Botão primário full "Enviar link de acesso", h 48]
  [Link "Não recebeu? Fale com o suporte"]  mt 16
```
- `/entrar/enviado`: ícone e-mail, “Enviamos um link para a***@…”, botão “Reenviar” (cooldown 60s), dica de spam.
- `/entrar/verificar` erro: “Link expirado ou já usado” + botão “Enviar novo link”.
- E-mail sem compra: mensagem neutra (não revelar se existe conta).

### 8.2 Shell logado

```
D: [Sidebar 240 fixa | Conteúdo max-w 1120, padding 32]
M: [Topbar 56: logo · avatar] + [Bottom nav 64: Início · Produtos · Ofertas · Mais]
Sidebar: logo (pad 24) · itens h 44, gap 4, ícone 20 + label · ativo = pill fundo slot-marca
         rodapé: "Sair"
```

### 8.3 Home / timeline (`/area`)

```
[Saudação H1 "Olá, {nome}!" + sub "Aqui estão seus materiais"]     mb 24
[Hero: imagem 16:7, radius 16, play central 64px, headline overlay] mb 48
   → vídeo de boas-vindas (slot); sem vídeo = esconder play
[H2 "Seus Produtos" + link "Ver todos"]                            mb 16
[Grade cards produto: D 5 col / M carrossel peek, gap 16]           mb 48
[H2 "Coleções" + chips filtro (Todas, Receitas, Dicas, Novidades)]  mb 16
[Grade 4 cards categoria 3:4 (M: carrossel)]                        mb 48
[H2 "Últimas publicações" + botão outline "Ver mais"]              mb 16
[D: destaque 7/12 (img, categoria, título, meta, excerpt)
    + lista 5/12 com 3 itens (thumb 96, categoria, título, meta)
 M: destaque full + lista]                                          mb 48
[H2 "Destaques da comunidade": card depoimento + mídia]             mb 48
[H2 "Ofertas especiais para você": 3 cards upsell (ver 8.6)]        mb 48
[Banda CTA full: "Receba novidades" / entrar no grupo — slot]       mb 32
```

### 8.4 Catálogo Meus Produtos (`/area/produtos`)

```
[H1 "Meus Produtos" + contador "4 materiais"]          mb 24
[Filtros: Todos · Principais · Complementos · Bônus]   mb 24
[Grade: D 4–5 col / tablet 3 / M 2 col, gap 16]
  Card: capa 3:4 radius 12 · título 2 linhas (16/600) · tag tipo
        · botão "Acessar" full (cor acessar)
        · estado PDF pendente: botão desabilitado + "Em breve"
[Seção "Você também pode gostar" → 3 ofertas não compradas]
```

### 8.5 Página do produto (`/area/produtos/[produto]`)

```
[Breadcrumb Meus Produtos / {produto}]                 mb 16
[Header: capa 200 (M: 120) | título H1, descrição curta,
         progresso "2 de 6 módulos", botão "Continuar"] mb 32
[Abas: Conteúdo · Bônus · Materiais]                   mb 24
[Lista de módulos: linha h 64, nº, título, tipo (PDF/vídeo),
         status (✓ visto / ● novo / 🔒), chevron]
[Módulo: viewer PDF embutido OU player vídeo 16:9 +
         botão "Baixar PDF" + "Marcar como concluído" + próximo/anterior]
```
- **Bloqueado** (sem entitlement): capa com cadeado, texto “Este material faz parte de {oferta}”, CTA comprar → Cakto.

### 8.6 Ofertas especiais / upsell interno (`/area/ofertas`)

```
[H1 "Ofertas especiais para você" + sub "Preço exclusivo para membros"]
[Grade D 3 col / M 1 col, gap 16]
  Card horizontal: capa 3:4 (120) | selo "Apenas para membros"
     · título · preço atual (24/700) + âncora riscada
     · botão "Quero agora" (cor comprar, distinta de acessar)
     → URL Cakto por config/env (nunca hardcode secret)
```
- Esconder ofertas cujo entitlement já existe.
- Preços vêm de config definida por Product (Zed); wireframe usa placeholders.

### 8.7 Módulos · Bônus · Suporte · Conta

- **Bônus**: grade igual Meus Produtos, tag “Bônus”; bônus bloqueados com cadeado.
- **Suporte**: FAQ accordion (acesso, PDF não abre, reembolso, reenviar link) + botão contato (slot e-mail/WhatsApp, sem número hardcoded).
- **Conta**: e-mail (read-only), lista de compras (produto, data), “Reenviar link”, “Sair”.

### 8.8 Estados vazios, loading e erro

| Estado | Onde | Conteúdo |
| --- | --- | --- |
| Vazio — sem produtos | Meus Produtos | Ilustração slot, “Você ainda não tem materiais”, CTA “Ver ofertas” |
| Vazio — feed sem posts | Home | “Novidades chegam em breve”, mantém Seus Produtos |
| Vazio — sem ofertas | Ofertas | “Você já tem tudo! 🎉” |
| PDF pendente | Card/módulo | “PDF pendente — aguardando arquivo”, botão desabilitado, mostra `slot` em dev |
| Vídeo pendente | Hero/módulo | Esconde play ou aviso “Vídeo em breve” |
| Loading | Todas | Skeleton nos formatos reais (cards 3:4, linhas 64) — sem spinner de página inteira |
| Erro | Todas | `error.tsx`: mensagem + “Tentar de novo” + link Suporte |
| Sessão expirada | Shell | Redirect `/entrar?expirado=1` com aviso |

<br>

## 9. Design tokens sugeridos (neutros + slot de marca)

> UI desta base = **estrutura**. Visual final depois (Lucas/Pike). Tokens via CSS variables.

### Espaçamento (grid 4/8)

| Token | px |
| --- | --- |
| `--space-1` | 4 |
| `--space-2` | 8 |
| `--space-3` | 12 |
| `--space-4` | 16 |
| `--space-6` | 24 |
| `--space-8` | 32 |
| `--space-12` | 48 |
| `--space-16` | 64 |

Seções: 48 (M) / 64 (D). Gutter grade: 16. Container: 1120 + padding 32 (D) / 16 (M).

### Tipografia

| Token | Tamanho/linha/peso |
| --- | --- |
| `display` | 40/48/700 (M 32/40) |
| `h1` | 32/40/700 (M 26/34) |
| `h2` | 24/32/700 |
| `h3` | 18/26/600 |
| `body` | 16/24/400 |
| `small` | 14/20/400 |
| `caption` | 12/16/500 |

Fonte: slot `--font-display` + `--font-body` (default system sans). Corpo mínimo 16 (público 30–60 anos).

### Cores

| Token | Default neutro | Uso |
| --- | --- | --- |
| `--color-bg` | #FAFAF9 | fundo |
| `--color-surface` | #FFFFFF | cards |
| `--color-border` | #E7E5E4 | divisórias |
| `--color-text` | #1C1917 | texto |
| `--color-muted` | #78716C | meta |
| `--brand-sidebar` | slot (ex. verde escuro) | sidebar |
| `--brand-access` | slot (ex. verde) | CTA acessar |
| `--brand-buy` | slot (ex. vinho) | CTA comprar |
| `--brand-badge` | slot (ex. vermelho) | selo membros |

Raio: 8 (inputs), 12 (cards), 16 (hero), 999 (pills). Contraste AA. Alvos de toque ≥ 44px.

<br>

## 10. Requisitos de conteúdo (slots)

Tudo em config (padrão `src/config/members.ts` do isabella-membros), com `slot` legível e `url: null` = pendente.

| Slot | Formato | Owner |
| --- | --- | --- |
| Capa produto | 3:4, PNG/WebP ≥ 900×1200 | Riccele (gate pack/assets) |
| PDF módulo | PDF ou URL https | Riccele / factory |
| Vídeo boas-vindas | URL embed | Riccele |
| Hero imagem | 16:7, ≥ 1600 px | Riccele |
| Copy produto (título, descrição curta ≤ 140) | texto | Marketing (Rodri) |
| Post do feed (título, categoria, excerpt, corpo, imagem) | MD/MDX | Marketing |
| Preço/âncora/checkout URL | config/env | Product (Zed) |
| Depoimentos | texto + avatar (com permissão) | Marketing |

Links finais de assets vão para o hub Drive (pasta 04 Packs): https://drive.google.com/drive/folders/10rbduNFcsHrbkgTgzH0fZGwVDvE2CmM0

<br>

## 11. Requisitos técnicos da base Codex (Brief Tech — Alisson)

### 11.1 Stack (espelhar `isabella-membros`, sem stack nova)

- Next.js App Router + React 19, TypeScript, Vercel.
- Referência: `/workspace/isabella-membros/README.md` (config de slots, Cakto por env).

### 11.2 O que o Codex gera primeiro

1. Skeleton App Router: rotas login/área/empty (seção 7).
2. Wireframe das telas: shell + empty states (UI só estrutura).
3. Modelo de **entitlement**: `offer.id` (Cakto) → perfil → produtos liberados.
4. **Stubs** (não plugados): webhook `purchase_approved` e envio de magic link.

### 11.3 Constraints

- Auth = **magic link** (ADR-001, status *Proposed*) + entitlement via webhook Cakto.
- Sessão em **cookie httpOnly**.
- **Sem** secrets/API keys no repo; `.env.example` só com nomes, sem valores.
- **Sem** senha demo nem `?demo=` em URL pública.
- **Sem** criar webhook, CTA ou publish na Cakto. Cakto = **só contrato de payload** (`customer.id`, `customer.email`, `offer.id`, `data.id`) — ver `/workspace/tech-prep-lp/` (ADR-001, `specs/cakto-webhook-members-access.spec.md`, CASTRO-CHECKLIST).
- Rotas `/area/*` protegidas server-side (middleware/layout) — não só esconder no client.

### 11.4 Fora desta base

Pixel/ads, n8n, capas na Cakto, oferta Completo R$ 47,90 (SKU aberto).

### 11.5 Handoffs

| Para | Recebe |
| --- | --- |
| **Lucas** (front) | Rotas + wireframe estáveis + tokens + empty states → UI real + CTAs gated |
| **Iago** (back) | Contratos webhook/auth, ADR → implementação server-side |

### 11.6 Repositório

GitHub; branch por feature; PR com screenshots D/M; README com como rodar e env placeholders.

<br>

## 12. Critérios de aceite

- [ ] Todas as rotas da seção 6 existem e navegam (D e M 390px).
- [ ] Shell segue IA da Imagem 2; home segue estrutura da Imagem 1.
- [ ] Todo estado da tabela 8.8 é visível (fixtures/mocks).
- [ ] Entitlement de mock decide: Meus Produtos vs bloqueado vs Ofertas.
- [ ] Tokens em CSS variables; trocar slot de marca muda tema sem editar componentes.
- [ ] Nenhum secret, senha demo ou `?demo=` no código/URL.
- [ ] Stubs webhook/magic link com tipos do payload e TODO claro; não fazem chamada externa.
- [ ] `build` e `lint` verdes.
- [ ] README com env placeholders sem valores.
- [ ] Zero deploy de produção sem go LAB/Alisson.

<br>

## 13. Próximos passos

1. LAB cola este .md + 2 imagens no Codex.
2. Codex gera wireframe + skeleton (PR no GitHub).
3. Review **Design (Pike)** — IA/espaçamento; **Tech (Alisson)** — stack/constraints; **Product (Zed)** — acesso vs upsell.
4. Handoff Lucas (UI) e Iago (webhook/auth).
5. Riccele fecha pack/assets → links no hub Drive.
6. LAB recebe só links finais.

<br>

## 14. Anexo A — Checklist de pesquisa ainda necessária

- [ ] Tese acesso vs upsell (Zed): o que fica bloqueado visível, quantas ofertas na home.
- [ ] Viewer PDF embutido vs download (mobile Android/iOS) — Alisson.
- [ ] Provedor de e-mail do magic link e domínio remetente — Alisson/Iago.
- [ ] Feed: MDX no repo vs CMS — Tech + Marketing.
- [ ] Bottom nav vs drawer no mobile — Pike.
- [ ] Teste rápido com 3–5 compradoras reais (acesso pós-Pix).
- [ ] Benchmark adicional: áreas de membros BR (Kiwify, Cakto members) — Marketing.

<br>

## 15. Anexo B — Skills / ferramentas recomendadas pro Codex

| Skill | Para quê | Quando pedir |
| --- | --- | --- |
| `frontend-design` | Direção visual, hierarquia, tipografia intencional | Wireframe e shell |
| `ui-ux-pro-max` | Specs de componentes, estados, responsivo | Telas da seção 8 |
| `react-best-practices` / composição | Server vs client components, App Router limpo | Skeleton |
| `writing-plans` | Plano em etapas antes de codar | Início |
| `verification-before-completion` | Rodar build/lint e provar critérios de aceite | Antes do PR |
| `replica` (opcional) | Só se for clonar molde de página existente | Não para identidade nova |

<br>

## 16. Mensagem pronta para LAB colar no Codex

```text
Oi Codex. Anexo o briefing "2026-10-30-briefing-codex-area-membros-wireframe.md" e 2 imagens de referência. Leia o .md inteiro antes de agir.

O que é: a base de uma plataforma de membros onde cada infoproduto é uma página/card dentro da área logada, com uma timeline/blog como home.

Primeira entrega (só isso):
1) Wireframe completo de todas as telas da seção 6 (desktop + mobile 390px), incluindo estados vazios/loading/erro.
2) Skeleton Next.js App Router + React 19 + TypeScript (igual isabella-membros): rotas, shell, modelo de entitlement (offer.id -> perfil -> produtos) e stubs NÃO plugados de webhook purchase_approved e magic link.
UI só estrutura; visual final vem depois com o time.

Referências visuais:
- Imagem 1 (wireframe grayscale de blog): SOMENTE estrutura/layout da home/timeline. Não é identidade nem tema.
- Imagem 2 (área de membros Vovó Maria): estilo e organização da área logada (sidebar, Seus Produtos, Ofertas). Não copiar marca.

Constraints (não negociáveis):
- Sem secrets/API keys no repo; .env.example só com nomes.
- Sem senha demo nem ?demo= em URL pública.
- Sem criar webhook, CTA, publish ou deploy de produção. Cakto = só contrato de payload.
- Fora de escopo: pixel/ads, n8n, capas na Cakto, oferta R$ 47,90.
- Owners: Tech Alisson (go de deploy), Design Pike, Product Zed (preços/acesso), Riccele (pack/assets). Nada vai pra produção sem go LAB/Alisson.

Ative/use estas skills se tiver: writing-plans (planejar antes), frontend-design e ui-ux-pro-max (telas e estados), react-best-practices (App Router), verification-before-completion (build/lint verdes + checklist da seção 12 antes de entregar). replica só se eu pedir clone de molde.

Antes de começar: me devolva um plano curto e confirme que entendeu os constraints. Ao final: PR no GitHub com screenshots desktop/mobile e checklist da seção 12 marcado.
```
