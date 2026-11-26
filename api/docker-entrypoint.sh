#!/bin/sh
set -eu

i=0
while [ "$i" -lt 30 ]; do
  if npx prisma migrate deploy; then
    break
  fi
  i=$((i + 1))
  sleep 2
done
if [ "$i" -eq 30 ]; then
  echo "Prisma no pudo aplicar migraciones: PostgreSQL no respondió a tiempo." >&2
  exit 1
fi

if [ "${MESTIZO_SEED:-1}" = "1" ]; then
  set +e
  node -e "
    const { PrismaClient } = require('@prisma/client');
    const p = new PrismaClient();
    p.localidad.count()
      .then((n) => process.exit(n > 0 ? 0 : 2))
      .catch((e) => { console.error(e); process.exit(1); })
      .finally(() => p.\$disconnect());
  "
  codigo=$?
  set -e
  if [ "$codigo" -eq 2 ]; then
    npx prisma db seed
  elif [ "$codigo" -ne 0 ]; then
    exit "$codigo"
  fi
fi

exec node dist/src/main
