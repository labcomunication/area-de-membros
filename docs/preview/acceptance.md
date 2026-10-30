# Aceite — refinamento da prévia HTML

Revisão de 30/10/2026, na branch `feat/members-wireframe`. Escopo: documento offline, seu exportador e evidências. Sem alterações em `src/`, autenticação, rotas da aplicação, stack ou integrações. Preços explicitamente fictícios foram acrescentados somente à prévia, após autorização em voz; não são preços aprovados nem habilitam compra.

- [x] Home: saudação → próximo passo → Seus Produtos → Últimas publicações → ofertas → faixa fina de novidades/rodapé.
- [x] Hero de boas-vindas removido do DOM; coleções/chips e comunidade removidos da Home.
- [x] Zona A reúne saudação, próximo passo e biblioteca; zonas B/C separadas por 48px.
- [x] Produto do próximo passo omitido da grade da Home pelo mesmo ID.
- [x] Cards adquiridos têm um único link/CTA “Ver materiais”; pendência em texto. Cards bloqueados mantêm status sem botão adicional.
- [x] Bottom nav: Início · Meus Produtos · Mais. Ofertas continuam no sidebar, Mais e zona C.
- [x] Gradiente lavanda/creme no canvas, com ângulo vertical mobile; superfícies brancas por padrão e alternativa escura na personalização.
- [x] Cards brancos, radius 16px, padding 24px desktop/16px mobile, sombras suaves e hover sem deslocamento. Inputs continuam com radius 8px.
- [x] Ritmo de 16px dentro dos componentes, 24px nas grades/listas e 48px entre zonas.
- [x] Sidebar clear pill branco por padrão, inset 16px, radius 24px, itens com mínimo de 48px, ativo lavanda com barra vinho de 3px. Rodapé discreto. Acentos e modo escuro podem ser experimentados.
- [x] Menu desktop/mobile fixo na rolagem; drawer branco, ofertas acessíveis e foco devolvido ao fechar com Escape.
- [x] Um rótulo da área de membros por shell visível; tag duplicada do topbar removida.
- [x] Imagens editoriais contidas em máscaras arredondadas, títulos e cards estáveis; hover somente na imagem; movimento reduzido respeitado.
- [x] Badges “Apenas para membros” arredondados; preços de exemplo rotulados; botões de compra inativos.
- [x] Bônus bloqueado com capa escura e cadeado central, sem conteúdo da capa exposto.
- [x] Banner ilustrativo compartilhado em Meus Produtos, Bônus e Ofertas, abaixo do topbar. Home mantém sua ordem aprovada.
- [x] Minha conta com 91 células de atividade ilustrativa, exemplos de conquistas e coroa que pode ser pré-visualizada; sem alegar acesso, venda ou conclusão real.
- [x] Personalização → Editar abre opções claro/escuro e oliva/vinho/bege. Modo muda a aparência geral; acentos mudam menu e detalhes. Estado em memória preservado na navegação, sem persistência.
- [x] Estúdio IA acessível pelo sidebar/Mais e seletor, aviso “Em breve”, esfera abstrata animada e botão de geração de PDFs inativo.
- [x] 14 capturas desktop 1440px/mobile 390px: Home, produtos, bônus, ofertas, conta, IA e conta escura com personalização/coroa. Geradas com `npm run screenshots -- --offline-review`.
- [x] HTML e ZIP regenerados com `npm run preview:offline`; ZIP contém somente o HTML autossuficiente.
- [x] Commit local na branch solicitada; sem push/publicação, PR, merge para main ou deploy.

Verificação atual em Chromium: as 38 variantes em 1440×1000, 768×700, 390×844 e 320×700, sem overflow horizontal. O teste de hover compara as posições de texto e card antes/depois, com escala apenas na imagem e máscara com overflow contido. Fluxos de personalização, três acentos, troca claro/escuro, coroa, navegação com preferências, drawer/Escape, foco, Estúdio IA, movimento reduzido, bônus bloqueado, preços fictícios e Home → produto → módulo passaram. Zero erros JavaScript e zero requisições de rede. Corrigido também o grid da tela bloqueada em 768px. Script: `npx tsx scripts/verify-offline-preview.ts`. Lint/tipos e integridade do ZIP conferidos antes do commit. Inspeção visual das capturas realizada.

A prévia contém interações locais de apresentação, com dados fictícios e formulários, filtros, pagamentos, login, geração de PDFs e download de materiais inativos. As capturas antigas e vídeos da galeria React representam a versão anterior da aplicação; esta revisão é exclusiva do HTML. Integração futura exige implementar componentes na aplicação e conectar serviços/dados reais; não é habilitada por esta demonstração.
