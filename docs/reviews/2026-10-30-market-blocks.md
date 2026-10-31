# Pesquisa de blocagem — área de membros

30 de outubro de 2026 · revisão estrutural e referências para o projeto Área de membros.

## Pergunta de pesquisa e limites

Como organizar uma home de membro que entregue materiais comprados com clareza, mantenha navegação persistente e acrescente conteúdo editorial e ofertas sem transformar o acesso pós-compra numa página de vendas?

Foram lidos código e documentação públicos de plataformas de aprendizagem e de um sistema de componentes. Esta é uma pesquisa de padrões de interface; não é uma inspeção autenticada das plataformas comerciais, teste com usuárias, prova de conversão ou comparação de planos/preços. Não se atribuem métricas de retenção ou vendas a esses padrões.

Hotmart Club, Circle e Teachable foram tentados diretamente, mas o proxy de rede recusou as conexões. Portanto, suas interfaces atuais não foram observadas nesta rodada. As referências abertas abaixo foram acessadas e inspecionadas de fato. A imagem de sidebar e as referências de style guide/design system enviadas pelo usuário orientam a linguagem visual futura, sem copiar marca ou conteúdo.

## Fontes verificadas

### 1. Open edX — área do aluno e estrutura de curso

Fonte: [Learning MFE / OutlineTab](https://github.com/openedx/frontend-app-learning/blob/230799eb258f0434a56a87c88e18c920e30f67f3/src/course-home/outline-tab/OutlineTab.jsx), commit `230799eb258f0434a56a87c88e18c920e30f67f3`.

O componente posiciona StartOrResumeCourseCard antes da estrutura de seções do curso. Conteúdo principal e widgets de apoio usam colunas distintas. Há controles de expandir/recolher outline e mensagens contextuais que dependem do estado do curso. A evidência é o código consultado, não uma captura de uma conta real.

**Aplicar:** tornar a próxima ação do aluno clara antes dos blocos secundários; priorizar biblioteca e módulos; apresentar suporte e informações auxiliares sem competir com o material. No projeto atual não há histórico real, então a nova ação usa “Ver materiais”, sem fingir “retomar” ou progresso salvo.

**Não importar:** provas, certificados, prazos acadêmicos, proctoring, metas semanais ou analytics. São necessidades de um LMS maior e não pertencem a esta base de infoprodutos.

### 2. Moodle — visão de cursos, filtros e estados vazios

Fonte: [myoverview / main](https://github.com/moodle/moodle/blob/0580991669815767026aea115a2053e2040378af/public/blocks/myoverview/templates/main.mustache), [cards](https://github.com/moodle/moodle/blob/0580991669815767026aea115a2053e2040378af/public/blocks/myoverview/templates/view-cards.mustache) e [zero state](https://github.com/moodle/moodle/blob/0580991669815767026aea115a2053e2040378af/public/blocks/myoverview/templates/zero-state.mustache), commit `0580991669815767026aea115a2053e2040378af`.

O bloco agrupa filtros, pesquisa, ordenação e seletor de visualização antes dos resultados. Cards podem incluir categoria e progresso somente quando há informação. O zero state tem título, explicação e ações próprias, em vez de deixar uma grade vazia. A região de pesquisa também é identificada semanticamente.

**Aplicar:** separar filtros de resultados; contar materiais reais; manter estados vazios específicos por contexto; evitar progresso artificial. Nesta base, filtros continuam simples para Todos/Principais/Complementos/Bônus; não há necessidade de acrescentar vários modos de visualização sem evidência de uso.

**Não importar:** gestão de curso, papéis de professor, administração ou uma barra de filtros complexa demais para poucas coleções. O objetivo é reduzir esforço da compradora no celular, não expor todas as capacidades de um LMS.

### 3. shadcn/ui — composição de sidebar e shell

Fonte: [Sidebar](https://github.com/shadcn-ui/ui/blob/96da9cc7f1aa10580a3741664e2a77c721206c00/apps/v4/content/docs/components/radix/sidebar.mdx), [Dashboard](https://github.com/shadcn-ui/ui/tree/96da9cc7f1aa10580a3741664e2a77c721206c00/apps/v4/app/%28app%29/examples/dashboard) e [exemplo visual](https://github.com/shadcn-ui/ui/blob/96da9cc7f1aa10580a3741664e2a77c721206c00/apps/v4/public/r/styles/new-york/sidebar-07-light.png), commit `96da9cc7f1aa10580a3741664e2a77c721206c00`.

A documentação distingue header, conteúdo rolável e footer da sidebar, além de grupos, submenus, itens, trigger e rail. Descreve modos offcanvas, ícones e não recolhível. O dashboard separa AppSidebar, SidebarInset e SiteHeader, tornando explícita a relação entre menu e área principal. Uma imagem oficial de exemplo foi inspecionada.

**Aplicar:** navegação persistente com região interna que acomoda janelas baixas; separação clara entre shell e conteúdo; sidebar clara expandida/recolhida como direção futura da imagem enviada. O refinamento atual mantém a blocagem neutra e corrige toolbar/foco, sem instalar shadcn ou trocar bibliotecas.

**Não importar:** tabelas administrativas, gráficos financeiros, logo, textos, marcas, analytics ou complexidade de menus irrelevante ao aluno. É uma referência de composição; não é uma plataforma de membros usada como evidência de conversão.

## Síntese dos padrões

| Problema | Padrão observado | Adaptação ao projeto | Como validar |
|---|---|---|---|
| Membro quer material comprado | Próxima ação antes do outline (Open edX) | Bloco “Seu próximo passo” usa um produto adquirido pela fixture | CTA abre produto do perfil correto |
| Hero ocupa a primeira dobra | Prioridade ao conteúdo principal | Biblioteca aparece antes do hero de boas-vindas | Ordem real dos blocos e viewport mobile |
| Navegação some ou parece uma faixa estática | Header/content/footer separados | Sidebar e bottom nav fixas; toolbar da revisão sticky | Posição antes/depois de scroll de 1600px |
| Janela baixa corta opções | Região de navegação rolável | Menu interno com min-height:0 e overflow próprio | Todos os links alcançáveis em viewport baixo |
| Grade não explica falta de conteúdo | Zero state contextual (Moodle) | Sem produtos, sem posts e sem ofertas têm textos distintos | Fixtures e testes de cada estado |
| Progresso sem dados | Progresso condicionado à existência (Moodle) | Mostrar estrutura/pendência, não “último visto” inventado | Nenhum estado fictício confundido com compra real |
| Aparência mistura acesso e upsell | Separação de tarefas | Biblioteca primeiro; ofertas depois do conteúdo editorial | Adquiridos nunca reaparecem como oferta |
| Ícones sozinhos ficam ambíguos | Sidebar composta e modo compacto | Nome acessível, tooltip e indicador de rota na etapa visual | Teclado/leitor de tela na aplicação do tema |

## Auditoria das telas desta base

| Tela / grupo | Revisão de diagramação | Decisão nesta rodada |
|---|---|---|
| Pedir link | Card central, label persistente, ação clara | Preservar; nenhum envio fictício |
| Link enviado | Confirmação ilustrativa versus estado real | Preservar distinção e cooldown |
| Callback | Erro compreensível e caminho para recuperar acesso | Preservar negação de token arbitrário |
| Home/timeline | Hierarquia entre próxima ação, biblioteca e editorial | Reordenar biblioteca/boas-vindas e incluir próxima ação |
| Artigo | Breadcrumb, coluna de leitura e metadados | Preservar coluna e slug correto |
| Categoria | Título, descrição e lista coerentes | Preservar e manter vazio contextual |
| Biblioteca | Filtros, cards e pendências separados de recomendações | Preservar entitlement e ações de ver estrutura |
| Produto | Capa/título, tabs e módulos | Preservar; não alegar progresso real |
| Módulo | Área de leitura, download e anterior/próximo | Preservar pendência e bloqueio de download |
| Bônus | Posse e bloqueio explícitos | Preservar decisões do perfil, sem bônus universal inventado |
| Ofertas | Separar descoberta de compra | Preservar CTA inativo e preço pendente |
| Produto bloqueado | Informação pública e próximo passo | Preservar ausência de asset protegido |
| Suporte | FAQ escaneável e contato pendente | Ajuda pública já disponível sem sessão |
| Conta | E-mail, compras e ações separadas | Preservar dados ilustrativos identificados |
| 404 / erro / loading | Próximo passo e proporções | Preservar; não substituir conteúdo por spinner integral |

## O que muda agora e o que fica para depois

**Agora:** hierarquia da home, persistência dos controles de revisão, espaço do menu, adaptação a janelas baixas e retorno de foco/Escape no drawer. As regras globais de shell se aplicam às demais telas; não é necessário redesenhar cada página arbitrariamente para demonstrar revisão completa.

**Documentado para a próxima etapa:** sidebar clara expandida/recolhida, paleta com vinho e implementação dos tokens semânticos. A paleta não é aplicada à blocagem. A imagem enviada define o estilo desejado do menu, não os itens de um painel de loja.

**Permanecem fora:** autenticação real, assets finais, progresso persistido, integração de pagamento/e-mail, pesquisa com clientes, teste de conversão e deploy. Não há pesquisa suficiente para afirmar qual ordem converte mais; a ordem adotada é uma hipótese de usabilidade baseada na tarefa pós-compra e no briefing.

## Experimentos recomendados após os assets

1. Teste com 3–5 compradoras em 390px: localizar um PDF comprado sem ajuda, identificar um material pendente e voltar à biblioteca.
2. Comparar compreensão de “Ver materiais” versus “Acessar” quando o conteúdo ainda não está disponível; não usar taxas de clique como substituto de sucesso na tarefa.
3. Validar sidebar compacta com nome acessível e toque real; confirmar se tablet precisa de recolhimento ou drawer.
4. Revisar leitura e contraste com a paleta aplicada em ambiente local, inclusive estados de erro e foco; comparar screenshots de todas as telas.
5. Medir sucesso de tarefa, erros de navegação e clareza de bloqueio antes de habilitar upsell ou integrações.

Entregáveis visuais separados: [Style guide](../design/style-guide.pdf), [Design system](../design/design-system.pdf), [tokens](../design/tokens.json) e [matriz de contraste](../design/contrast-report.json).
