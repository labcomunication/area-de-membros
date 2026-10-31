# Edições Dev e usuário — uso no Cursor

- **wireframe.dev.html / wireframe.dev.zip:** prévia de desenvolvimento, seletor de telas/estados, quadro de ideias e Configurações Dev. Mantém acesso aos controles existentes para testar mesmo os recursos desativados para o usuário.
- **wireframe.usuario.html / wireframe.usuario.zip:** visão do usuário, sem seletor de desenvolvimento ou quadro de ideias. Mantém a escolha de cores/personagem, conquistas e edição das próprias notas quando o recurso está ativo.
- **wireframe.html / wireframe.zip:** cópia compatível da edição Dev para os links e verificadores anteriores.

## Controle de funcionalidades

Abra Configurações Dev, depois Abrir visão do usuário. A chave Minhas anotações atualiza imediatamente as abas abertas por esse painel: desativar remove o menu e os marcadores, fecha o editor e bloqueia a rota de notas; reativar restaura o acesso. Os dados pessoais de cada aba ficam em memória e não são apagados pela chave. O Dev mantém o recurso disponível para testes.

As abas estão conectadas enquanto o Dev permanece aberto. Para levar a configuração a outra pessoa ou ferramenta, clique em Baixar versão do usuário. O arquivo baixado incorpora a escolha e funciona independentemente da aba Dev. Uma cópia de usuário aberta separadamente não participa da conexão ao vivo. Não há servidor, upload ou sincronização da conta; isso controla a demonstração, sem alterar permissões de produção.

## Uma base de código

O Cursor deve editar as fontes comuns em scripts/export-offline-wireframe.ts, scripts/refine-preview-*.ts, scripts/offline-preview-*.js e docs/preview/*.css. O exportador gera ambas as edições juntas; não edite os HTMLs gerados como fontes independentes. A edição é identificada por data-preview-audience e pelo nome do arquivo. O controlador de recursos é scripts/offline-preview-features.js; Minhas anotações é a primeira chave, extensível a novos testes no futuro.

Com npm run dev ativo, npm run preview:offline regenera os HTMLs e os três ZIPs. npx tsx scripts/verify-preview-audiences.ts verifica as edições, cores claro/escuro, preferências pessoais, conexão ao vivo, bloqueio de notas e o download configurado.
