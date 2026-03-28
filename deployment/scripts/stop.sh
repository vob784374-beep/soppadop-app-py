#!/bin/bash
set -e

echo "Stopping Soppadop application..."

cd "$(dirname "$0")/.."

docker compose down

echo "Soppadop application stopped."
