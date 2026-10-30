# Menu fixo — demonstrações do protótipo

A página rola 1600px; a posição do menu é conferida antes/depois. Cada quadro foi capturado no app local real; a sequência é reproduzida a 12fps com FFmpeg do sistema, não é uma captura em tempo real. Não houve deploy.

- [Desktop — vídeo](desktop-menu-fixed.webm) · [início](desktop-start.png) · [após rolagem](desktop-scrolled.png)
- [Mobile 390px — vídeo](mobile-menu-fixed.webm) · [início](mobile-start.png) · [após rolagem](mobile-scrolled.png)

Reproduzir: mantenha npm run dev e execute npm run demo:scroll. Requer Chromium e FFmpeg no sistema (ou CHROMIUM_PATH / FFMPEG_PATH). O FFmpeg de vídeo do Playwright não pôde ser baixado pela política de rede; nenhum controle de verificação foi desativado.
