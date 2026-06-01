#!/bin/sh
set -e

echo "[1/3] Running Prisma migrate deploy..."
pnpm prisma migrate deploy

echo "[2/3] Running database seed..."
pnpm prisma db seed

echo "[3/3] Starting Node.js server..."
exec node dist/server.js
