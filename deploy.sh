#!/bin/sh
set -e

HOST="${DEPLOY_HOST:-homelab}"
REMOTE="${DEPLOY_PATH:-/mnt/hd_externo/apps/guacu-news-scrapping}"

if [ ! -f .env ]; then
  echo "Crie o arquivo .env (cp .example.env .env) antes do deploy."
  exit 1
fi

echo "Enviando arquivos para ${HOST}:${REMOTE}"
rsync -az \
  --exclude node_modules \
  --exclude dist \
  --exclude coverage \
  --exclude .git \
  --exclude .env.homelab \
  --exclude tmp-*.html \
  ./ "${HOST}:${REMOTE}/"

echo "Subindo container no homelab"
ssh "${HOST}" "cd '${REMOTE}' && docker compose up -d --build"

echo "Deploy concluído. Health: http://${HOST}:3015/health"
