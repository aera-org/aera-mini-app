#!/usr/bin/env bash
set -uo pipefail

PORT=8000
ENV_FILE=".env"

ngrok http "$PORT" --log=stdout &
NGROK_PID=$!

cleanup() {
  echo ""
  echo "Stopping ngrok..."
  kill "$NGROK_PID" >/dev/null 2>&1 || true
}
trap cleanup INT TERM

echo "Waiting for ngrok tunnel..."

# Wait until an https public_url appears (up to ~30s)
NGROK_URL=""
for _ in {1..120}; do
  JSON="$(curl -s http://127.0.0.1:4040/api/tunnels || true)"

  if command -v jq >/dev/null 2>&1; then
    NGROK_URL="$(echo "$JSON" \
      | jq -r '.tunnels[]?.public_url // empty' \
      | grep -E '^https://' \
      | head -n1 || true)"
  else
    NGROK_URL="$(python3 - <<'PY'
import json, sys
try:
  data=json.load(sys.stdin)
except Exception:
  print(""); raise SystemExit
for t in data.get("tunnels",[]):
  u=t.get("public_url","")
  if u.startswith("https://"):
    print(u); break
else:
  print("")
PY
<<< "$JSON" 2>/dev/null || true)"
  fi

  if [[ -n "$NGROK_URL" ]]; then
    break
  fi

  sleep 0.25
done

if [[ -z "$NGROK_URL" ]]; then
  echo "Failed to get ngrok https URL after waiting."
  echo "Raw /api/tunnels response:"
  curl -s http://127.0.0.1:4040/api/tunnels || true
  exit 1
fi

echo "Ngrok URL: $NGROK_URL"

# Update/insert APP_URL in .env (macOS sed needs -i '')
if [[ -f "$ENV_FILE" ]] && grep -qE '^APP_URL=' "$ENV_FILE"; then
  sed -i '' "s|^APP_URL=.*|APP_URL=$NGROK_URL|" "$ENV_FILE"
else
  echo "APP_URL=$NGROK_URL" >> "$ENV_FILE"
fi

echo "Updated APP_URL in $ENV_FILE"
echo "ngrok is running. Press Ctrl+C to stop."

wait "$NGROK_PID"


