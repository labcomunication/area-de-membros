# Comparação visual e verificação da prévia

Data: 31/10/2026. Artefato: docs/preview/wireframe.html, 39 variantes offline. Implementação restrita à prévia; src/ e docs/design/ permanecem intactos.

## Referências selecionadas

As imagens enviadas na conversa definem componentes específicos: capa grande com painel inferior sobreposto em “Você também pode gostar”; janela branca com campos cinza e botões simples em Minhas anotações; cantos contínuos e superfícies claras; quadro pontilhado com nós conectados por linhas curvas. O usuário descartou os mascotes coloridos da referência do grafo.

Também foram consultados o [estudo Ailo](https://braobarbosa.com/project/ailo-ifood) para silhueta/face/olhos e a [página do iPhone](https://www.apple.com/br/iphone/) para separação de superfícies sem contornos. A referência Apple não é um pedido de clonagem da página inteira. Noto Sans foi escolhida explicitamente pelo usuário.

## Comparação com capturas reais

| Alvo | Resultado observado | Evidência |
|---|---|---|
| Recomendações | Capa ocupa o fundo e painel branco arredondado fica sobreposto embaixo; texto e compra fictícia preservados. | [Desktop](docs/screenshots/recommendations-desktop.png), [mobile](docs/screenshots/recommendations-mobile.png) |
| Editor de anotações | Janela clara central, campos cinza e ação escura; cabe e rola no celular. Não foi adicionado calendário. | [Desktop](docs/screenshots/notes-editor-desktop.png), [mobile](docs/screenshots/notes-editor-mobile.png) |
| Mascote | Corpo arredondado, face separada e olhos claros circulares de base curva; nomes e quinze cores preservados, sem marca comercial na interface. | [Estúdio](docs/screenshots/ai-refined-desktop.png), [opções](docs/screenshots/account-avatars-desktop.png) |
| Superfícies e fonte | Branco/cinza claro separa os blocos; contornos decorativos removidos, inclusive conquistas. Noto Sans local carregada de fato, inclusive títulos. | [Conta mobile](docs/screenshots/account-refined-mobile.png), [escuro](docs/screenshots/account-dark-desktop.png) |
| Quadro de ideias | Pontilhado, ideias/IA/PDF e conexões curvas, abaixo do mascote e antes do título. Recuos corrigidos após observação do usuário. | [Desktop](docs/screenshots/idea-flow-desktop.png), [mobile](docs/screenshots/idea-flow-mobile.png) |

Resultado: os requisitos selecionados foram atendidos na prévia. A confirmação final comparou novamente os recuos do quadro e o limite da área interna no desktop e no mobile. O quadro tem rolagem interna para explorar nós fora da área visível, sem ampliar a largura da página. As capturas de detalhe dos componentes ocultam somente barras fixas durante a captura para evitar sobreposição; as capturas de página preservam a navegação real.

## Diferenças e limites previstos

- Capas continuam placeholders até receber imagens reais; nenhuma foto de produto foi inventada. A página Ofertas preserva seu formato anterior, pois a nova composição foi escolhida para recomendações.
- corner-shape é uma melhoria progressiva: em navegadores compatíveis usa curva contínua; os demais recebem raio arredondado. Não há equivalência matemática prometida com o smoothing do Figma.
- Nós são planejamento em memória: permitem texto, imagens locais PNG/JPEG/WebP até 5 MB, edição, movimento e conexões. Navegar preserva o quadro; recarregar o descarta. Nenhum upload ou geração real de PDF ocorre.
- Valores, compras e conquistas seguem demonstrativos. Não houve alteração de acesso, autenticação ou integração.

## Verificação e ferramentas

Treze verificadores de Chromium/Playwright passaram, cobrindo 39 variantes em quatro larguras, teclado/toque, foco, movimento reduzido, texto seguro, imagens/decodificação/limpeza, navegação e ausência de requisições externas/erros JS. As verificações afetadas pelo último ajuste de espaçamento foram repetidas. Lint, tipos, build e sete testes unitários passaram. Foram geradas 38 capturas. A inspeção visual foi batida em desktop/mobile e seguida de uma confirmação das correções, sem ciclo de polimento aberto. [Revisão técnica](docs/reviews/2026-10-31-studio-nodes-review.md).

Foram usadas as instruções disponíveis de UI UX Designer, Impeccable e Product Design, além das referências fornecidas. Mobbin não disponibilizou ferramentas/skill nesta sessão. O launcher Impeccable, helpers locais e a referência critical-overrides do Product Design não estavam disponíveis; não foi alegada execução desses recursos. A validação real usou o Chromium/Playwright já instalado, sem Browser/Sites, publicação ou novo serviço.

## Complemento — edições e funcionalidades

A solicitação posterior definiu duas edições para distinguir no Cursor: Dev com os controles existentes e quadro de ideias; usuário sem esses controles, mantendo personalização e próprias notas. O exemplo adicional de desativar Minhas anotações tornou-se a primeira chave de recurso no painel Dev. A mesma base gera ambas as edições; a visão aberta pelo painel recebe as alterações imediatamente. Baixar versão do usuário incorpora a configuração para compartilhamento independente. [Guia](docs/preview/editions.md).

O azul fixo do preenchimento vinho foi substituído pelo tom claro da cor escolhida; os destaques de menus, símbolos e seleção já compartilham a variável de tema. O verificador compara as superfícies em vinho/oliva/bege, claro/escuro. Preservou-se o layout solicitado; a pergunta sobre ultrawide foi respondida como conceito de layout fluido/full width, sem adicionar outra alteração de layout.

Resultado: cinco verificadores afetados passaram (audiences, offline-preview, notes-review, preview-flow, studio-refinement), assim como lint/tipos. ZIPs/HTMLs e alias Dev têm integridade exata. A inspeção batida confirmou [painel Dev desktop](docs/screenshots/edition-dev-desktop.png), [mobile](docs/screenshots/edition-dev-mobile.png) e [usuário sem grafo](docs/screenshots/edition-usuario-mobile.png). O índice tem 42 capturas. A leitura dos bytes do download em páginas novas verifica a configuração independente; navegação file:// é bloqueada pelo Chromium gerenciado e não foi alegada como executada.
