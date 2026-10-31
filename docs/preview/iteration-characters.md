# Wireframe — menu agrupado e personagens

Pedido de 30/10/2026: seguir a organização/UX dos dois menus de referência e recriar personagens esféricos no estilo da terceira imagem. Esta etapa valida o wireframe; `docs/design/` não será finalizado ou alterado antes da aprovação de LAB.

Implementação escolhida a partir do pedido:

- Sidebar claro com grupos Aprender, Explorar e Pessoal recolhíveis, ícones vetoriais coerentes, item ativo branco em cápsula e acesso ao perfil no rodapé. As rotas continuam iguais. No mobile, os grupos aparecem em Mais; Início/Meus Produtos/Mais continuam fixos.
- Quinze personagens vetoriais originais, com gradientes, cabelos e expressões no estilo fornecido. A seleção em Minha conta atualiza a foto de perfil e o personagem do Estúdio IA apenas durante a sessão da prévia.
- Olhos acompanham o ponteiro com deslocamento limitado; ao sair da janela voltam ao centro. Em dispositivos de toque não há dependência de hover.
- Clique/toque/Enter/Espaço no personagem do Estúdio IA muda sua cor e mostra um sorriso. Quatro cliques em 1,2 segundo mostram uma expressão brava de brincadeira. Após 1,8 segundo sem interação, retorna ao normal. Nenhum bloqueio ou penalidade.
- Com movimento reduzido, olhos ficam centralizados e as transições/balanços são removidos. Cor e expressão continuam comunicando o estado.
- Sem rastreamento, rede, persistência, upload, autenticação ou geração de PDFs. Os personagens são componentes visuais, não uma integração de IA.

Plano: criar a decoração de menu/seleção; implementar estados e ponteiro; gerar HTML/ZIP; atualizar capturas; validar grupos, seleção, reações, teclado, toque, movimento reduzido e navegação nas quatro larguras; lint/tipos antes do commit local. Sem push, merge, PR ou deploy.

Orientação aplicada: UI UX Designer (componentes e microinterações). Não foi utilizado serviço externo de geração de interface; toda a demonstração roda offline.

Resultado verificado: 38 variantes em quatro larguras, 15 escolhas com alvos mínimos de 44px, menu recolhível por teclado, seleção sincronizada entre perfil/IA, olhar e retorno ao centro, sorriso/cor, expressão brava/recuperação, toque e movimento reduzido. Ambos os verificadores passaram sem erros JavaScript ou requisições de rede. Lint e tipos passaram. HTML e ZIP conferidos; 20 capturas atualizadas. A aplicação, dependências e `docs/design/` permaneceram intactos.

Refinamento dos olhos solicitado depois: ovais alongados, inclinados e com alturas diferentes, no estilo do recorte enviado pelo usuário. A mesma geometria aparece nos quinze personagens, no perfil e no Estúdio IA. Os olhos permanecem visíveis na expressão feliz; sobrancelhas sobem na expressão brava para não sobrepor as novas formas. Acompanhamento do cursor e estados de interação são preservados.
