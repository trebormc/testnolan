#!/usr/bin/env bash
# Captura la imagen genérica para compartir (Open Graph) a partir de la web, con los datos actuales, y la guarda en public/og-image.png.
# Requiere Google Chrome o Chromium y Python 3. Uso: npm run og
set -euo pipefail
cd "$(dirname "$0")/.."
PORT=${PORT:-8765}
CHROME=$(command -v google-chrome || command -v chromium || command -v chromium-browser || true)
[ -n "$CHROME" ] || { echo "Hace falta Google Chrome o Chromium en el PATH" >&2; exit 1; }
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory public >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
for _ in $(seq 1 50); do curl -fs "http://127.0.0.1:$PORT/es/" >/dev/null 2>&1 && break; sleep 0.1; done
"$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --window-size=1200,630 --force-device-scale-factor=1 \
  --virtual-time-budget=8000 --screenshot=public/og-image.png "http://127.0.0.1:$PORT/es/?og=1" >/dev/null 2>&1
python3 - <<'PY'
import struct
with open('public/og-image.png','rb') as f: f.read(16); w,h=struct.unpack('>II',f.read(8))
assert (w,h)==(1200,630), f'la captura mide {w}x{h}, no 1200x630'
print(f'public/og-image.png actualizada ({w}x{h}). Recuerda subir ?v= en las etiquetas og:image y twitter:image de public/es/index.html para que las redes la vuelvan a leer.')
PY
