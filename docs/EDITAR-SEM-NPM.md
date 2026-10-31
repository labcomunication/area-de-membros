# Editar a área de membros sem npm

Para Lab e Rit. Dá para abrir a prévia e editar os arquivos no Cursor sem instalar Node e sem rodar npm na máquina.

## Abrir a prévia HTML

Os arquivos ficam em `docs/preview/`. São páginas já montadas: Chrome ou Edge abrem direto.

| Arquivo | Para que serve |
|---|---|
| `wireframe.dev.html` e `wireframe.dev.zip` | Edição Dev: seletor de telas, quadro de ideias e Configurações Dev |
| `wireframe.usuario.html` e `wireframe.usuario.zip` | Visão de usuário, sem os controles de desenvolvimento |
| `wireframe.html` e `wireframe.zip` | Atalho da edição Dev (o mesmo conteúdo de `wireframe.dev`) |

1. No Cursor, abra o `.html`, ou baixe o zip correspondente no GitHub e extraia.
2. Abra o `.html` no Chrome ou no Edge (duplo clique, ou arraste o arquivo para a janela).
3. Não use terminal. Não rode `npm install` nem um servidor. Depois que o arquivo está na máquina, a prévia não precisa de internet.

O texto, os preços e as capas dessa prévia são fictícios. Login, compra, download e IA continuam de demonstração.

## Pastas para editar no Cursor

A prévia HTML é uma cópia exportada. Mudar `src/` não altera o arquivo que o navegador abre. A próxima exportação também pode substituir o HTML. Edite as páginas da área de membros nestas pastas:

- `src/app/area/` — páginas da área
  - `page.tsx` — início
  - `produtos/` — biblioteca, produto e módulo
  - `bonus/`, `ofertas/`, `suporte/`, `conta/`
  - `blog/` — artigo e categoria
- `src/app/entrar/` — telas de acesso (o magic link ainda não envia e-mail nem cria sessão)
- `src/app/ajuda/` — FAQ público
- `src/components/` — o desenho das páginas: `members-shell.tsx`, `member-pages.tsx`, `navigation.tsx`, cards, timeline e ofertas
- `src/config/members.ts` — catálogo e textos fictícios
- `src/config/navigation.ts` — nomes e caminhos do menu

O visual que entra na prévia offline, quando alguém regenerar o HTML, está em `docs/preview/*.css` e nos scripts `scripts/offline-preview-*.js`, `scripts/refine-preview-*.ts` e `scripts/export-offline-wireframe.ts`. O mapa das duas edições está em `docs/preview/editions.md`.

A rota `/wireframes` é a galeria do app Next. Ela só responde com o servidor de desenvolvimento. No build de produção essa rota devolve 404. Para ver as telas sem Node, use os HTML de `docs/preview/`.

## O que não fazer

- Não fazer deploy de produção e não publicar o site.
- Não ativar Cakto, webhook, checkout, magic link nem autenticação real. `src/app/api/auth/magic-link` e `src/app/api/webhooks/cakto` respondem 501 de propósito.
- Não colocar senha, token, chave ou dado de cliente no Git.
- Não fazer merge na `main` sem o go do Alisson e do Lab.
- Não tratar preços, ofertas ou números da prévia como dados reais.

Detalhe da prévia: `docs/preview/README.md`. Visão geral do app: `README.md`.
