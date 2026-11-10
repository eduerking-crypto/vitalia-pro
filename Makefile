# VITALIA PRO — Makefile
# Ayudas de desarrollo. Requiere Docker (para servicios) y pnpm (para el frontend).

.PHONY: help setup dev down logs migrate seed test lint format clean

help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-12s\033[0m %s\n", $$1, $$2}'

setup: ## Levanta la infraestructura completa (db, redis, api, worker, web)
	docker compose up -d --build
	@echo "Web:    http://localhost:3000"
	@echo "API:    http://localhost:8000/docs"
	@echo "Demo:   demo@vitalia.health / Demo1234!"

dev: setup ## Alias de setup
	@true

dev-web: ## Solo frontend local (pnpm) — requiere db+api de docker
	docker compose up -d db redis api
	pnpm --filter @vitalia/web dev

dev-api: ## Solo backend local (uvicorn) — requiere db+redis de docker
	docker compose up -d db redis
	cd apps/api && uvicorn app.main:app --reload --port 8000

down: ## Detiene todos los servicios
	docker compose down

logs: ## Sigue los logs de todos los servicios
	docker compose logs -f

migrate: ## Aplica migraciones pendientes (Alembic)
	docker compose exec api alembic upgrade head

migration: ## Crea una migración: make migration m="mensaje"
	cd apps/api && alembic revision --autogenerate -m "$(m)"

seed: ## Carga datos de demostración
	docker compose exec api python -m app.seed

test: ## Ejecuta todos los tests (web + api)
	pnpm --filter @vitalia/web test
	cd apps/api && pytest -v

lint: ## Lint de todo el monorepo
	pnpm --filter @vitalia/web lint
	cd apps/api && ruff check .

format: ## Formatea todo el código
	pnpm --filter @vitalia/web format
	cd apps/api && ruff format .

clean: ## Limpia artefactos de build
	pnpm --filter @vitalia/web clean
	rm -rf apps/api/.pytest_cache apps/api/.ruff_cache
