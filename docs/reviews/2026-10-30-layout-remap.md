# Remapeamento da área de membros

Pedido: revisar diagramação, consultar referências adequadas e garantir menu fixo na rolagem. O usuário autorizou a revisão nesta conversa. Decisões de layout abaixo são escolhas do agente para revisão; não representam identidade final aprovada por Pike.

## Diagnóstico

- O protótipo é código Next.js navegável, não somente uma imagem. O navegador integrado não conseguiu chegar ao servidor na nuvem; capturas estáticas foram entregues como alternativa.
- Teste real antes das mudanças: sidebar desktop mantém y=65px antes/depois de scroll; bottom nav mobile mantém y=828px em viewport 390×900. Ambos já usam position:fixed.
- A toolbar da galeria, porém, rolava para fora enquanto a sidebar conservava seu offset de 65px. Esse espaço não representa um menu que deveria desaparecer: os controles da revisão também devem continuar no topo.
- A home dedicava seu primeiro bloco grande ao hero; a biblioteca ficava abaixo de uma apresentação longa. Há oportunidade de priorizar o acesso ao material para quem já comprou.
- O drawer mobile perdeu foco ao fechar na revisão anterior. Esta rodada de navegação deve devolver foco ao acionador e aceitar Escape.

## Direção adotada

Continuar o skeleton existente, sem trocar stack, marca, auth ou contratos. A ordem da home passa a ser saudação → próxima ação de estudo → biblioteca → boas-vindas → coleções → publicações → comunidade → ofertas → novidades. A timeline continua sendo a home; o início destaca a tarefa principal do membro.

A próxima ação abre o conteúdo de um produto efetivamente adquirido pela fixture, sem afirmar que há progresso salvo. Sem produtos, exibir caminho para a biblioteca/ofertas; sem posts, preservar a biblioteca. PDFs e vídeos continuam pendentes e ações de compra ficam inativas.

Na galeria, toolbar permanece sticky no topo, sidebar fica fixa abaixo dela, navegação interna acomoda janelas baixas; mobile mantém bottom nav fixa e espaço livre no final. O drawer recebe fechamento com Escape e retorno de foco. A natureza fixa deve ser demonstrada por teste de posição e por gravações de rolagem, já que um PNG não demonstra movimento.

## Referências efetivamente consultadas

1. shadcn/ui, documentação Sidebar, commit `96da9cc7f1aa10580a3741664e2a77c721206c00`: cabeçalho e rodapé persistentes, conteúdo de navegação com região rolável. https://github.com/shadcn-ui/ui/blob/96da9cc7f1aa10580a3741664e2a77c721206c00/apps/v4/content/docs/components/radix/sidebar.mdx
2. shadcn/ui, exemplo Dashboard no mesmo commit: composição AppSidebar + SidebarInset + header e conteúdo. https://github.com/shadcn-ui/ui/tree/96da9cc7f1aa10580a3741664e2a77c721206c00/apps/v4/app/%28app%29/examples/dashboard
3. Open edX, Learning MFE, commit `230799eb258f0434a56a87c88e18c920e30f67f3`: StartOrResumeCourseCard antes do outline, conteúdo principal e ferramentas de apoio. https://github.com/openedx/frontend-app-learning/blob/230799eb258f0434a56a87c88e18c920e30f67f3/src/course-home/outline-tab/OutlineTab.jsx

Consultados os documentos/código e uma imagem oficial de exemplo da sidebar. Não foram instalados componentes dessas referências nem copiados seus assets/marca. Repositórios baixados apenas para consulta ficam em /tmp, fora do projeto. Hotmart Club, Circle e Teachable foram tentados, mas a conexão foi barrada pelo proxy (403); não se atribuem observações visuais a essas páginas.

## Execução e verificação

- [x] Regressões antes das mudanças: toolbar persistente, prioridade da biblioteca, próxima ação conforme entitlement e foco do drawer.
- [x] Ajustar layout existente e navegação sem habilitar serviços externos.
- [x] Rodar lint, tipos, testes de domínio e navegador; build e checagens do build.
- [x] Atualizar capturas e gravar rolagem desktop/mobile.
- [x] Enviar somente para branch de trabalho; nenhum merge ou deploy.

Restrições mantidas: sem credenciais, bypass público de sessão, integração ativa, produção ou alteração de preços/assets. Galeria é exclusivamente de desenvolvimento.

## Evidências

Regressões da nova blocagem: 5 passaram; 1 cenário de drawer desktop ignorado por não se aplicar. Suíte completa de desenvolvimento: 69 passaram, 3 ignorados explicitamente (2 de produção e 1 de drawer desktop). Lint, tipos e 7 testes de domínio/segurança passaram. PDFs e vídeos estão nos diretórios de documentação, sem importação de tokens de marca no app. Revisão independente realizada; nenhuma falha crítica/importante encontrada.
