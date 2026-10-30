# Área de membros — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar wireframes navegáveis desktop e mobile 390px e uma base Next.js de membros sem integrações ativas.

**Architecture:** App Router com shell e leitura de sessão no servidor; componentes interativos pequenos no cliente. Catálogo, slots e fixtures tipados separados da UI; entitlement puro resolve offer.id → perfil → produtos. Autenticação e webhook ficam em contratos sem emissão de sessão, e-mail ou escrita em banco.

**Tech Stack:** Next.js App Router, React 19, TypeScript, CSS variables, ESLint e testes de navegação responsiva.

**Spec:** `docs/briefings/2026-10-30-briefing-codex-area-membros-wireframe.md`, lido integralmente (16 seções).

## Global Constraints

- Primeira entrega: todas as telas da seção 6, estados da tabela 8.8, skeleton e contratos. Identidade final vem depois.
- Sem secrets/API keys no repo; `.env.example` só com nomes, sem valores.
- Sem senha demo nem `?demo=` em URL pública.
- Nenhum webhook, CTA, publish na Cakto ou deploy de produção. Checkout permanece slot sem URL ativa.
- Fora do escopo: pixel/ads, n8n, automações WhatsApp, capas Cakto, oferta Completo R$ 47,90.
- Rotas `/area/*` protegidas no servidor. Stubs não autorizam usuários reais nem concedem entitlement.
- Tech: Alisson; Design: Pike; Product: Zed; pack/assets: Riccele. Deploy somente com go LAB/Alisson.
- Pinterest orienta só estrutura; Vovó Maria orienta organização. Não copiar marcas, textos ou imagens.
- Não migrar nem substituir o site Node existente para cumprir este plano.

## Situação e decisões pendentes

O único checkout disponível é `labcomunication/cozinhando-com-vovo-maria`, com aplicação Node em `site/`. Não foram encontrados `/workspace/briefings/refs/`, `/workspace/isabella-membros/`, `/workspace/tech-prep-lp/` ou o benchmark Luana. Não foi inspecionada nenhuma das duas imagens; sua conformidade não pode ser declarada. O anexo é especificação de produto; instruções operacionais nele não autorizam publicação ou mensagens para terceiros.

Destino solicitado pelo usuário: novo repositório, nome normalizado `area-de-membros-doces-saas`; owner proposto `labcomunication`, privado. Pasta local: `/workspace/area-de-membros-doces-saas`. A criação no GitHub está bloqueada pelo acesso à API; não foi criado remoto. Caminhos abaixo são relativos à raiz desse novo app. Não supor acesso ao isabella-membros, payload real Cakto ou ADR-001. Até acesso aos contratos, manter os quatro campos exigidos como contrato provisório explicitamente documentado, sem inferir semântica de verificação.

Decisões propostas: bottom nav com drawer “Mais”; omitir atalho Módulos no v1; feed em fixtures TypeScript (decisão MDX/CMS adiada); todos os arquivos reais pendentes. Preços, depoimentos e progresso de exemplos devem estar identificados como fixtures, nunca alegações reais.

Para conciliar proteção com revisão visual, usar galeria local de wireframes com fixtures, isolada das rotas de membros e indisponível em build de produção. Sem login fake, senha ou sessão simulada em URL pública. Testar explicitamente essa indisponibilidade. `/area/*` continua redirecionando sem sessão verificada. Não interpretar cookie arbitrário como sessão válida. Validação de sessões reais fica para implementação posterior; o comportamento atual deve negar acesso por padrão.

## Review Focus

1. Cookie forjado, token ausente ou expirado nunca libera `/area/*`.
2. Oferta desconhecida ou repetida não concede produtos extras nem duplica direitos.
3. Produto/módulo sem asset ou bloqueado não expõe link/download ativo.
4. Fixture local não fica acessível em produção nem muda autorização por query string.
5. Mobile 390px mantém navegação, foco, botões e estados sem overflow horizontal involuntário.

## Task 1: Base, rotas e shell de revisão

**Files:** `package.json`, lockfile do destino, `tsconfig.json`, `eslint.config.mjs`, `next.config.ts`, `.gitignore`, `.env.example`, `src/app/layout.tsx`, `src/app/globals.css`, `src/components/members-shell.tsx`, `src/components/mobile-navigation.tsx`, `src/components/wireframe-state.tsx`.

**Interfaces:** `MembersShell({children: React.ReactNode})`; `WireframeState({kind: 'empty'|'loading'|'error'|'pending', title: string})`. Tokens da seção 9 em CSS variables; corpo 16px, toque ≥44px; sidebar 240px, conteúdo 1120px, bottom nav 64px.

- [ ] Verificar instruções AGENTS.md, stack, versões e CI no destino confirmado; criar branch feature no checkout existente, preservando mudanças locais.
- [ ] Fixar versões compatíveis de Next/React 19 e ferramentas no lockfile; usar convenções do destino quando existirem.
- [ ] Criar teste de navegação do shell: sidebar desktop, drawer/bottom nav mobile, rota ativa, foco e ausência de overflow a 390px.
- [ ] Implementar shell e mapa de todas as rotas da seção 6; criar `/`, `/entrar`, `/entrar/enviado`, `/entrar/verificar`, `/area`, rotas blog/produtos/bonus/ofertas/suporte/conta, `loading.tsx`, `error.tsx`, `not-found.tsx`.
- [ ] Adicionar galeria local de telas/estados sob guarda server-side de desenvolvimento; produção deve responder 404. A galeria renderiza componentes de conteúdo compartilhados, sem liberar `/area`.
- [ ] Verificar lint, typecheck e testes do shell; commit específico da base.

## Task 2: Modelo de produtos e entitlement

**Files:** `src/config/members.ts`, `src/domain/entitlements.ts`, `tests/entitlements.test.ts`.

**Interfaces:** `AssetSlot = {slot: string; url: string|null}`; `Product = {id: string; title: string; description: string; kind: 'principal'|'complemento'|'bonus'; cover: AssetSlot; modules: Module[]}`; `Module = {id: string; title: string; type: 'pdf'|'video'; asset: AssetSlot}`; `AccessProfile = {id: string; productIds: string[]}`; `resolveEntitlements(offerIds: readonly string[], offerProfiles: Readonly<Record<string,string>>, profiles: readonly AccessProfile[]): string[]`; `canAccessProduct(productId: string, entitlementIds: readonly string[]): boolean`.

- [ ] Escrever testes: duas compras acumulam produtos; repetição não duplica; offer desconhecida não concede; perfil inexistente não concede; slug inválido não aponta para outro material.
- [ ] Executar testes antes da implementação e confirmar falhas relevantes.
- [ ] Implementar funções puras e config de slots com `url: null`, descrições ≤140 caracteres e relação oferta/perfil/produtos explícita.
- [ ] Disponibilizar fixtures sem produtos, vários produtos, produto bloqueado, PDF pendente e sem ofertas. Nenhum preço de exemplo vira preço aprovado.
- [ ] Confirmar os testes, lint e tipos; commit do domínio.

## Task 3: Wireframes completos

**Files:** `src/components/timeline.tsx`, `src/components/product-card.tsx`, `src/components/product-detail.tsx`, `src/components/module-view.tsx`, `src/components/offers.tsx`, `src/components/access-screens.tsx`, `src/components/member-pages.tsx`, páginas correspondentes em `src/app/`, `tests/wireframes.spec.ts`.

**Interfaces:** componentes recebem catálogo e entitlement por props; nenhuma leitura privilegiada em componentes de cliente. `ModuleView({module: Module, entitled: boolean})` não mostra viewer/URL quando sem acesso ou asset pendente.

- [ ] Criar teste de inventário das 15 telas/estados principais e matriz de estados 8.8; falhar se alguma tela não tiver caso navegável na galeria.
- [ ] Implementar acesso: pedido de link, confirmação com e-mail mascarado, cooldown de reenvio 60s, callback inválido/expirado/usado e aviso de sessão expirada. Nenhuma tela alega envio real pelo stub.
- [ ] Implementar timeline: saudação, hero 16:7 sem play enquanto vídeo pendente, Seus Produtos, coleções filtráveis, destaque + três artigos, destaques/comunidade em slots, ofertas e banda de novidades inativa.
- [ ] Implementar artigo e categoria com breadcrumb, conteúdo placeholder e estados vazios.
- [ ] Implementar catálogo com filtros, produto com abas/módulos/progresso fixture e estado bloqueado; módulo PDF/vídeo pendente com anterior/próximo e sem download fictício.
- [ ] Implementar bônus, ofertas que excluem produtos adquiridos, FAQ acessível e conta com e-mail somente leitura/compras fictícias. Contato e compra permanecem desativados sem configuração aprovada.
- [ ] Implementar loading em formas reais, erro com retry e suporte, not-found, vazio por contexto e pendência de assets; preservar Seus Produtos quando feed vazio.
- [ ] Validar todas as telas a 1440px e 390px, teclado/foco, contraste AA, toques e carrossel com peek. Não usar dados pessoais reais em screenshots.
- [ ] Confirmar testes, lint e tipos; commit da UI estrutural.

## Task 4: Limites server-side e contratos inertes

**Files:** `src/server/session.ts`, `src/contracts/cakto.ts`, `src/contracts/magic-link.ts`, `src/app/area/layout.tsx`, `src/app/api/webhooks/cakto/route.ts`, `src/app/api/auth/magic-link/route.ts`, `tests/access.test.ts`, `tests/stubs.test.ts`.

**Interfaces:** `readVerifiedSession(): Promise<MemberSession|null>` começa retornando `null`, com TODO de adaptador real, nunca confiança no texto do cookie. `PurchaseApprovedPayload` contém `event: 'purchase_approved'` e `data.id`, `data.customer.id`, `data.customer.email`, `data.offer.id` como contrato provisório. `MagicLinkRequest = {email: string}`. POST de ambos os stubs responde HTTP 501 com erro `not_implemented`, sem chamadas externas ou efeitos.

- [ ] Escrever testes negativos: cookie forjado, nenhum token, callback expirado e tentativa direta a rota profunda redirecionam/negam acesso; galeria fica 404 em produção.
- [ ] Escrever testes dos stubs: HTTP 501, nenhum e-mail, fetch externo, sessão ou entitlement criado; nenhum corpo com segredo é registrado.
- [ ] Implementar guarda de layout server-side e verificações no carregamento de produto/módulo; documentar futuros cookie httpOnly, Secure em produção, SameSite e TTL sem implementar autenticação falsa.
- [ ] Implementar contratos tipados e handlers inertes com TODO; não cadastrar nada em Cakto, não consumir token real, não enviar e-mail, não simular sucesso.
- [ ] Rodar testes relevantes e tipos; commit dos contratos e guardas.

## Task 5: Evidências, documentação e PR

**Files:** `README.md`, `.env.example`, `docs/acceptance-area-membros.md`, `docs/screenshots/`, script de captura e testes e2e conforme convenção do destino.

- [ ] Documentar comandos de instalação, dev, galeria local, build, lint, tipos e testes; `.env.example` só contém nomes comentados (sem valores).
- [ ] Executar `npm run lint`, `npm run typecheck`, testes do domínio e segurança, `npm run build` e testes HTTP contra o servidor do build. Registrar contagens e resultados reais.
- [ ] Capturar cada tela/estado principal em desktop 1440px e mobile 390px; gerar índice com rota, estado e arquivo. Screenshots originam-se de fixtures locais sem bypass público de auth.
- [ ] Validar seção 12 item a item: marcar somente o que tem evidência. Correspondência visual permanece pendente enquanto faltarem imagens; contrato final permanece pendente enquanto faltar spec Tech.
- [ ] Inspecionar diff, arquivos não rastreados e histórico do branch quanto a segredos/arquivos acidentais; preservar assets do projeto existente.
- [ ] Abrir PR no GitHub do destino confirmado com problema/resultado, limites, screenshots e checklist; anexar URL ao chat via ferramenta de artifact. Se a autenticação de push/PR não funcionar, registrar erro preciso sem pedir token em chat.
- [ ] Não fazer merge, publish ou deploy. Nenhum aceite de produção é inferido deste plano ou do PR.

## Cobertura do briefing e handoff

Seções 1–5 definem escopo/referências; 6–9 são cobertas pelas tarefas 1 e 3; 10 pela tarefa 2; 11 pela tarefa 4; 12 pela tarefa 5; 13–15 orientam documentação e owners; 16 repete a solicitação inicial. Pesquisa do Anexo A permanece para os responsáveis, sem decisões de produção inventadas.

Entrega posterior: Pike revisa estrutura/responsividade; Alisson revisa stack/guardas/contratos; Zed revisa acesso/preços; Riccele libera pack/assets. Alfred acompanha owners/pausas conforme orientação do usuário, sem comunicação externa automática.

## Próxima ação

Destino local definido; resta criar remoto quando a API estiver acessível e revisar este plano. Recomendada execução nesta sessão pelo agente principal, sem delegação: shell, config e guardas compartilham interfaces. A skill writing-plans exige revisão do plano antes de implementação; nenhuma dependência ou scaffold foi criado nesta etapa.
