# Revisão independente — refinamento da prévia

Base examinada: c5ea23b, contra os requisitos em `docs/superpowers/specs/2026-10-30-preview-review-design.md`. Revisão somente de leitura dos controles, CSS, gerador e novas fontes de notas/mascote; verificação direcionada por geometria em Chromium, sem novas rodadas de screenshots pelo revisor.

Achado P2: em 1024×320 e 1440×360, marca e rodapé consumiam quase toda a altura do sidebar. A área rolável tinha 16–28px, insuficientes para exibir um alvo de 48px, mesmo focando pelo teclado. O teste original em 600px não detectava o problema.

A regressão agora percorre links e perfil e compara o alvo inteiro com todos os ancestrais que recortam conteúdo e com o viewport. Ela falhou antes da correção. Em janelas com altura de até 620px, há um único contêiner rolável no sidebar, sem a barra aparente; marca, navegação e perfil ficam alcançáveis. Janelas normais preservam o perfil no rodapé e rolagem interna do menu.

Nenhum outro achado consequente na análise de menus/dialogs, referências bloqueadas, texto seguro, independência dos estados, renderização/ciclo de vida do mascote e limites do exportador. A revisão independente não inclui aprovação da identidade final nem integração em produção.
