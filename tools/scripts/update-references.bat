@echo off
echo ========================================
echo Updating File References
echo ========================================
echo.

echo Updating Husky pre-commit hook...
REM Update .husky/pre-commit to point to new locations
(
echo #!/usr/bin/env sh
echo . "$^(dirname -- "$0"^)/_/husky.sh"
echo.
echo echo "🔍 Checking low-code compliance..."
echo.
echo # Emergency bypass for hotfixes
echo if [ -n "$EMERGENCY_BYPASS" ]; then
echo     echo "🚨 EMERGENCY BYPASS: $EMERGENCY_BYPASS" ^| tee -a .emergency-bypasses.log
echo     exit 0
echo fi
echo.
echo # Run forbidden pattern detection
echo node ./tools/enforcement/scripts/detect-forbidden-patterns.cjs
echo if [ $? -ne 0 ]; then
echo     echo "❌ Forbidden patterns detected. Commit blocked."
echo     exit 1
echo fi
echo.
echo # Run tool usage verification if it exists
echo if [ -f "./tools/enforcement/scripts/verify-tool-usage.cjs" ]; then
echo     node ./tools/enforcement/scripts/verify-tool-usage.cjs
echo     if [ $? -ne 0 ]; then
echo         echo "❌ Tool usage verification failed. Commit blocked."
echo         exit 1
echo     fi
echo fi
echo.
echo # Run v0 compliance check if it exists
echo if [ -f "./tools/enforcement/scripts/check-v0-compliance.cjs" ]; then
echo     node ./tools/enforcement/scripts/check-v0-compliance.cjs
echo     if [ $? -ne 0 ]; then
echo         echo "❌ v0.dev compliance check failed. Commit blocked."
echo         exit 1
echo     fi
echo fi
echo.
echo echo "✅ Low-code compliance check passed!"
) > .husky\pre-commit

echo Updating GitHub Actions workflow...
REM Update GitHub Actions workflow
(
echo name: Low-Code Compliance Check
echo on: [pull_request]
echo.
echo jobs:
echo   check-compliance:
echo     runs-on: ubuntu-latest
echo     steps:
echo       - uses: actions/checkout@v4
echo       - uses: actions/setup-node@v4
echo         with:
echo           node-version: '20'
echo           cache: 'pnpm'
echo.      
echo       - name: Install pnpm
echo         uses: pnpm/action-setup@v2
echo         with:
echo           version: 8
echo.      
echo       - name: Install dependencies
echo         run: pnpm install --frozen-lockfile
echo.      
echo       - name: Check for forbidden patterns
echo         run: node ./tools/enforcement/scripts/detect-forbidden-patterns.cjs
echo.      
echo       - name: Verify FlexSearch usage
echo         run: ^|
echo           if git diff origin/main --name-only ^| grep -E '\.^(js^|jsx^|ts^|tsx^)$' ^| xargs grep -l "search" ^| xargs grep -L "FlexSearch\^|flexsearch\^|@research:search"; then
echo             echo "❌ Search implementation without FlexSearch detected"
echo             echo "Please use FlexSearch for search features or add @research:search comment"
echo             exit 1
echo           fi
echo.      
echo       - name: Check tool usage verification
echo         if: always^(^)
echo         run: ^|
echo           if [ -f "./tools/enforcement/scripts/verify-tool-usage.cjs" ]; then
echo             node ./tools/enforcement/scripts/verify-tool-usage.cjs
echo           fi
echo.      
echo       - name: Comment on PR
echo         if: failure^(^)
echo         uses: actions/github-script@v6
echo         with:
echo           script: ^|
echo             await github.rest.issues.createComment^({
echo               owner: context.repo.owner,
echo               repo: context.repo.repo,
echo               issue_number: context.issue.number,
echo               body: `## ⚠️ Low-Code Compliance Issues Detected
echo.              
echo               Your PR violates our low-code/search-first policy. Please:
echo.              
echo               ### Required Actions:
echo               1. Run \`pnpm research:search\` before implementing search features
echo               2. Use FlexSearch for all search functionality
echo               3. Try v0.dev for UI components before custom coding
echo.              
echo               ### Add Evidence Comments:
echo               - \`// @research:search\` - After researching existing solutions
echo               - \`// @v0:component-name\` - For v0.dev generated UI
echo               - \`// @flexsearch:feature\` - For FlexSearch implementations
echo               - \`// @approved\` - Only with architecture team approval
echo.              
echo               ### Resources:
echo               - [FlexSearch Documentation]^(https://github.com/nextapps-de/flexsearch^)
echo               - [v0.dev]^(https://v0.dev^)
echo               - [Low-Code Guidelines]^(./docs/low-code-guidelines.md^)`
echo             }^);
) > .github\workflows\low-code-enforcement.yml

echo Updating docker-compose.yml paths...
REM Update docker-compose.yml to use new paths
powershell -Command "(Get-Content docker-compose.yml) -replace './metrics', './tools/monitoring/collector' -replace './prometheus/prometheus.yml', './tools/monitoring/prometheus/prometheus.yml' -replace './grafana/dashboards', './tools/monitoring/grafana/dashboards' -replace './grafana/provisioning', './tools/monitoring/grafana/provisioning' -replace './scripts:/app/scripts', './tools/enforcement/scripts:/app/scripts' | Set-Content docker-compose.yml"

echo.
echo Creating monitoring-specific docker-compose...
(
echo version: '3.8'
echo.
echo services:
echo   prometheus:
echo     image: prom/prometheus:latest
echo     container_name: meterr-prometheus
echo     restart: unless-stopped
echo     ports:
echo       - "9090:9090"
echo     volumes:
echo       - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
echo       - prometheus_data:/prometheus
echo     command:
echo       - '--config.file=/etc/prometheus/prometheus.yml'
echo       - '--storage.tsdb.path=/prometheus'
echo       - '--web.console.libraries=/etc/prometheus/console_libraries'
echo       - '--web.console.templates=/etc/prometheus/consoles'
echo       - '--web.enable-lifecycle'
echo     networks:
echo       - monitoring-network
echo.
echo   grafana:
echo     image: grafana/grafana:latest
echo     container_name: meterr-grafana
echo     restart: unless-stopped
echo     ports:
echo       - "3001:3000"
echo     environment:
echo       - GF_SECURITY_ADMIN_USER=admin
echo       - GF_SECURITY_ADMIN_PASSWORD=meterr123
echo       - GF_INSTALL_PLUGINS=
echo     volumes:
echo       - grafana_data:/var/lib/grafana
echo       - ./grafana/dashboards:/var/lib/grafana/dashboards
echo       - ./grafana/provisioning:/etc/grafana/provisioning
echo     networks:
echo       - monitoring-network
echo.
echo   metrics-collector:
echo     build: 
echo       context: ./collector
echo       dockerfile: Dockerfile
echo     container_name: meterr-metrics
echo     restart: unless-stopped
echo     ports:
echo       - "8080:8080"
echo     environment:
echo       - GITHUB_TOKEN=${GITHUB_TOKEN}
echo       - REPO_NAME=meterr-ai/meterr
echo       - NODE_ENV=production
echo     volumes:
echo       - ../enforcement/scripts:/app/scripts:ro
echo       - ../../.v0-generations.json:/app/.v0-generations.json
echo       - ../../.v0-stats.json:/app/.v0-stats.json
echo     networks:
echo       - monitoring-network
echo.
echo volumes:
echo   prometheus_data:
echo   grafana_data:
echo.
echo networks:
echo   monitoring-network:
echo     driver: bridge
) > tools\monitoring\docker-compose.yml

echo.
echo ========================================
echo Reference Updates Complete!
echo ========================================
echo.
echo Updated:
echo - Husky pre-commit hook
echo - GitHub Actions workflow
echo - Docker compose paths
echo - Created monitoring-specific docker-compose
echo.
echo To start monitoring stack:
echo   cd tools\monitoring
echo   docker-compose up -d
echo.
pause