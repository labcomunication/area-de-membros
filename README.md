# Área de membros — SaaS

Base de wireframes para uma biblioteca de infoprodutos com timeline editorial. **Next.js App Router, React 19 e TypeScript.** Interface estrutural, conteúdo fictício e assets pendentes; sem integrações ativas ou deploy.

## Rodar localmente

Requer Node.js 24 LTS e npm. Não é necessário configurar credenciais para revisar os wireframes.

```sh
npm ci
npm run dev
```

Abra a rota **`/wireframes`** no servidor local. Selecione uma das 15 telas, o perfil de acesso fictício e os estados normal, vazio, loading, erro, pendente e sessão expirada. A galeria só funciona em desenvolvimento; no build de produção retorna **404**, independentemente dos parâmetros da URL. Não existe senha de demonstração nem query pública de bypass.

`/` leva a `/entrar`. Todas as rotas `/area/*` negam acesso no servidor até a implementação da autenticação real. Esse bloqueio é intencional: um cookie arbitrário nunca libera acesso. Layout e camada de leitura repetem a guarda; `src/proxy.ts` impede streaming do shell protegido antes do redirecionamento.

## Verificar

```sh
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
TEST_PRODUCTION=1 npm run test:e2e
```

Os testes de navegador usam Chromium em `/usr/bin/chromium`. Em outra máquina, aponte `CHROMIUM_PATH` para o executável instalado. Playwright inicia e encerra seu próprio servidor; mantenha a porta 3000 livre. Os projetos desktop (1440px) e mobile (390px) validam telas, estados, navegação, filtros, acesso, stubs e acessibilidade automatizada. Casos da galeria são explicitamente ignorados em produção; o bloqueio da galeria é testado no servidor do build, sem publicação externa.

Para gerar evidências, mantenha `npm run dev` em outro terminal e execute:

```sh
npm run screenshots
```

Veja o [índice de screenshots](docs/screenshots/README.md) e o [checklist de aceite](docs/acceptance-area-membros.md). Screenshots são de fixtures locais; não representam sessões reais, preços aprovados ou produtos entregues.

## Organização

- `src/app/`: rotas App Router, boundaries de loading/erro/404 e APIs inertes.
- `src/components/`: shell, timeline, produtos, materiais, login e estados compartilhados.
- `src/config/members.ts`: catálogo, slots (`url: null`), perfis e ofertas fictícios; configuração de navegação em `src/config/navigation.ts`.
- `src/domain/entitlements.ts`: resolução pura `offer.id → perfil → produtos`, união de compras e negação de ofertas desconhecidas.
- `src/server/`: fronteira de autenticação e leitura protegida. O adaptador de sessão retorna `null` até a integração real.
- `src/contracts/`: tipos provisórios de webhook e magic link, com TODOs para o handoff Tech.
- `tests/`: testes de domínio/segurança e navegação real com Playwright + axe.

Tokens de espaçamento, tipografia e cor estão em CSS variables em `src/app/globals.css`. A marca provisória é neutra; troque `--brand-sidebar`, `--brand-access`, `--brand-buy`, `--brand-badge` e fontes sem reescrever os componentes. Marca/copy e arquivos finais ainda dependem de revisão.

## Rotas

| Rota | Comportamento nesta base |
|---|---|
| `/` | Redireciona para acesso |
| `/ajuda` | FAQ público acessível sem sessão |
| `/entrar` | Solicitação de magic link; erro honesto enquanto o stub está inativo |
| `/entrar/enviado` | Confirmação ilustrativa na galeria; na rota real não alega envio |
| `/entrar/verificar` | Token indisponível/expirado; não cria sessão |
| `/area` | Timeline; exige sessão verificada |
| `/area/blog/[slug]` | Artigo protegido |
| `/area/blog/categoria/[slug]` | Categoria protegida |
| `/area/produtos` | Biblioteca protegida |
| `/area/produtos/[produto]` | Coleção e estado bloqueado por entitlement |
| `/area/produtos/[produto]/[modulo]` | Material protegido, PDF/vídeo pendente |
| `/area/bonus`, `/area/ofertas` | Bônus e ofertas protegidos |
| `/area/suporte`, `/area/conta` | FAQ e conta protegidos |
| `/api/auth/magic-link` | POST retorna 501, sem e-mail ou cookie |
| `/api/webhooks/cakto` | POST retorna 501, sem grants ou efeitos externos |
| `/wireframes` | Galeria exclusivamente de desenvolvimento |

## Integrações e variáveis futuras

`.env.example` contém **apenas nomes comentados**, sem valores. Nenhuma variável é necessária para esta etapa. Os slots do catálogo desta base ficam sem URL; conteúdos privados reais devem vir de um adaptador server-side autorizado, sem inserir URLs privadas no manifesto importado pelo cliente. Não coloque secrets, dados de clientes ou chaves em Git. O contrato provisório Cakto declara `data.id`, `customer.id`, `customer.email` e `offer.id` sob evento `purchase_approved`; ele precisa ser reconciliado com ADR-001/spec Tech antes de qualquer implementação real.

Magic link ainda exige provedor, TTL curto, token de uso único, respostas neutras e limites de requisição. Sessão futura deve usar cookie httpOnly, Secure em produção, SameSite e validação no servidor. Persistência, envio de e-mail, assinatura de webhook, idempotência e revogações não foram implementados. Não cadastrar webhook ou checkout na Cakto a partir desta base.

## Revisão e limites

- Design: Pike; Tech: Alisson; Product: Zed; pack/assets: Riccele.
- As duas imagens de referência e os projetos `isabella-membros` e `tech-prep-lp` não estavam disponíveis. Estrutura baseada na descrição textual do briefing; fidelidade às imagens e contrato Tech final permanecem pendentes.
- Sem identidade final, preços reais, PDFs/vídeos reais, pixels/ads, n8n ou automações. A oferta Completo R$ 47,90 está fora do escopo.
- **Nenhum deploy de produção, merge ou publish é autorizado por este código. Exige go LAB/Alisson.**

[Briefing integral](docs/briefings/2026-10-30-briefing-codex-area-membros-wireframe.md) · [Plano](docs/superpowers/plans/2026-10-30-area-membros-wireframe.md)

## Revisão de blocagem e pacote visual (v0.2)

A home prioriza uma próxima ação vinculada a produto adquirido e a biblioteca antes das boas-vindas. Menu lateral desktop e navegação inferior mobile permanecem fixos; toolbar da galeria é sticky, menu interno acomoda janelas baixas e o drawer devolve foco ao fechar/Escape.

- [Pesquisa de padrões e mercado](docs/reviews/2026-10-30-market-blocks.md)
- [Relatório do remapeamento](docs/reviews/2026-10-30-layout-remap.md)
- [Style guide — PDF](docs/design/style-guide.pdf)
- [Design system — PDF](docs/design/design-system.pdf)
- [Tokens, HTML/Markdown e contraste](docs/design/README.md)
- [Demonstrações de rolagem desktop/mobile](docs/scroll-demos/README.md)

A galeria React continua neutra, com a paleta completa e os componentes futuros descritos nos documentos. A prévia HTML recebeu uma revisão visual independente: sidebar branca, ativo lavanda/vinho e canvas suave. Não houve aplicação da identidade na aplicação ou deploy.

Regenerar documentos: `npm run docs:design` (Python 3 + Chromium). Regenerar demonstrações: com `npm run dev` ativo, execute `npm run demo:scroll` (Chromium + FFmpeg do sistema). Quadros da demonstração são capturas do app reproduzidas a 12fps; não representam gravação em tempo real.

## Abrir sem instalar o projeto

[Baixe a prévia offline](docs/preview/wireframe.zip), extraia e abra wireframe.html no Chrome/Edge. São 39 telas/variantes com dados fictícios, navegação animada, nova família de mascotes com olhar esférico, mapa de ideias conectável e anotações em janela flutuante. Compras, login e IA continuam sem integração. Funciona sem servidor cloud ou rede; não substitui a aplicação React. [Detalhes](docs/preview/README.md).

A Home reúne próximo passo, biblioteca, publicações e ofertas. A revisão inclui menu compacto fixo no topo, cinco ofertas ilustrativas com rodapés alinhados e mascote centralizado com olhar esférico, pontilhado reativo, hover, expressão feliz e nervosismo por cliques rápidos. A revisão mais recente aplica Noto Sans local, superfícies sem contornos e cantos contínuos, amplia as capas de Você também pode gostar com painel sobreposto e acrescenta um quadro de nós com texto/imagens locais. A geração de PDF permanece desativada. [Capturas desktop/mobile](docs/screenshots/README-preview.md) · [Checklist](docs/preview/acceptance.md).
