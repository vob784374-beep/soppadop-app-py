.PHONY: help dev dev-down up down restart logs backend-dev frontend-dev

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start development database
	cd deployment && docker compose -f docker-compose.dev.yml up -d

dev-down: ## Stop development database
	cd deployment && docker compose -f docker-compose.dev.yml down

up: ## Start all services (production)
	cd deployment && docker compose up -d --build

down: ## Stop all services
	cd deployment && docker compose down

restart: ## Restart all services
	cd deployment && docker compose down && docker compose up -d --build

logs: ## Show logs from all services
	cd deployment && docker compose logs -f

backend-dev: ## Start backend development server
	cd backend-api && python -m venv .venv && .venv/Scripts/pip install -r requirements.txt && .venv/Scripts/python wsgi.py

frontend-dev: ## Start frontend development server
	cd frontend && npm install && npm run dev
