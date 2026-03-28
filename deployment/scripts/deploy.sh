#!/bin/bash
set -e

echo "Starting Soppadop application..."

cd "$(dirname "$0")"

docker compose up -d --build

echo "Waiting for services to be healthy..."
sleep 10

echo "Checking backend health..."
curl -f http://localhost:5000/api/health || { echo "Backend health check failed"; exit 1; }

echo "Soppadop application is running!"
echo "  Frontend: http://localhost"
echo "  Backend:  http://localhost:5000"
