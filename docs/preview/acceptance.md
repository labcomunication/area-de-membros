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

## Edições Dev/usuário e cor de detalhes

- [x] Edições identificadas como wireframe.dev.html e wireframe.usuario.html, com ZIPs correspondentes e base de código comum. O arquivo anterior continua como alias Dev.
- [x] Dev com seletor, quadro de ideias e Configurações Dev; usuário sem esses controles. Preferências pessoais e edição das próprias notas preservadas quando ativas.
- [x] Chave Minhas anotações propaga para as abas de usuário abertas pelo painel, remove links/marcadores, fecha o editor e bloqueia a rota; reativar restaura o recurso. Dev continua com acesso para testes.
- [x] Download da visão de usuário incorpora a configuração para abertura independente. A conexão ao vivo vale para as abas abertas pelo painel; não é uma integração de autorização de produção.
- [x] O antigo preenchimento azul do tema vinho agora usa um tom de vinho. Destaques/seleções acompanham oliva, vinho e bege, em claro/escuro.

Passaram verify-preview-audiences.ts, verify-offline-preview.ts, verify-notes-review.ts, verify-preview-flow.ts e verify-studio-refinement.ts, além de lint/tipos. O novo verificador exercita também a ligação entre abas em uma origem HTTP local simulada, a reversão da chave e o download real, reaberto em páginas independentes a partir dos bytes salvos. O Chromium gerenciado bloqueia navegação file://; não foi alegado teste dessa navegação. Os três ZIPs foram comparados byte a byte com os HTMLs. São agora 42 capturas, incluindo as duas edições no desktop/mobile. [Guia das edições](editions.md).
