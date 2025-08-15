@echo off
echo ========================================
echo Reorganizing Low-Code Enforcement Files
echo ========================================
echo.

REM Create the new directory structure
echo Creating new directory structure...
mkdir tools 2>nul
mkdir tools\enforcement 2>nul
mkdir tools\enforcement\scripts 2>nul
mkdir tools\enforcement\config 2>nul
mkdir tools\enforcement\templates 2>nul
mkdir tools\enforcement\templates\ai-prompts 2>nul
mkdir tools\enforcement\tracking 2>nul
mkdir tools\monitoring 2>nul
mkdir tools\monitoring\prometheus 2>nul
mkdir tools\monitoring\grafana 2>nul
mkdir tools\monitoring\grafana\dashboards 2>nul
mkdir tools\monitoring\grafana\provisioning 2>nul
mkdir tools\monitoring\grafana\provisioning\dashboards 2>nul
mkdir tools\monitoring\grafana\provisioning\datasources 2>nul
mkdir tools\monitoring\collector 2>nul
mkdir tools\badges 2>nul
mkdir tools\ci-cd 2>nul
mkdir tools\ci-cd\github-actions 2>nul
mkdir tools\ci-cd\hooks 2>nul

echo.
echo Moving enforcement scripts...
REM Move enforcement scripts
if exist scripts\detect-forbidden-patterns.cjs move scripts\detect-forbidden-patterns.cjs tools\enforcement\scripts\ >nul 2>&1
if exist scripts\verify-tool-usage.cjs move scripts\verify-tool-usage.cjs tools\enforcement\scripts\ >nul 2>&1
if exist scripts\check-v0-compliance.cjs move scripts\check-v0-compliance.cjs tools\enforcement\scripts\ >nul 2>&1
if exist scripts\calculate-badges.cjs move scripts\calculate-badges.cjs tools\badges\ >nul 2>&1

echo Moving monitoring files...
REM Move metrics collector
if exist metrics\collector.js move metrics\collector.js tools\monitoring\collector\ >nul 2>&1
if exist metrics\package.json move metrics\package.json tools\monitoring\collector\ >nul 2>&1
if exist metrics\package-lock.json move metrics\package-lock.json tools\monitoring\collector\ >nul 2>&1
if exist metrics\Dockerfile move metrics\Dockerfile tools\monitoring\collector\ >nul 2>&1
if exist metrics\dashboard.html move metrics\dashboard.html tools\monitoring\collector\ >nul 2>&1
if exist metrics\node_modules xcopy /E /I /Y metrics\node_modules tools\monitoring\collector\node_modules >nul 2>&1

REM Move Prometheus config
if exist prometheus\prometheus.yml move prometheus\prometheus.yml tools\monitoring\prometheus\ >nul 2>&1

REM Move Grafana files
if exist grafana\dashboards\low-code-compliance.json move grafana\dashboards\low-code-compliance.json tools\monitoring\grafana\dashboards\ >nul 2>&1
if exist grafana\dashboards\import-dashboard.json move grafana\dashboards\import-dashboard.json tools\monitoring\grafana\dashboards\ >nul 2>&1
if exist grafana\provisioning\datasources\prometheus.yml move grafana\provisioning\datasources\prometheus.yml tools\monitoring\grafana\provisioning\datasources\ >nul 2>&1
if exist grafana\provisioning\dashboards\dashboard.yml move grafana\provisioning\dashboards\dashboard.yml tools\monitoring\grafana\provisioning\dashboards\ >nul 2>&1

echo Moving templates and documentation...
REM Move templates
if exist .ai-prompts\claude-search-first.md move .ai-prompts\claude-search-first.md tools\enforcement\templates\ai-prompts\ >nul 2>&1
if exist .github\pull_request_template.md copy .github\pull_request_template.md tools\enforcement\templates\pr-template.md >nul 2>&1
if exist docs\low-code-onboarding.md move docs\low-code-onboarding.md tools\enforcement\templates\onboarding-checklist.md >nul 2>&1

REM Move CI/CD files
if exist .github\workflows\low-code-enforcement.yml copy .github\workflows\low-code-enforcement.yml tools\ci-cd\github-actions\ >nul 2>&1

REM Move v0 tracker
if exist src\utils\v0-tracker.ts move src\utils\v0-tracker.ts tools\enforcement\tracking\ >nul 2>&1

echo.
echo Cleaning up empty directories...
REM Clean up empty directories
if exist scripts rmdir scripts 2>nul
if exist metrics rmdir metrics 2>nul
if exist prometheus rmdir prometheus 2>nul
if exist grafana\dashboards rmdir grafana\dashboards 2>nul
if exist grafana\provisioning\datasources rmdir grafana\provisioning\datasources 2>nul
if exist grafana\provisioning\dashboards rmdir grafana\provisioning\dashboards 2>nul
if exist grafana\provisioning rmdir grafana\provisioning 2>nul
if exist grafana rmdir grafana 2>nul
if exist .ai-prompts rmdir .ai-prompts 2>nul

echo.
echo ========================================
echo Reorganization Complete!
echo ========================================
echo.
echo New structure created at: tools\
echo.
echo Next steps:
echo 1. Run update-references.bat to update all file paths
echo 2. Test the enforcement scripts
echo 3. Restart Docker containers if running
echo.
pause