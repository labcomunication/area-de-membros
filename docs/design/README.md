# Pacote visual — área de membros

Proposta v0.2 construída com a paleta e referências enviadas pelo usuário. **Não aplicada ao wireframe.**

- [Style guide — PDF](style-guide.pdf) · [HTML](style-guide.html) · [Markdown](style-guide.md)
- [Design system — PDF](design-system.pdf) · [HTML](design-system.html) · [Markdown](design-system.md)
- [Tokens JSON — fonte de valores](tokens.json) · [CSS com escopo futuro](tokens.css)
- [Contrastes calculados](contrast-report.json)
- [Pesquisa de blocagem e decisões](../reviews/2026-10-30-market-blocks.md)

Paleta enviada: lavanda `#D0D8EF`, branco `#FFFFFF`, oliva `#9EA466`, grafite `#2D2D2D`. Vinho acrescentado por proposta: `#722F46`.

Vinho/foreground branco é adequado para ofertas e ações de foco; oliva/foreground grafite com contorno grafite para acesso. Não usar texto branco sobre oliva. Os documentos explicam variantes, medidas e estados; aprovação visual de Pike/LAB continua pendente.

Regenerar após revisar tokens e textos:

```sh
npm run docs:design
```

Requer Python 3, Node.js 24 e Chromium configurado conforme README principal. O gerador valida os pares de contraste antes de exportar os documentos. As versões HTML são autônomas; os PDFs estão no repositório para consulta sem iniciar servidor.
