#!/usr/bin/env bash
# SmartSpend Developer Startup Helper
set -e

echo "Starting SmartSpend development environment..."
pnpm install
pnpm db:generate
pnpm dev:api &
pnpm dev:mobile &
wait
