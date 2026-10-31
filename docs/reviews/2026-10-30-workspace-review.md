# Revisão da prévia — quadro, navegação e mascote

A revisão independente parcial encontrou três problemas reproduzíveis: labels ocultos vazavam da faixa compacta no mobile, a regra CSS de clamp continuava vencendo ao abrir descrições, e o corpo do card curto não esticava até o rodapé dos demais. Os testes de regressão falharam antes das correções e passaram depois. A faixa agora contém seus elementos posicionados, a regra expandida tem especificidade adequada e os cards esticam o corpo.

A revisão foi interrompida por limite de uso da ferramenta antes de um parecer final; não foi substituída por uma alegação de aprovação. O restante foi conferido diretamente com verificações funcionais e capturas.

Na etapa de navegação animada, a medição inicial com peso normal cortava o texto quando o item ficava ativo/negrito. A largura natural é medida novamente após definir o estado ativo e ao redimensionar. O teste verifica o conteúdo real, não apenas a presença do rótulo. A inspeção mobile também detectou encolhimento dos links na faixa compacta: eles agora preservam a largura de ícone/nome e a faixa oferece rolagem, sem sobrepor o próximo ícone.

Na ilha Three.js, a prova por pixels das seis famílias mostrou que o tone mapping aplicado aos olhos brancos mudava sua cor. Os olhos agora preservam branco sem tone mapping; corpo e iluminação mantêm o tratamento de volume. O teste exige corpo e olhos efetivamente renderizados.

O teste de clique rápido usa entrada real do mouse com três cliques na mesma chamada, evitando que esperas de estabilidade do Playwright ultrapassem a janela de 500ms. O comportamento usa os mesmos limites solicitados, sem relaxar os timers para passar o teste.

Os plugins UI UX Designer e Impeccable orientaram componentes/movimento. Mobbin não disponibilizou ferramentas nesta sessão; o acesso público ao Grok foi bloqueado pelo proxy. A referência visual é a imagem enviada por LAB. O design system não foi alterado.
