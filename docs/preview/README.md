# Prévia navegável sem instalação

Baixe **wireframe.zip**, extraia e abra **wireframe.html** no Chrome ou Edge. Não requer Node, servidor ou conexão depois do download.

Contém 37 telas/variantes a partir das fixtures do wireframe. A barra superior permite escolher telas e estados. A prévia tem refinamento próprio: Home em três zonas, sem hero ou produto duplicado, cards brancos sobre gradiente e menu clear pill com lavanda/vinho. Navegação mobile: Início · Meus Produtos · Mais.

É uma prévia estática navegável do perfil Essencial: formulários, filtros, abas, login, compras e downloads de materiais estão inativos. Não substitui o projeto React nem simula autenticação. A aplicação e seus estilos não foram alterados.

Fontes da prévia: scripts/refine-offline-preview.ts (estrutura) e docs/preview/shell.css (skin, embutido no HTML). Gerar novamente: inicie npm run dev e execute npm run preview:offline. Para capturas da Home refinada: npm run screenshots -- --offline-home. As capturas antigas da galeria React permanecem identificadas separadamente.

Nenhum publish, push, PR, merge ou deploy faz parte desta revisão.
