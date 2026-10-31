# Aceite — revisão dos prints da prévia

Revisão em `feat/members-wireframe`, baseada nos prints e no levantamento de 30/10/2026. Escopo: HTML offline, geradores/controladores e evidências. `src/`, `docs/design/`, preços, autenticação, acesso e dependências permanecem intactos nesta rodada. O usuário autorizou envio normal à branch após os testes; sem PR, merge ou deploy.

- [x] Sidebar de 264px, rótulos inativos visíveis e legíveis, sem barras de rolagem aparentes. Conteúdo continua rolável por teclado, roda e toque. Em janelas muito baixas, a sidebar inteira rola para preservar alvos completos e acesso ao perfil.
- [x] Navegação compacta mantém ícones e animação do nome ativo. Frase do canto esquerdo removida dos cabeçalhos. A barra fixa fica fosca ao rolar, com ícones/textos nítidos.
- [x] Capas de ofertas preservam proporção retrato 3:4; carrossel manual sem barra aparente, com setas e rodapés alinhados.
- [x] Publicações sem bloco/borda/degradê decorativo inferior. Abas Conteúdo/Bônus/Materiais sem preenchimento, com ativo em texto/sublinhado.
- [x] Quinze formas/cores de mascotes preservadas. Corpo de cor fosca uniforme; profundidade concentrada no olhar que segue a curvatura de uma esfera virtual, com movimento amortecido.
- [x] Hover/foco, happy por 300ms e nervous após três cliques em 500ms permanecem, com recuperação e arraste limitado. Movimento reduzido mantém pose estática; recursos e timers são descartados ao navegar.
- [x] Estúdio IA com pontilhado cinza, destaque radial próximo ao ponteiro e rastro que decai em aproximadamente 900ms; RAF para após desaparecer e fora da vista. Movimento reduzido desativa esse rastro.
- [x] Nome/personagem centralizados; título em uma linha no desktop e quebra natural no mobile. Texto, botão inativo e microtexto ficam abaixo, fora do box do mascote. Tipografia original preservada.
- [x] Notas com menu Mover para no visual da página, ações no canto e puxador de arraste. Operáveis por teclado/toque, com Escape, fechamento externo e foco restaurado após redesenhar.
- [x] Botão direito e Adicionar ao quadro oferecem adicionar nota, escrever nota e adicionar referência de e-book da biblioteca demonstrativa. Não há upload, download ou desbloqueio. Referências bloqueadas continuam bloqueadas.
- [x] Notas em texto simples; criar/editar/mover/excluir/desfazer e marcadores preservados. Menus contidos em quatro larguras; seletor de e-books contém o foco e se fecha ao navegar.
- [x] Personalização alterna Editar/Fechar e mostra o acento enquanto aberta; Escape restaura rótulo/foco. Espaçamento entre opções e ajuda corrigido.
- [x] Coroa, medalha e estrela selecionáveis no avatar, com visualização/ocultação e estado mantido entre telas. Dois textos de apoio apontados pelo usuário removidos, sem concessão de conquistas reais.

## Verificação

Oito verificadores da prévia: `verify-offline-preview.ts`, `verify-preview-characters.ts`, `verify-preview-workspace.ts`, `verify-review-regressions.ts`, `verify-nav-labels.ts`, `verify-mascot-volume.ts`, `verify-notes-review.ts` e `verify-preview-review.ts`. Cobrem 39 variantes em 1440, 768, 390 e 320px; teclado/toque, movimento reduzido, renderização real dos mascotes, texto seguro, referências bloqueadas e ausência de erros JavaScript/rede. A regressão adicional verifica alvos completos em 1024×320 e 1440×360.

Build, lint sem avisos, tipos, sete testes unitários e integridade exata do ZIP passaram. Os oito verificadores da prévia passaram após a correção final, sem erros JavaScript nem requisições externas. Foram geradas e conferidas 34 capturas. O ZIP contém somente o HTML autossuficiente, com Three.js e licença embutidos; sem CDN. Capturas desktop/mobile e casos adicionais estão no [índice](../screenshots/README-preview.md).

Uma revisão independente encontrou o caso de navegação em janelas muito baixas, reproduzido antes da correção e coberto por regressão. [Registro](../reviews/2026-10-31-preview-refinement-review.md). Não houve outros achados consequentes no escopo revisado. Isso não representa aprovação do visual final nem do design system.
