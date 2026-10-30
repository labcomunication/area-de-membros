## Resultado

Adiciona a base da área de membros em Next.js App Router, React 19 e TypeScript: 15 telas de wireframe desktop/mobile, timeline, catálogo, produto/módulo pendente, bônus, ofertas, FAQ e conta. A galeria só funciona em desenvolvimento; rotas de membros negam acesso até existir autenticação real. Entitlement resolve oferta → perfil → produtos no domínio e verifica acesso no carregamento server-side.

Magic link e webhook Cakto são contratos provisórios com endpoints inertes (501), sem envio, cookies, grants ou chamadas externas. Compra, arquivos e contatos reais continuam pendentes. Não houve deploy, merge, webhook ou publish na Cakto.

## Verificação

- npm ci, lint, TypeScript e build: passaram.
- 7 testes de domínio/segurança passaram.
- Desenvolvimento: 69 e2e passaram; 3 exclusivos de produção ignorados.
- Build de produção local: 10 e2e passaram; 62 exclusivos da galeria ignorados.
- axe WCAG A/AA em cinco telas, desktop e mobile; 40 capturas.
- Revisão independente; regressões corrigidas com testes RED→GREEN.

[Checklist integral da seção 12 e limites](https://github.com/labcomunication/area-de-membros/blob/feat/members-wireframe/docs/acceptance-area-membros.md) · [Todas as capturas](https://github.com/labcomunication/area-de-membros/tree/feat/members-wireframe/docs/screenshots)

## Capturas

![Home desktop](https://raw.githubusercontent.com/labcomunication/area-de-membros/feat/members-wireframe/docs/screenshots/home-normal-desktop.png)

<img alt="Home mobile 390px" src="https://raw.githubusercontent.com/labcomunication/area-de-membros/feat/members-wireframe/docs/screenshots/home-normal-mobile.png" width="390" />

## Checklist — seção 12

- [x] Rotas e telas desktop/mobile 390px; galeria local para revisão sem bypass público.
- [ ] Fidelidade às imagens: arquivos de referência não disponibilizados; estrutura baseada no briefing textual, revisão Pike pendente.
- [x] Estados da tabela 8.8 disponíveis nas fixtures.
- [x] Entitlement decide biblioteca, bloqueio, bônus e ofertas.
- [x] Tokens CSS e slots de marca.
- [x] Sem secrets, senha demo ou bypass público.
- [x] Stubs tipados, TODOs, zero efeitos externos.
- [x] Build e lint verdes.
- [x] README e env placeholders sem valores.
- [x] Zero deploy de produção; go LAB/Alisson continua necessário.

Pendências menores: IDs inválidos na galeria local usam fallback. Retorno de foco do drawer foi corrigido nesta revisão. Auth real, assets Riccele, preços Zed e contrato final Alisson não são parte desta implementação.

## Refinamento e documentação visual v0.2

Home prioriza próxima ação e biblioteca; menus fixos, toolbar sticky e retorno de foco/Escape foram testados. Adiciona pesquisa estrutural (Open edX, Moodle e shadcn/ui), style guide de 6 páginas e design system de 8 páginas, com a paleta enviada + vinho proposto e tokens/contraste. A direção visual fica nos documentos; o wireframe continua neutro. Inclui demonstrações de rolagem desktop/mobile capturadas no app e reproduzidas a 12fps. Nenhum deploy.
