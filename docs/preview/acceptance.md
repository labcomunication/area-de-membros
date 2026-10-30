# Aceite — refinamento da prévia HTML

Revisão de 30/10/2026, na branch `feat/members-wireframe`. Escopo: documento offline, seu exportador e evidências. Sem alterações em `src/`, autenticação, rotas, conteúdo comercial, stack ou integrações.

- [x] Home: saudação → próximo passo → Seus Produtos → Últimas publicações → ofertas → faixa fina de novidades/rodapé.
- [x] Hero de boas-vindas removido do DOM; coleções/chips e comunidade removidos da Home.
- [x] Zona A reúne saudação, próximo passo e biblioteca; zonas B/C separadas por 48px.
- [x] Produto do próximo passo omitido da grade da Home pelo mesmo ID.
- [x] Cards adquiridos têm um único link/CTA “Ver materiais”; pendência em texto. Cards bloqueados mantêm status sem botão adicional.
- [x] Bottom nav: Início · Meus Produtos · Mais. Ofertas continuam no sidebar, Mais e zona C.
- [x] Gradiente lavanda/creme no canvas, com ângulo vertical mobile; texto em superfícies brancas.
- [x] Cards brancos, radius 16px, padding 24px desktop/16px mobile, sombras suaves e hover sem deslocamento. Inputs continuam com radius 8px.
- [x] Ritmo de 16px dentro dos componentes, 24px nas grades/listas e 48px entre zonas.
- [x] Sidebar clear pill branco, inset 16px, radius 24px, itens com mínimo de 48px, ativo lavanda com barra vinho de 3px. Rodapé discreto.
- [x] Menu desktop/mobile fixo na rolagem; drawer branco, ofertas acessíveis e foco devolvido ao fechar com Escape.
- [x] Um rótulo da área de membros por shell visível; tag duplicada do topbar removida.
- [x] Capturas da Home desktop 1440px/mobile 390px atualizadas com `npm run screenshots -- --offline-home`.
- [x] HTML e ZIP regenerados com `npm run preview:offline`; ZIP contém somente o HTML autossuficiente.
- [x] Commit local na branch solicitada; sem push/publicação, PR, merge para main ou deploy.

Verificação em Chromium: Home em 1440×1000, 1024×768, 768×700, 390×844 e 320×700; sem overflow horizontal. Foram conferidos ordem, ausência de duplicação/hero/coleções/comunidade, CTAs, tabs, medidas computadas, cores e menu fixo. As 37 variantes foram percorridas em 390px sem overflow. Navegação Home → produto → módulo e drawer/Escape passaram; zero erros JavaScript e zero requisições de rede. Texto das ofertas comparado com o HTML anterior, sem mudança. Inspeção visual das capturas realizada. `npm run lint` e `npm run typecheck` passaram.

A prévia permanece estática, com dados fictícios e formulários, filtros, pagamentos, login e download de materiais inativos. As capturas antigas e vídeos da galeria React representam a versão anterior da aplicação; esta revisão é exclusiva do HTML.
