# Aceite — prévia HTML interativa

Branch `feat/members-wireframe`; revisão de 30/10/2026. Escopo: HTML offline, exportador, controladores e evidências. `src/`, autenticação, entitlement, rotas da aplicação e `docs/design/` permanecem intactos. Three.js e esbuild são as únicas dependências de desenvolvimento acrescentadas para a ilha 3D solicitada.

## Composição e interações locais

- [x] Home mantém próximo passo, biblioteca, publicações e ofertas; sem duplicar o produto principal.
- [x] Imagens editoriais contidas; hover afeta somente a imagem, com texto/card estáveis.
- [x] Badges arredondados, bônus bloqueado com capa escura e cadeado; preços explicitamente fictícios e compra inativa.
- [x] Cinco ofertas ilustrativas em carrossel manual; capa ocupa a lateral, rodapés alinhados e descrição realmente expansível. Dois conceitos adicionais não representam ofertas cadastradas.
- [x] Minha conta mantém atividade/conquistas demonstrativas, quinze personagens, claro/escuro e detalhes oliva/vinho/bege, apenas em memória.
- [x] Personalização permite ocultar sidebar e usar ícones no topo, com restauração explícita. Menu permanece fixo na rolagem; no mobile compacto substitui a barra inferior.
- [x] Minhas anotações acima de Minha conta: criar, editar, mover por puxador/seletor, excluir e desfazer. Texto inserido é tratado como texto simples.
- [x] Botão e menu de contexto guardam referências de produtos/bônus. Referência bloqueada continua bloqueada; nenhum arquivo é entregue ou acesso concedido.
- [x] Ajuda de IA e conexão futura permanecem inertes, sem campo de chave, persistência ou chamadas externas.

## Mascote 3D

- [x] Uma ilha Three.js no palco existente; nenhum segundo mascote. Seis famílias de geometria arredondada derivadas das quinze silhuetas atuais, cores preservadas e olhos brancos sem alteração de marca.
- [x] Volume real com material fosco e iluminação neutra/quente; nenhum azul/índigo usado como luz principal. O azul da variante Theo pertence ao personagem selecionado.
- [x] Ponteiro projetado em plano frontal; olhos usam lookAt e amortecimento de aproximadamente 0,15, presos ao volume.
- [x] Hover/foco expande por mola, sem alterar o layout em volta.
- [x] Clique único, após debounce de 90ms: happy por 300ms, olhos fechados e squash suave, seguido de idle.
- [x] Três cliques em 500ms: nervous com tremor e pulso leve por 1s, com renovação limitada e prioridade sobre happy.
- [x] Arraste limitado com retorno suave; arrastar não dispara reação de clique.
- [x] Movimento reduzido desativa olhar, tremor e expansão; expressão discreta continua disponível.
- [x] Recursos GPU, listeners e timers descartados ao sair da tela; animação pausada fora da vista. Sem WebGL, há fallback estático explicitamente identificado.

## Menu animado

- [x] Ícones sempre visíveis; somente o nome ativo entra/sai por largura/escala, com mola compartilhada e opacidade secundária.
- [x] Mesmo shell DOM preservado entre telas para a saída do nome anterior; estado da navegação independente do mascote.
- [x] Desktop lateral, mobile inferior/Mais e modo compacto superior cobertos; menu compacto centralizado no desktop.
- [x] aria-current, nomes acessíveis, teclado, alvos de pelo menos 44px e troca instantânea com movimento reduzido.
- [x] Medição considera mudança para negrito no item ativo, evitando texto cortado após mudar a largura da janela.

## Evidência

Verificações Chromium passaram sem erros JavaScript ou requisições externas:

- `verify-offline-preview.ts`: 39 variantes em 1440, 768, 390 e 320px; imagem/texto estáveis, navegação, temas e ações inertes.
- `verify-preview-workspace.ts`: ofertas/carrossel, menu fixo e restauração, notas CRUD/arraste/desfazer, texto seguro e referências bloqueadas; arraste real do volume e retorno.
- `verify-review-regressions.ts`: descrições visualmente abertas, rodapés alinhados no mobile e ausência de overflow no modo compacto.
- `verify-mascot-volume.ts`: WebGL real, seis famílias com corpo/olhos renderizados, olhar, escala, happy/nervous, recuperação, movimento reduzido e descarte.
- `verify-preview-characters.ts`: quinze opções em quatro larguras, seleção perfil/IA, teclado, toque e drawer.
- `verify-nav-labels.ts`: shell persistente, entrada/saída com largura, grupos, barra mobile/Mais, teclado e contenção.

Build de produção, lint sem avisos, tipos e sete testes unitários passaram. HTML/ZIP autossuficientes regenerados; ZIP contém apenas `wireframe.html`. Capturas atualizadas no [índice](../screenshots/README-preview.md), incluindo desktop/mobile, modo compacto rolado, editor de notas e poses do mascote. As poses nas capturas usam movimento reduzido; o comportamento em movimento é verificado separadamente.

Uma revisão independente parcial identificou três falhas reais, corrigidas e cobertas por regressões. Ela foi interrompida por limite da ferramenta antes do parecer final; não há alegação de aprovação independente completa. [Registro](../reviews/2026-10-30-workspace-review.md).

Entrega em commit local na branch solicitada. Sem push, PR, publish, merge para main ou deploy. Design system permanece aguardando aprovação do wireframe. Login, compras, download, filtros de conteúdo e IA seguem inativos; anotações funcionam apenas nesta prévia e são descartadas ao recarregar.
