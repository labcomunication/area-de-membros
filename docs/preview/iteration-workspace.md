# Wireframe — navegação no topo, notas e movimento suave

Escopo autorizado em voz em 30/10/2026. Alterar apenas a prévia offline e os geradores/evidências. Não finalizar o design system, tocar na aplicação, persistir dados, integrar IA ou publicar.

Plano e decisões:

1. Ofertas: capa ocupa toda a lateral; corpo flexível com preço, botão inativo e status alinhados no rodapé. Descrições longas podem ser abertas/recolhidas. Carrossel manual com setas e gesto horizontal, sem reprodução automática. Até cinco cards demonstrativos; propostas adicionais explicitamente fictícias, sem oferta configurada.
2. Estúdio IA: personagem centralizado; nome próprio no lugar do estado emocional visível; instruções e frases sob o rosto retiradas da vista, ajuda acessível mantida. Título/textos centralizados abaixo. Os três passos ficam em um bloco separado.
3. Movimento: preservar as formas e cores atuais; montar uma ilha Three.js no mesmo palco. Projeção do ponteiro em plano frontal, lookAt amortecido, expansão por mola, happy por 300ms e nervous com três cliques em 500ms por 1s. Arraste limitado com retorno elástico, sem disparar clique. Movimento reduzido desativa acompanhamento, expansão e tremor.
4. Minha conta → Personalização: navegação padrão ou ícones no topo. No segundo modo, ocultar sidebar e manter os ícones aderentes ao topo ao rolar. Incluir controle explícito para restaurar o padrão; no mobile o modo compacto substitui a barra inferior por uma faixa superior rolável.
5. Pessoal → Minhas anotações: quadro local com Ideias, Em andamento e Guardados; criar/editar notas em texto simples; mover por arraste no desktop ou seletor por teclado/toque. Menu de contexto nos cards e botão equivalente guardam referências de materiais, sem conceder acesso ou salvar arquivos.
6. Mascote no quadro indica ajuda futura. Sem campo de API key, chamada de IA, upload, sincronização ou persistência. Recarregar descarta as notas e preferências da prévia.
7. Verificar fluxos e responsividade, texto seguro, rolagem, carrossel, rodapés, movimento, teclado/toque e ausência de rede; regenerar HTML/ZIP/capturas; lint/tipos; commit local na branch de trabalho.

A nova imagem chegou: seis famílias de formas chapadas (gota, triângulo arredondado, nuvem/flor, círculo, oval e trevo), olhos claros em cápsula e cores sólidas. A revisão recria essa linguagem em SVG, com quinze variantes e nomes próprios. A referência substitui os retratos com cabelo e gradiente.

Orientação: UI UX Designer e Impeccable (layout/movimento). O carregador/binário do Impeccable não existe neste ambiente; contexto lido diretamente do projeto. Mobbin não expôs ferramentas ou skill nesta sessão, e a página pública do Grok ficou bloqueada pelo proxy. As imagens fornecidas pelo usuário são a evidência visual utilizada; não se alega inspeção de catálogo ou demonstração ao vivo.

Tese espacial: a tarefa principal continua sendo acessar materiais. No Estúdio IA, o personagem lidera, o texto apoia abaixo, e os passos futuros são uma região separada. No quadro, escrever e mover notas têm prioridade sobre o ajudante. No carrossel, capas e textos podem variar, mas preço/botão/status compartilham o mesmo rodapé.

Tese de movimento: o único momento expressivo é o personagem em reação ao ponteiro/arraste. Navegação e cards usam feedback curto e previsível. RAF roda apenas durante interação/acomodação, sem animação de entrada ou reprodução automática de carrossel; os deslocamentos são desativados com movimento reduzido.

## Contratos posteriores incorporados

O pedido escrito de volume 3D substitui o acompanhamento 2D anterior e a mudança de cor por clique. As quinze silhuetas atuais são reutilizadas como geometria arredondada, com olhos claros e iluminação neutra/quente. Estados idle/happy/nervous têm prioridade e timers limitados; hover/foco é paralelo. O fallback estático é apenas para ausência de WebGL.

O briefing de navegação está em ../briefings/2026-10-30-navigation-motion.md: nomes inativos colapsados, ícones sempre visíveis, entrada/saída por largura/escala e mola compartilhada, sem canvas no menu. O shell DOM persiste entre telas para permitir a saída do nome anterior. aria-current e nomes acessíveis são mantidos; movimento reduzido troca instantaneamente. O menu compacto desktop fica centralizado.

Dependências de desenvolvimento Three.js e esbuild autorizadas pelo pedido de animação; incorporadas ao HTML para uso offline. Nenhuma mudança de stack da aplicação ou do design system.
