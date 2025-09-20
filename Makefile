.PHONY: qa-start qa-test qa-stop

qa-start:
	docker compose up -d
	@echo "QA environment started. Dashboard available at http://localhost:8080"

qa-test:
	./qa/run_tests.sh

qa-stop:
	docker compose down
	@echo "QA environment stopped."
