#!/bin/bash

echo "Starting QA tests..."

# Wait for services to be ready
echo "Waiting for services..."
sleep 10

# ESLint scan
echo "Running ESLint..."
docker compose run --rm eslint sh -c "cd /app && npm install eslint --save-dev && npx eslint . --format json --output-file /qa/dashboard/eslint_results.json"

# Dependency vulnerability scan
echo "Running npm audit..."
docker compose run --rm eslint sh -c "cd /app/fm-compta-consulting-frontend && npm audit --json > /qa/dashboard/npm_audit_results.json || true"

# Jest code coverage
echo "Running Jest code coverage..."
docker compose run --rm eslint sh -c "cd /app/fm-compta-consulting-frontend && npx jest --coverage --json --outputFile=/qa/dashboard/jest_coverage.json"

# Selenium tests
echo "Running Selenium tests..."
docker compose run --rm qa-runner sh -c "pip install selenium && python /qa/selenium_tests.py"

# k6 load tests
echo "Running k6 load tests..."
docker compose run --rm k6 run /qa/k6_script.js --summary-export=/qa/dashboard/k6_results.json

echo "Tests completed. Check dashboard at http://localhost:8080"
