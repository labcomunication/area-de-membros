# Estúdio de ideias — referências e escopo aprovado

Base 65aaede, feat/members-wireframe. Usuário encerrou o levantamento e autorizou começar estas alterações. Autorização de envio normal ao GitHub após testes continua vigente; não criar PR, integrar main, fazer deploy ou reescrever histórico. Somente prévia offline/exportador/evidências; src/, auth, entitlement, preços, integrações e docs/design/ permanecem intactos.

## Referências escolhidas e resultado

- Ailo: https://braobarbosa.com/project/ailo-ifood — estudo visual acessado e imagens examinadas em /tmp/ailo-reference-assets/. Corpo arredondado, mais estreito no alto e base achatada; painel de rosto separado e olhos circulares de base curva. Substituir as seis famílias antigas por essa linguagem nos quinze avatares e no mascote; manter nomes/IDs e opções de cor, sem wordmark/iFood/nome Ailo no produto. Preservar olhar esférico suave já aprovado, hover, happy/nervous, arraste e reduced motion; animação programática, não GIF/Lottie. As imagens do estudo são referências, não assets comerciais do produto.
- Recomendação: screenshot móvel de foto grande ao fundo e caixa branca sobreposta embaixo. Aplicar em “Você também pode gostar”, no bônus; preservar textos/preços fictícios/status/botão de compra desabilitado e carrossel manual. A capa ocupa o card e o texto fica no painel, sem miniatura espremida. Usar os placeholders de capas existentes em área grande enquanto o pack final não chega; não gerar fotos reais ou alegar assets liberados.
- Minhas anotações: screenshot de editor claro flutuante, campos cinza, cantos suaves e botão principal escuro. Transformar o formulário inline atual em dialog acessível com esses traços, sem adicionar calendário/datas não pedidos. Manter quadro, menus, CRUD, arraste, desfazer, referências bloqueadas e seleção de e-books.
- Corners: curvas contínuas tipo Apple, aproximadamente a sensação de 60% de smoothing. Aplicar a superfícies/controles arredondados, preservando avatares circulares e funcionalidade. Usar corner-shape progressivo e raio consistente, com fallback de borda arredondada; não prometer equivalência matemática com Figma.
- Superfícies: referência https://www.apple.com/br/iphone/ inspecionada em Chromium: cards claros sem borda, diferenciação por tons e espaçamento. Página cinza bem clara, cards brancos/claros; retirar contornos decorativos de boxes. Preservar foco visível, indicadores de seleção, inputs perceptíveis e linhas/portas funcionais do grafo. Manter modo escuro e acentos.
- Tipografia: Noto Sans explicitamente escolhida para textos, botões, menus e títulos, inclusive Estúdio IA. Fonte WOFF2 Latin hospedada no repo e embutida no HTML; licença OFL preservada; sem Google Fonts/CDN em runtime.

## Novo quadro de nós

Novo box entre .ai-studio e .ai-studio-copy, abaixo do mascote e antes de “Da sua ideia ao seu próximo PDF”. Fundo pontilhado discreto como a referência de conexões; NÃO copiar os mascotes da imagem de nodes (usuário os descartou). Usar avatares da pessoa e da IA da nova família.

Quadro local funcional: criar nós de ideia/texto, editar conteúdo, mover por arraste ou teclado, excluir e conectar por portas/alternativa acessível; adicionar referências de imagem local com prévia e sem upload/rede. Exemplo de ideia: “Colorir PDF”. Nó de IA e nó de saída PDF ajudam a ler o fluxo. Linhas curvas unem os boxes. Permitir remover conexões, impedir conexão do nó nele mesmo/duplicadas, e manter conteúdo como texto simples. Interface deve caber em 390px, com área interna navegável e operação por toque. Geração PDF/imagem fica inativa para integração futura; nenhum progresso/sucesso de geração fictício.

State somente em memória, preservado ao navegar, descartado ao recarregar. Imagem local PNG/JPEG/WebP até 5MB, sem SVG/URL remota. Revogar object URLs ao excluir/substituir a referência e ao fechar a página. Não apagar grafo apenas por navegar para outra tela; desmontar listeners/DOM na saída.

## Abordagem e defaults do implementador

Manter runtime standalone e renderer Three existentes; adicionar controlador DOM/SVG para o grafo e dialog nativo para o compositor. Escolha feita para não reescrever app/stack e manter tudo offline. O grafo é planejamento de ideias, não executor de workflow. Não adicionar dependências. Player sem shaders de iluminação no corpo; rosto/olhos separados conforme nova referência. Avatares estáticos vetoriais são a mesma geometria de interface do mascote interativo, não ilustrações de produto geradas.

Plugins de apoio: UI UX Designer, Impeccable e Product Design. Mobbin não expõe tool/skill nesta sessão. Product Design não tem contexto salvo nem helper de preflight no workspace; sua referência critical-overrides não foi exposta pelo provedor. Usar contexto/capturas fornecidos e verificação real em Chromium/Playwright existente; não alegar execução de Browser/Sites ou publicação. Screenshots escolhidos são alvos de componentes, não clone literal da página inteira.

Modo Operate. Nó editável/ligação é a ação principal; mascote é a interação expressiva existente. Feedback curto, sem loops decorativos além do rastro finito. Verificar quatro larguras, teclado, toque, reduced motion, offline, texto seguro e cleanup. Uma inspeção batida desktop/mobile e no máximo uma rodada de confirmação após correções.
