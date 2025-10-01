.PHONY: help up down restart logs ps migrate seed build clean preflight dev

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Start all services
	docker compose -f docker/docker-compose.yml up -d
	@echo "✅ Services started"

down: ## Stop all services
	docker compose -f docker/docker-compose.yml down
	@echo "✅ Services stopped"

restart: ## Restart all services
	docker compose -f docker/docker-compose.yml restart
	@echo "✅ Services restarted"

logs: ## View logs (use SERVICE=api to view specific service)
	@if [ -z "$(SERVICE)" ]; then \
		docker compose -f docker/docker-compose.yml logs -f; \
	else \
		docker compose -f docker/docker-compose.yml logs -f $(SERVICE); \
	fi

ps: ## List running services
	docker compose -f docker/docker-compose.yml ps

migrate: ## Run database migrations
	pnpm prisma migrate deploy
	@echo "✅ Migrations completed"

migrate-dev: ## Create a new migration
	pnpm prisma migrate dev

seed: ## Seed the database
	pnpm seed
	@echo "✅ Database seeded"

build: ## Build the project
	pnpm build
	@echo "✅ Build completed"

build-docker: ## Build Docker images
	docker compose -f docker/docker-compose.yml build
	@echo "✅ Docker images built"

clean: ## Clean build artifacts
	rm -rf dist node_modules/.cache
	@echo "✅ Cleaned"

preflight: ## Run checks before commit
	pnpm lint
	pnpm typecheck
	pnpm prisma validate
	@echo "✅ Preflight passed"

dev: ## Start development mode
	pnpm dev

install: ## Run installation script
	bash scripts/install.sh
