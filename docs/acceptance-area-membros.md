# Aceite — base da área de membros

Escopo desta entrega: wireframes e skeleton. Auth, pagamentos, entrega de arquivos e identidade final não estão habilitados. Sem deploy externo.

## Checklist da seção 12

- [x] Todas as rotas da seção 6 existem. As telas são navegáveis na galeria de desenvolvimento a 1440px e 390px; `/area/*` exige autenticação e nega acesso nesta base.
- [ ] Comparação direta com as duas imagens de referência. Sidebar, biblioteca/ofertas e timeline seguem a descrição textual, mas os arquivos de imagem não foram disponibilizados; revisão visual Pike pendente.
- [x] Estados vazio, loading, erro, pendente e sessão expirada disponíveis para cada uma das 15 telas na galeria. Home sem posts preserva a biblioteca; vídeo/PDF têm pendência explícita.
- [x] Entitlement decide biblioteca, produto bloqueado, bônus e ofertas. Fixtures Essencial, Organizado, Sem produtos e Todos são exclusivamente locais.
- [x] Tokens em CSS variables; slots de marca e fontes independem dos componentes.
- [x] Nenhum secret, senha de demonstração ou parâmetro de bypass público. `.env.example` só contém nomes comentados. Dados de teste usam domínio reservado `.test`.
- [x] Stubs tipados e com TODOs: HTTP 501, sem chamadas externas, cookies ou concessão de acesso.
- [x] Build e lint verdes; TypeScript e testes de domínio/segurança também passaram.
- [x] README documenta instalação, execução, testes, galeria, screenshots e env placeholders sem valores.
- [x] Zero deploy de produção. Nenhum webhook, CTA ou publish criado na Cakto. Go LAB/Alisson continua necessário.

## Evidência automatizada

- `npm run lint`: passou.
- `npm run typecheck`: passou.
- `npm test`: 7 testes passaram (união/deduplicação, ofertas desconhecidas/perfis ausentes/chaves herdadas, acesso exato, sessão ausente, stubs inertes).
- `npm run test:e2e`: 69 passaram; 3 casos exclusivos de produção ignorados de forma explícita. Projetos Chromium desktop 1440×1000 e mobile 390×844.
- `npm run build`: passou, com todas as rotas App Router esperadas e Proxy de negação antecipada.
- A11y: axe WCAG A/AA nas telas home, login, catálogo, produto e suporte, em ambas as dimensões. Isso não substitui uma auditoria manual completa.
- Matriz de estados: testes percorrem as 15 telas para cada estado não normal.
- HTTP: sem sessão e com cookie forjado não acessam rotas profundas; callback não valida token arbitrário; formulário não alega entrega do e-mail pelo stub.

Capturas: 40 PNGs, incluindo as 15 telas em ambas as dimensões e cinco estados representativos. [Índice de capturas](screenshots/README.md).

`TEST_PRODUCTION=1 npm run test:e2e`: **10 passaram**, **62 casos exclusivos da galeria ignorados explicitamente**. Galeria devolve 404, rotas protegidas negam acesso, ajuda pública responde e stubs ficam inertes.

`npm ci` pelo lockfile foi executado novamente com sucesso antes do build final.

## Limites e handoff

1. Assets reais (capas/PDF/vídeo/hero) aguardam Riccele; preços, âncoras e checkout aguardam Zed. Slots são legíveis e `url: null`; controles de compra/download estão desabilitados.
2. Contrato Cakto é provisório até receber ADR-001 e `tech-prep-lp`; não há validação de assinatura, persistência, idempotência ou revogação real. Iago/Alisson recebem contratos e TODOs.
3. Magic link não envia e-mail nem gera sessão; adaptador retorna `null`. Cookie httpOnly/Secure/SameSite, uso único, TTL, rate limits e provedor pertencem à etapa de backend.
4. Conteúdo editorial está em fixtures TypeScript. MDX/CMS, atalho Módulos, viewer real e canais de contato continuam decisões posteriores.
5. `isabella-membros` e imagens de referência não estavam disponíveis; não se afirma equivalência ao código ou fidelidade visual a materiais não inspecionados.
6. Não houve pixel/ads, n8n, automação de WhatsApp, capas/checkout/webhook Cakto ou oferta Completo R$ 47,90.
7. Revisões finais: Pike (IA/responsividade), Alisson (stack/acesso), Zed (produtos/ofertas) e Riccele (pack/assets).

## Decisões de implementação

- Galeria local separada das rotas protegidas: permite revisar fixtures sem autenticação falsa ou bypass em produção.
- Sessão negada por padrão em Proxy, layout e leitura de páginas; o Proxy evita que streaming emita resposta 200 antes da guarda do layout.
- Shell usa sidebar desktop e bottom nav com drawer mobile; atalho Módulos omitido nesta etapa.
- Catálogo usa perfis de acesso e união de produtos. Recomendações abaixo do catálogo podem mostrar ofertas não adquiridas, sem confundi-las com a biblioteca.
- Cache npm da máquina cloud foi direcionado a `/workspace` durante instalação; não se exige esse caminho em outras máquinas.
- Base, UI, domínio e guardas são entregues em commit integrado para manter o skeleton executável; screenshots e documentação de evidência ficam em commit separado.

## Revisão independente e correções

Revisão de código independente não encontrou bypass atual de autorização. Corrigidos com regressões RED→GREEN: perfil preservado entre catálogo/produto/bônus/módulo; links editoriais com slug/categoria corretos; ajuda pública sem exigir sessão; seleção server-side que retém módulos de produtos não adquiridos. Nenhuma sessão real foi habilitada.

Limitações menores registradas para revisão posterior:

- Na galeria de desenvolvimento, IDs explícitos inválidos ainda recaem em fixtures padrão. As rotas reais validam IDs.
- Retorno de foco do drawer foi resolvido nesta rodada: fechar e Escape devolvem foco a Mais opções, com teste no mobile.

A revisão não certificou fidelidade a referências ausentes ou uma auditoria manual completa de acessibilidade. Go de produção continua fora desta entrega.

## Notas de reprodutibilidade

- `next-env.d.ts` é gerado pelo Next e ignorado para não sujar o Git ao alternar dev/build.
- ESLint está fixado em 9.39.5 por compatibilidade com os peers dos plugins React do Next. A ferramenta emite aviso de fim de suporte; migrar quando os plugins aceitarem a versão seguinte. Isso não altera dependências de runtime.
- Não foi criado worktree: o checkout cloud já é isolado. Ledger local foi mantido diretamente porque os scripts auxiliares da skill são recursos cloud, não executáveis locais.

## Publicação no GitHub

Branch `feat/members-wireframe` enviada e SHA remoto conferido com o local. A criação automática do PR falhou: API GraphQL do GitHub respondeu `Forbidden`. O acesso por Git continua funcionando. Nenhum PR foi criado automaticamente e nenhum merge/deploy foi realizado.

[Abrir formulário do PR](https://github.com/labcomunication/area-de-membros/pull/new/feat/members-wireframe) · [Descrição pronta para o PR](pr-description.md)

## Refinamento v0.2

Home remapeada para próxima ação → biblioteca → boas-vindas → conteúdo editorial. Menu fixo antes/depois de scroll e controles da revisão persistentes testados. Pesquisa consultou Open edX, Moodle e shadcn/ui; sites comerciais bloqueados não foram apresentados como observados.

Documentos independentes: style guide (6 páginas), design system (8 páginas), tokens JSON/CSS, contrastes calculados e referências. Paleta não aplicada ao app. PDFs validados quanto a número de páginas, texto e rodapé; exemplos de sidebar com 48px e foco offset 2px conferidos no navegador. Dois vídeos de quadros reais e quatro capturas de viewport demonstram rolagem; screenshots das 15 telas/estados atualizados.

Revisão independente não encontrou falhas críticas/importantes. Ajustes documentais de consistência foram resolvidos: métricas dos exemplos alinhadas e promessa de sincronização automática da narrativa restringida; tokens de cor/layout exportados são derivados do JSON. A limitação de IDs inválidos na galeria local permanece.
