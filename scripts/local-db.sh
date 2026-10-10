#!/usr/bin/env bash
# Local PostgreSQL for development and tests (port 5433, trust auth, data in .local/pg).
#   npm run db:local              # create the cluster once, start it, create database "jse"
#   npm run db:local -- reset     # drop and recreate "jse" (migrations run when the API starts)
#   npm run db:local -- testpw    # give the test accounts the known test passwords (LOCAL ONLY)
#   npm run db:local -- stop
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$(pwd)
PGBIN=${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}
PORT=${LOCAL_PG_PORT:-5433}
DATA="$ROOT/.local/pg"
DB=${LOCAL_PG_DB:-jse}
CMD=${1:-start}

# initdb/pg_ctl refuse to run as root: run them as the postgres user when needed
as_pg() { if [ "$(id -u)" = "0" ]; then runuser -u postgres -- "$@"; else "$@"; fi; }
psql_local() { "$PGBIN/psql" -h 127.0.0.1 -p "$PORT" -U postgres -v ON_ERROR_STOP=1 "$@"; }

mkdir -p "$ROOT/.local"
if [ ! -s "$DATA/PG_VERSION" ]; then
  mkdir -p "$DATA"; [ "$(id -u)" = "0" ] && chown -R postgres:postgres "$DATA"
  as_pg "$PGBIN/initdb" -D "$DATA" -U postgres --auth=trust --encoding=UTF8 --locale=C.UTF-8 >/dev/null
  cat >> "$DATA/postgresql.conf" <<CONF
port = $PORT
listen_addresses = '127.0.0.1'
unix_socket_directories = '$DATA'
max_connections = 300
shared_buffers = 256MB
fsync = off
synchronous_commit = off
CONF
  echo "initialised $DATA"
fi

case "$CMD" in
  stop) as_pg "$PGBIN/pg_ctl" -D "$DATA" stop -m fast; exit 0 ;;
esac

if ! as_pg "$PGBIN/pg_ctl" -D "$DATA" status >/dev/null 2>&1; then
  as_pg "$PGBIN/pg_ctl" -D "$DATA" -l "$DATA/server.log" -w start >/dev/null
  echo "postgres started on 127.0.0.1:$PORT"
fi

case "$CMD" in
  reset)
    psql_local -d postgres -qc "DROP DATABASE IF EXISTS $DB WITH (FORCE)"
    psql_local -d postgres -qc "CREATE DATABASE $DB"
    echo "database $DB recreated (start the API to apply migrations)" ;;
  testpw)
    psql_local -d "$DB" -q -f "$ROOT/tests/test-passwords.sql"
    echo "test passwords set on local database $DB" ;;
  *)
    psql_local -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB'" | grep -q 1 \
      || { psql_local -d postgres -qc "CREATE DATABASE $DB"; echo "database $DB created"; } ;;
esac
echo "DATABASE_URL=postgres://postgres@127.0.0.1:$PORT/$DB"
