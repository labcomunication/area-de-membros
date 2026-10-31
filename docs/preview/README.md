# Prévia navegável sem instalação

Baixe **wireframe.zip**, extraia e abra **wireframe.html** no Chrome ou Edge. Não requer Node, servidor ou conexão depois do download. WebGL permite a interação 3D; navegadores sem WebGL preservam o personagem estático.

Contém 39 telas/variantes de demonstração. Use o seletor superior ou os menus para navegar. A aplicação React mantém sua versão anterior: esta revisão é exclusiva da prévia HTML.

## Experimente

- **Estúdio IA:** personagem centralizado, fundo pontilhado cinza com destaque/rastro suave perto do ponteiro e apoio fora do box. Mantém as quinze formas/cores selecionáveis em Minha conta. Corpo fosco de cor uniforme, sem relevo ou sombreamento, com olhos claros que acompanham a curvatura de uma esfera virtual com amortecimento. Hover/foco expande com mola sem deslocar o layout; um clique fecha os olhos por 300ms; três cliques em 500ms ativam nervosismo por 1s. Arraste levemente e solte para retornar. Não há troca de cor no clique. Movimento reduzido mantém pose estática e permite expressão discreta.
- **Menu:** todos os nomes permanecem visíveis no menu lateral, um pouco mais largo e sem barras de rolagem visíveis. Em janelas muito baixas, a sidebar inteira pode rolar para manter itens e perfil acessíveis. Na navegação compacta, somente o nome ativo entra e sai com mola; ícones permanecem visíveis. A barra fixa ganha efeito fosco ao rolar. Em Minha conta → Personalização → Editar, escolha Ícones no topo. O menu superior fica centralizado no desktop e fixo ao rolar; no mobile substitui a barra inferior por uma faixa rolável. O controle de restauração traz o menu padrão de volta. Movimento reduzido troca os nomes imediatamente.
- **Minhas anotações:** criar, editar, excluir/desfazer e mover texto entre três colunas. Arraste pelo puxador no desktop ou use menus próprios por teclado/toque. Editar/excluir ficam no menu do canto. O botão Adicionar ao quadro e o botão direito oferecem notas escritas e referências de e-books da biblioteca demonstrativa; não fazem upload nem entregam arquivos. Referências bloqueadas continuam bloqueadas.
- **Ofertas:** cinco cards ilustrativos, capas retrato 3:4 à esquerda sem esticar, rodapés alinhados, descrição expansível e carrossel manual. Os dois conceitos adicionais não são ofertas cadastradas. Todos os preços são fictícios e os botões de compra permanecem inativos.
- **Minha conta:** claro/escuro, detalhes oliva/vinho/bege, quinze personagens, atividade e conquistas ilustrativas. Editar muda para Fechar e recebe o acento enquanto o painel está aberto. Escolha entre coroa, medalha e estrela para pré-visualizar no avatar. Tudo permanece apenas na memória; recarregar restaura os padrões.

Login, compras, downloads, filtros de conteúdo, geração de PDFs e conexão de IA continuam inativos. O formulário de anotações funciona apenas nesta demonstração local. Sem coleta, requisições externas, API keys, cookies ou persistência. Não altera acesso ou entitlement.

## Regeneração e verificação

Com o servidor local iniciado por npm run dev, execute npm run preview:offline. O exportador empacota Three.js e a licença MIT no HTML, sem CDN; a licença também está em THREE-LICENSE.txt. Three e esbuild são dependências de desenvolvimento usadas somente nesta exportação.

Verificações: npx tsx scripts/verify-offline-preview.ts; npx tsx scripts/verify-preview-characters.ts; npx tsx scripts/verify-preview-workspace.ts; npx tsx scripts/verify-review-regressions.ts; npx tsx scripts/verify-mascot-volume.ts; npx tsx scripts/verify-nav-labels.ts; npx tsx scripts/verify-preview-review.ts; npx tsx scripts/verify-notes-review.ts. Capturas: npm run screenshots -- --offline-review. Veja acceptance.md e iteration-workspace.md.

Design system aguardando aprovação do wireframe; docs/design/ permanece intacto. Envio normal à branch de trabalho autorizado pelo usuário após os testes. Nenhum PR, merge, publicação de site ou deploy faz parte desta revisão.
