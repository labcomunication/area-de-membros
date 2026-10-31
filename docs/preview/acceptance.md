# Aceite — estúdio de ideias e refinamento visual

Revisão de 31/10/2026 em feat/members-wireframe, sobre 65aaede. Escopo autorizado: prévia HTML offline, exportador/controladores e evidências; envio normal à branch após testes. src/, docs/design/, dependências, preços e integrações permanecem intactos. Sem PR, merge ou deploy.

- [x] Noto Sans incorporada ao HTML, sem CDN, com licença OFL. Textos, controles e títulos usam a fonte escolhida.
- [x] Superfícies claras diferenciadas por tons e espaçamento, sem contornos decorativos nos blocos; modo escuro/acento preservados. Controles mantêm foco e seleção perceptíveis.
- [x] Cantos contínuos progressivos com fallback arredondado; avatares circulares preservados.
- [x] Você também pode gostar com capa grande ao fundo e painel inferior sobreposto; carrossel manual, descrição, status e preços fictícios preservados, sem habilitar compra. Placeholders aguardam imagens reais.
- [x] Editor de notas em dialog claro com campos cinza e ações escuras/claras; salvar/cancelar/Escape, foco, CRUD, arraste, desfazer e referências bloqueadas preservados.
- [x] Nova família arredondada com rosto separado e olhos claros; quinze nomes/cores, gaze esférico, hover, happy/nervous, arraste, movimento reduzido e limpeza mantidos.
- [x] Quadro de ideias abaixo do mascote e antes do título: texto/imagens locais, criar/editar/mover/excluir, conectar/remover conexões, teclado/toque e estado entre telas. Nenhuma geração real de PDF.
- [x] Recuos internos do quadro corrigidos conforme observação do usuário: 28px desktop e 20px mobile, com limites laterais testados em quatro larguras.
- [x] Sidebar/menus, navegação compacta, janelas baixas, adornos de perfil e funcionalidades anteriores continuam cobertos pelos verificadores.

## Evidência

Passaram os oito verificadores anteriores (offline-preview, preview-characters, preview-workspace, review-regressions, nav-labels, mascot-volume, notes-review, preview-review) e cinco adicionais (ailo-characters, preview-flow, flow-regressions, notes-composer, studio-refinement), executados com npx tsx scripts/verify-<nome>.ts. Build, lint, tipos e sete testes unitários passaram. Foram geradas 38 capturas e inspecionados os componentes selecionados no desktop/mobile. [Índice](../screenshots/README-preview.md) · [Comparação visual](../../design-qa.md) · [Revisão independente e correções](../reviews/2026-10-31-studio-nodes-review.md).

Essa verificação técnica não representa aprovação do design final ou do design system. O ZIP é autossuficiente e contém somente o HTML, com Three.js e Noto Sans/licenças incorporados.
