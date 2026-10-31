# Revisão — estúdio de ideias e referências visuais

Base: 65aaede, branch feat/members-wireframe. Escopo: prévia HTML e exportador, sem aplicação de produção ou design system final.

Uma revisão independente examinou controladores, fontes de exportação, estilos e comportamento real em Chromium. Encontrou dois problemas P2:

1. Apagar a única ideia e adicionar outra calculava x=-234. O índice de posicionamento agora tem mínimo zero. A regressão foi reproduzida antes da correção e passou depois: o novo nó continua dentro da área navegável.
2. Um arraste continuava após a janela perder o foco, inclusive com buttons=0. O controlador agora cancela gestos em blur, página oculta, pointercancel e perda ativa de captura, além de rejeitar movimento sem botão pressionado. A captura é liberada após limpar o gesto; eventos tardios não apagam a seleção por clique de uma porta. A regressão de blur foi reproduzida e corrigida, preservando testes de portas, toque e teclado.

Na inspeção visual, cards de conquistas e painel de avatares ainda tinham contornos decorativos. Foram removidos, com diferenciação por tom e teste ampliado. O usuário apontou falta de recuo no segundo bloco, o mapa de ideias. Foram aplicados 28px de preenchimento no desktop e 20px no mobile; teste geométrico cobre ambos os lados do título, controles, ajuda, área navegável, conexões e rodapé em 1440, 768, 390 e 320px. Esse teste falhou antes e passou depois da correção.

Os treze verificadores da prévia passaram. Após a correção de espaçamento/superfícies, foram repetidos os seis afetados: studio-refinement, preview-flow, flow-regressions, offline-preview, preview-review e notes-review. Build, lint, tipos e sete testes unitários passaram. As capturas finais e a comparação com as referências estão em ../../design-qa.md e ../screenshots/README-preview.md.

A revisão técnica não equivale a aprovação do design final pelo usuário. Geração de PDF e compras continuam inativas; imagens de produtos aguardam assets reais.
