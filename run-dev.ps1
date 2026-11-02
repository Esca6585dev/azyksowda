# AzykSowda — ýerli (dev) işletmek: backend + frontend iki aýry penjirede
# Ulanylyşy:  .\run-dev.ps1        (D:\azyksowda içinde)
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Test-Path "$root\backend\.env")) { Copy-Item "$root\backend\.env.example" "$root\backend\.env" }
if (-not (Test-Path "$root\frontend\node_modules")) {
  Write-Host "npm install (ilkinji gezek)..." -ForegroundColor Yellow
  Push-Location "$root\frontend"; npm install; Pop-Location
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; Write-Host 'AzykSowda API  ->  http://localhost:8080' -ForegroundColor Green; go run ./cmd/server"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; Write-Host 'AzykSowda WEB  ->  http://localhost:3000' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "Saýt:        http://localhost:3000" -ForegroundColor Cyan
Write-Host "Admin panel: http://localhost:3000/admin   (admin@azyksowda.com / admin123)" -ForegroundColor Cyan
Write-Host "API:         http://localhost:8080/api/health" -ForegroundColor Cyan
