# Prévia navegável sem instalação

Baixe **wireframe.zip**, extraia e abra **wireframe.html** no Chrome ou Edge. Não requer Node, servidor ou conexão depois do download.

Contém 38 telas/variantes a partir das fixtures e uma tela futura de Estúdio IA. A barra superior permite escolher telas e estados. Home em três zonas, cards brancos sobre gradiente e menu claro com grupos recolhíveis Aprender, Explorar e Pessoal, ícones coerentes e item ativo em cápsula branca. Navegação mobile: Início · Meus Produtos · Mais.

Nesta revisão: imagens editoriais contidas, hover somente na imagem, badges arredondados, preços explicitamente fictícios, capa bloqueada com cadeado, banner de catálogo/ofertas e Minha conta com mapa de atividade e conquistas ilustrativos. Em Personalização → Editar, experimente claro/escuro, detalhes oliva/vinho/bege e coroa de exemplo. Preferências apenas em memória; recarregar restaura os padrões. Estúdio IA tem um personagem vetorial interativo no lugar da esfera. Em Minha conta → Escolher personagem, escolha entre 15 opções para o perfil e a IA. Olhos ovais alongados e inclinados seguem o cursor; clique/toque muda a cor e mostra um sorriso; quatro cliques rápidos mostram uma expressão brava por 1,8 segundo. Movimento reduzido mantém os olhos centralizados. A geração de PDFs continua futura.

É uma demonstração visual do perfil Essencial: formulários, filtros, login, compras, geração de PDFs e downloads de materiais estão inativos. Mapa/conquistas não representam acessos, vendas ou conclusões reais. Sem coleta, API, cookies ou persistência. Não substitui a aplicação React, que permanece intacta.

Fontes: scripts/refine-offline-preview.ts, scripts/enhance-offline-preview.ts, scripts/offline-preview-runtime.js, scripts/decorate-preview-characters.ts, scripts/offline-preview-characters.js, docs/preview/shell.css e docs/preview/characters.css, embutidos no HTML. Para regenerar: npm run dev e npm run preview:offline. Capturas: npm run screenshots -- --offline-review (ou --offline-home para somente Home). Verificar: npx tsx scripts/verify-offline-preview.ts e npx tsx scripts/verify-preview-characters.ts. Veja iteration-characters.md e acceptance.md. Design system aguardando aprovação do wireframe; docs/design/ permanece intacto.

Nenhum publish, push, PR, merge ou deploy faz parte desta revisão.
