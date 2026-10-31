# Style guide — Área de membros

Versão 0.2 · proposta de design · paleta não aplicada ao wireframe.

## 1. Fundamentos visuais
Paleta recebida + vinho complementar

Área de membros · Style guide · proposta v0.2 · 30 de outubro de 2026

> Documento separado da blocagem. As cores e os exemplos desta publicação NÃO foram aplicados ao wireframe. Identidade final e aprovação de marca continuam com Pike/LAB.

Exemplo visual de palette: ver versão HTML/PDF.

| Cor | HEX | RGB | Origem |
| --- | --- | --- | --- |
| Lavanda | #D0D8EF | 208, 216, 239 | Enviada pelo usuário |
| Branco | #FFFFFF | 255, 255, 255 | Enviada pelo usuário |
| Oliva | #9EA466 | 158, 164, 102 | Enviada pelo usuário |
| Grafite | #2D2D2D | 45, 45, 45 | Enviada pelo usuário |
| Vinho | #722F46 | 114, 47, 70 | Adição proposta pelo agente |

A paleta da imagem enviada foi transcrita pelos códigos HEX impressos, sem amostrar o fundo fotográfico. Lavanda, oliva, branco e grafite são a base; o vinho adiciona contraste para ofertas, links e foco. O vinho ainda é uma proposta de design, não uma cor enviada pelo usuário.

## 2. Cor com função
Hierarquia e contraste verificável

| Papel | Combinação | Regra |
| --- | --- | --- |
| Conteúdo | Grafite sobre branco | Corpo e títulos principais |
| Seleção | Grafite sobre lavanda + indicador vinho | Não depender apenas da cor de fundo |
| Acessar | Grafite sobre oliva + borda grafite | Ação do material já adquirido |
| Comprar / conhecer oferta | Branco sobre vinho | Usar apenas quando checkout for aprovado |
| Informação | Grafite sobre lavanda | Mensagem com ícone e rótulo |
| Erro | Vinho sobre fundo branco/rosado | Mensagem textual específica; não usar só cor |

| Par | Contraste | Limiar | Resultado |
| --- | --- | --- | --- |
| Grafite / branco | 13.77:1 | ≥ 4.5:1 | Passa |
| Grafite / lavanda | 9.67:1 | ≥ 4.5:1 | Passa |
| Grafite / oliva | 5.22:1 | ≥ 4.5:1 | Passa |
| Branco / vinho | 9.50:1 | ≥ 4.5:1 | Passa |
| Vinho / branco | 9.50:1 | ≥ 4.5:1 | Passa |
| Vinho / lavanda | 6.67:1 | ≥ 4.5:1 | Passa |
| Grafite / oliva hover | 4.60:1 | ≥ 4.5:1 | Passa |

> Branco sobre oliva resulta em 2,64:1: não usar nem para texto normal nem para texto grande. Vinho sobre oliva resulta em 3,60:1: não usar em texto normal. A borda grafite dá limite perceptível ao botão oliva. Valores são cálculos WCAG, não uma certificação completa de acessibilidade.

## 3. Tipografia e ritmo
Leitura confortável, escala consistente

Família proposta: system-ui com fallbacks nativos. Inter pode ser avaliada depois, com arquivo/licença e hospedagem própria. Não distribuir SF Pro ou fontes de referência sem autorização.

| Token | Desktop | Mobile |
| --- | --- | --- |
| Display | 40 / 48 · 700 | 32 / 40 · 700 |
| H1 | 32 / 40 · 700 | 26 / 34 · 700 |
| H2 | 24 / 32 · 700 | 24 / 32 · 700 |
| H3 | 18 / 26 · 600 | 18 / 26 · 600 |
| Body | 16 / 24 · 400 | 16 / 24 · 400 |
| Label | 14 / 20 · 600 | 14 / 20 · 600 |
| Caption | 12 / 16 · 500 | 12 / 16 · 500 |

Formato: tamanho / altura de linha em px · peso. Corpo mínimo de 16px para o público principal e para evitar zoom involuntário em campos no iOS. Caption é metadado curto; não reduzir instruções essenciais a caption.

| Fundamento | Valor | Aplicação |
| --- | --- | --- |
| Espaçamento | 4, 8, 12, 16, 24, 32, 48, 64px | Base de 4/8; não criar medidas arbitrárias |
| Seções | 64px desktop / 48px mobile | Separação de blocos principais |
| Grid | 16px entre cards | Mesmo alinhamento de títulos e conteúdo |
| Raios | 8 / 12 / 16 / 999px | Inputs / cards / hero / pills |
| Conteúdo | 1120px máx.; gutter 32 / 16px | Desktop / mobile |
| Texto longo | 60–75 caracteres por linha | Artigos e instruções de suporte |

Exemplo visual de type: ver versão HTML/PDF.

## 4. Elementos de interface
Exemplos visuais para implementação futura

Exemplo visual de components: ver versão HTML/PDF.

| Componente | Medidas | Comportamento visual |
| --- | --- | --- |
| Botão | 48px altura; padding 12×20; ícone 20px | Default, hover, pressed, focus, disabled, loading |
| Input | 48px altura; radius 8; padding 12×16 | Label acima; ajuda e erro abaixo |
| Tabs | 48px altura; indicador 2px | Texto selecionado e aria-selected |
| Badge | 24px mín.; padding 4×8 | Texto + cor; nunca única fonte de estado |
| Card produto | Capa 3:4; gap 16px; radius 12 | Título até 2 linhas; CTA único por finalidade |
| Feedback | Padding 16; ícone 20px; gap 12 | Informação, erro ou sucesso com frase explícita |

Os exemplos mostram aparência, não ações reais. Loading não indica sucesso de compra, envio de e-mail ou liberação de acesso. A documentação demonstra a paleta; o wireframe segue neutro.

## 5. Navegação lateral
Direção do exemplo enviado, sem copiar marca

Exemplo visual de sidebar: ver versão HTML/PDF.

| Modo | Dimensão proposta | Regra |
| --- | --- | --- |
| Expandido | 240px; itens 48px; ícones 20px | Ícone + texto; seções de biblioteca e ajuda |
| Recolhido | 72px; alvo mínimo 44px | Tooltip e nome acessível; active perceptível |
| Tablet | 72px entre 768 e 1023px | Expansão opcional; preservar área de leitura |
| Mobile | Barra 64px + safe area; drawer até 360px | Início, Produtos, Ofertas, Mais |
| Fixação | Altura do viewport; navegação rolável | Cabeçalho e rodapé não somem em menu longo |

> A referência Shopall define linguagem de sidebar clara, divisórias leves, ícones e modos expandido/recolhido. Não transportar o azul, nome, marca, contadores de loja ou opções de analytics/financeiro para a área do aluno. Este estilo será aplicado após o refinamento da blocagem.

## 6. Tom, imagens e entrega
Regras que mantêm o sistema coerente

- Texto direto, acolhedor e específico: “Ver materiais”, “PDF em preparação”, “Enviar novo link”.
- Não inventar progresso, depoimento, disponibilidade, número de compradores ou prazo de entrega.
- Imagens de produto: 3:4, pelo menos 900×1200; hero 16:7, pelo menos 1600px; arquivos finais sob gate Riccele.
- Sem arquivo: placeholder identificado e controle de download desativado. Sem vídeo: esconder play.
- Uma ação dominante por bloco; acessar e comprar têm finalidade e cor diferentes.
- Não copiar pessoas, logotipos, imagens ou textos das referências.
- Movimento de 150–200ms; desativar em prefers-reduced-motion; nenhum efeito necessário para compreender a ação.

| Handoff | Responsável | Aceite |
| --- | --- | --- |
| Design | Pike | Hierarquia, tipografia, contraste e sidebar |
| Tech | Alisson / Iago | Tokens, estados, semântica e auth server-side |
| Produto | Zed | Entitlements, nomes, preços e ofertas |
| Assets | Riccele | Capas, PDFs, hero, vídeo e permissões |
| Produção | LAB / Alisson | Go explícito; esta documentação não publica nada |

Arquivos irmãos: design-system.pdf, tokens.json, tokens.css e contrast-report.json. A paleta é repetida no design system pelo mesmo gerador para evitar divergência. Status: proposta pronta para revisão visual; não significa autorização de deploy.
