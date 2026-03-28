#!/bin/bash
set -e

echo "Restarting Soppadop application..."

cd "$(dirname "$0")/.."

docker compose down
docker compose up -d --build

echo "Soppadop application restarted."
