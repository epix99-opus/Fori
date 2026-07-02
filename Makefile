.PHONY: dev web api build lint typecheck

dev:
	npm run dev

web:
	npm --workspace apps/web run dev

api:
	cd apps/api && uvicorn main:app --reload --host 0.0.0.0 --port 8000

build:
	npm run build

lint:
	npm run lint

typecheck:
	npm run typecheck
