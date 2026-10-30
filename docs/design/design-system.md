# Design system — Área de membros

Versão 0.2 · proposta de design · paleta não aplicada ao wireframe.

## 1. Um sistema para aprender
Escopo, princípios e limites

Área de membros · Design system · proposta v0.2 · 30 de outubro de 2026

> Sistema documentado, separado do tema do wireframe. A blocagem continua neutra. Não há autenticação real, compra, arquivo privado ou envio de e-mail habilitado por estes exemplos.

- Prioridade do membro: chegar ao material adquirido antes de descobrir novas ofertas.
- Consistência: mesmos componentes e estados em home, catálogo, produto e suporte.
- Acesso explícito: biblioteca, pendente, bloqueado e oferta não são sinônimos.
- Progressive disclosure: mostrar o essencial; módulos e detalhes aparecem na página do produto.
- Acessibilidade: texto mínimo, contraste mensurado, teclado e foco previsível.
- Configuração: produto/oferta e slots separados da composição visual.

Exemplo visual de palette: ver versão HTML/PDF.

As quatro cores originais foram transcritas da imagem enviada. Vinho #722F46 foi acrescentado como proposta; neutros e estados abaixo são derivados funcionais, claramente separados das cores originais.

| Camada | Papel |
| --- | --- |
| Primitivos | Cores originais e vinho |
| Semânticos | Funções: surface, text, access, buy, focus e estados |
| Componentes | Aplicação contextual com métricas e comportamento |
| Padrões | Acesso, leitura, biblioteca, ofertas e suporte |

## 2. Tokens de cor
Do valor bruto à intenção de uso

| Primitivo | HEX | RGB |
| --- | --- | --- |
| Lavanda | #D0D8EF | 208, 216, 239 |
| Branco | #FFFFFF | 255, 255, 255 |
| Oliva | #9EA466 | 158, 164, 102 |
| Grafite | #2D2D2D | 45, 45, 45 |
| Vinho | #722F46 | 114, 47, 70 |

| Token semântico | Valor / alias | Uso |
| --- | --- | --- |
| surface | #FFFFFF | Cards e sidebar clara |
| background | #F7F8FA (derivado) | Fundo de trabalho |
| text | #2D2D2D | Conteúdo principal |
| textMuted | #5B606B (derivado) | Metadados legíveis |
| selectedBackground / Text | #D0D8EF / #2D2D2D | Item selecionado |
| selectedIndicator / focusRing | #722F46 | Indicador e anel |
| accessBackground / Text | #9EA466 / #2D2D2D | Acesso adquirido |
| accessBorder | #2D2D2D | Contorno perceptível do botão oliva |
| buyBackground / Text | #722F46 / #FFFFFF | Compra aprovada para implementação futura |
| borderControl / Decorative | #737781 / #D7D9E0 | Borda funcional / separador decorativo |
| disabledBackground / Text | #ECEEF3 / #5B606B | Controle inativo |
| errorBackground / Text | #F4E9ED / #722F46 | Feedback com rótulo e descrição |

Tokens exportados em tokens.json e tokens.css. O CSS usa escopo opt-in [data-members-theme="brand"] e NÃO está importado no app. Não substituir apenas --brand-access no código atual: também mapear foreground/border, pois branco sobre oliva não passa no contraste.

## 3. Escalas e geometria
Métricas reutilizáveis em todas as telas

| Token | Desktop | Mobile |
| --- | --- | --- |
| Display | 40 / 48 · 700 | 32 / 40 · 700 |
| H1 | 32 / 40 · 700 | 26 / 34 · 700 |
| H2 | 24 / 32 · 700 | 24 / 32 · 700 |
| H3 | 18 / 26 · 600 | 18 / 26 · 600 |
| Body | 16 / 24 · 400 | 16 / 24 · 400 |
| Label | 14 / 20 · 600 | 14 / 20 · 600 |
| Caption | 12 / 16 · 500 | 12 / 16 · 500 |

| Layout / token | Valor | Regra |
| --- | --- | --- |
| Sidebar expandida / recolhida | 240 / 72px | Coluna independente do conteúdo |
| Container / padding | 1120px / 32px desktop, 16px mobile | Texto alinhado ao início dos cards |
| Breakpoints | 768 / 1024px | Mobile / tablet / desktop |
| Cards de produtos | 4–5 desktop; 3 tablet; 2 mobile | Na home mobile, carrossel com peek |
| Espaços | 4, 8, 12, 16, 24, 32, 48, 64px | Gap 16; seções 64 / 48 |
| Raios | 8 / 12 / 16 / 999px | Form / card / hero / pill |
| Z-index proposto | 0 conteúdo; 20 header; 30 sidebar; 40 toolbar; 50 bottom nav; 60 drawer | Evitar overlay sem ordem definida |
| Toque / controles | 44px mínimo / 48px recomendado | Não depender do ícone de 20px como alvo |

Medidas são especificação para a etapa visual. O wireframe pode conservar medidas equivalentes já testadas; discrepâncias são revisadas com Pike antes da aplicação definitiva.

## 4. Biblioteca de componentes
Anatomia, estados e contratos de UI

| Componente | Anatomia | Estados / contrato |
| --- | --- | --- |
| Button | Label, ícone opcional, indicador de envio | default / hover / pressed / focus / disabled / loading |
| Input | Label persistente, campo, hint, erro | empty / filled / focus / invalid / disabled |
| ProductCard | Capa 3:4, tipo, título, status, ação | owned / pending / locked; não expor download em locked |
| OfferCard | Capa, selo, título, preço, CTA | Excluir adquiridos; preço ausente = pendente, compra desabilitada |
| ModuleRow | Número, título, tipo, status, seta | PDF/video pending / available / locked / completed real |
| AssetViewer | Título, área de exibição, ações e paginação | Sem asset: placeholder; sem entitlement: não retornar asset |
| FeedbackPanel | Ícone, título, explicação, próximo passo | empty / error / pending / expired |
| Skeleton | Capa/linhas com proporções finais | role=status; sem spinner de página inteira |
| Accordion | Pergunta, controle, conteúdo | Teclado, foco e aberto/fechado |
| Tabs | Lista de abas, painel associado | Roving focus; setas/Home/End na implementação visual |

Exemplo visual de states: ver versão HTML/PDF.

Os contratos de dados não devem depender da cor. Um card bloqueado sempre tem texto de estado; um produto comprado com PDF pendente continua comprado, mas não promete arquivo disponível.

## 5. Sidebar e navegação
Persistência sem esconder o conteúdo

Exemplo visual de sidebar: ver versão HTML/PDF.

- Desktop: coluna branca fixa, cabeçalho de marca, seções, itens de 48px e rodapé; conteúdo interno do menu pode rolar em janela baixa.
- Expandir/recolher: manter rota ativa, tooltip e aria-label quando houver apenas ícones; controle com aria-expanded.
- Mobile: barra inferior fixa com safe area e espaço reservado no fim da página; drawer usa Mais e fecha com Escape.
- Ao fechar pelo botão ou Escape, devolver foco ao acionador. Em navegação, posicionar foco no destino/título.
- Item atual: aria-current=page + ícone/texto + indicador vinho e fundo lavanda; não depender de cor.
- O menu da referência fornece a linguagem, não o conteúdo: sem Stores, Orders ou Finance na área do aluno.
- Controles de revisão da galeria ficam separados do produto; não se tornam parte da navegação de produção.

Aceite de rolagem: registrar posição do menu antes/depois de scroll de 1600px; diferença máxima de 1px. Verificar desktop e 390px, altura reduzida e safe area. PNGs são estáticos; usar gravação ou protótipo local para demonstrar fixação.

## 6. Padrões e estados de acesso
Entitlement governa o conteúdo

| Situação | UI esperada | Ação permitida |
| --- | --- | --- |
| Sem sessão | Tela de acesso; ajuda pública | Pedir link, sem revelar existência da conta |
| Sessão expirada | Aviso e retorno ao acesso | Solicitar novo link |
| Compra concedida + arquivo pronto | Biblioteca e página do produto | Exibir/baixar somente via backend autorizado |
| Compra concedida + arquivo pendente | Card pertencente à biblioteca + pendência | Ver estrutura; download desabilitado |
| Membro sem entitlement | Capa/descrição pública + bloqueio | Conhecer oferta, se configurada/aprovada |
| Sem produtos | Vazio explicativo | Ver ofertas sem fingir compra |
| Sem posts | Biblioteca preservada | Continuar pelos materiais |
| Todos os produtos adquiridos | Sem ofertas repetidas | Mensagem de catálogo completo |
| Erro de carregamento | Explicação + retry + suporte | Tentar de novo sem inventar sucesso |

Regra: offer.id → perfil → união de productIds. Backend decide acesso antes de retornar conteúdo protegido. Tokens visuais e componentes nunca concedem direitos. Magic link, webhook, persistência e segurança de sessão seguem a revisão Tech; os stubs atuais retornam 501.

> A direção visual não ativa ofertas reais, checkout, e-mail ou sessão. Imagens e preços nas referências não são material do produto.

## 7. Acessibilidade e validação
Critérios mensuráveis, sem promessas vagas

| Critério | Meta | Como verificar |
| --- | --- | --- |
| Texto normal | Contraste ≥4,5:1 | Matriz de pares em contrast-report.json |
| Texto grande | ≥3:1 quando ≥24px regular ou ≥18,66px bold | Não usar isso para reduzir corpo |
| Controle / indicador essencial | Contraste ≥3:1 | Borda funcional, foco e ícone significativo |
| Teclado | Sem ação inacessível; foco visível | Tab, Shift+Tab, Enter, Space, Escape, setas em tabs |
| Foco | Anel 2px vinho + offset 2px | Evitar recorte por overflow |
| Toque | ≥44×44px | Medir área clicável, não só desenho |
| Zoom / reflow | 200%; testar 320 / 390px | Sem corte de texto ou scroll horizontal global |
| Movimento | 150 / 200ms; reduced-motion=0 | Nenhum dado depende de animação |
| Feedback | Rótulo textual + role/aria apropriado | Evitar vários alerts para a mesma mensagem |

| Par validado | Contraste | Limiar | Resultado |
| --- | --- | --- | --- |
| Grafite / branco | 13.77:1 | ≥ 4.5:1 | Passa |
| Grafite / lavanda | 9.67:1 | ≥ 4.5:1 | Passa |
| Grafite / oliva | 5.22:1 | ≥ 4.5:1 | Passa |
| Branco / vinho | 9.50:1 | ≥ 4.5:1 | Passa |
| Vinho / branco | 9.50:1 | ≥ 4.5:1 | Passa |
| Vinho / lavanda | 6.67:1 | ≥ 4.5:1 | Passa |

Automação axe e testes de navegação ajudam, mas não substituem revisão manual com teclado/leitor de tela e teste com compradoras. O documento registra requisitos; não certifica que a aplicação visual futura já passou por todos eles.

## 8. Governança e aplicação futura
Do wireframe ao tema, sem atalhos

- Esta versão documenta proposta, não identidade final aprovada. Nenhuma cor foi aplicada ao wireframe por este pacote.
- Tokens.json centraliza os valores exportados de cor e layout. O gerador deriva paleta, aliases CSS e contraste; tabelas prescritivas, espécimes e textos de especificação também exigem revisão ao alterar valores. Não há sincronização automática de toda a narrativa.
- Aplicação futura: mapear tokens semânticos para componentes, implementar foreground e bordas, validar estados e só então comparar screenshots.
- Não importar o CSS da documentação por acidente no app; ele permanece em docs/design.
- Atualizações de cor exigem recalcular os pares; alterações de navegação exigem repetir testes de foco e rolagem.
- Riccele libera assets e permissões; Zed define preço/acesso; Pike aprova direção visual; Alisson valida implementação e segurança.
- Registrar versões, motivo, evidências e pendências. Sem substituição silenciosa de tokens ou alegações de entrega.

| Gate | Responsável | Evidência |
| --- | --- | --- |
| Blocagem | Produto / Design | Fluxos, hierarquia, estados e responsivo |
| Style guide | Pike / LAB | Paleta + tipografia + componentes aprovados |
| Assets | Riccele | Arquivos e direitos de uso |
| Acesso / contratos | Alisson / Iago | Sessão, entitlement e APIs reais testadas |
| Oferta / preços | Zed | Config validada; checkout revisado |
| Produção | LAB / Alisson | Go explícito separado desta documentação |

Arquivos: style-guide.pdf, design-system.pdf, versões HTML/Markdown, tokens.json, tokens.css e contrast-report.json. Referências de mercado e decisões de blocagem estão em ../reviews/2026-10-30-market-blocks.md. Sem deploy de produção.
