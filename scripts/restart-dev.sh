#!/usr/bin/env bash
# Restarts the local dev server (pid kept in .local/dev.pid)
cd "$(dirname "$0")/.." && mkdir -p .local
if [ -f .local/dev.pid ]; then kill "$(cat .local/dev.pid)" 2>/dev/null; sleep 0.4; fi
DATABASE_URL=${DATABASE_URL:-postgres://postgres@127.0.0.1:5433/jse} PORT=${PORT:-8788} nohup node scripts/dev-server.mjs > .local/dev.log 2>&1 &
echo $! > .local/dev.pid
sleep 1.5
curl -s "http://127.0.0.1:${PORT:-8788}/api/health" | head -c 160; echo
