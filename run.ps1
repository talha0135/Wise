# Starts the WISE backend and frontend in two PowerShell windows.
# Usage (from the project folder):  powershell -ExecutionPolicy Bypass -File .\run.ps1
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Test-Path "$root\server\.env")) {
  Copy-Item "$root\server\.env.example" "$root\server\.env"
  Write-Host "Created server\.env - open it and set JWT_SECRET (and MONGO_URL if needed), then run this script again." -ForegroundColor Yellow
  notepad "$root\server\.env"
  exit 1
}

foreach ($dir in @("server", "client")) {
  if (-not (Test-Path "$root\$dir\node_modules")) {
    Write-Host "Installing $dir dependencies..." -ForegroundColor Cyan
    Push-Location "$root\$dir"; npm install; Pop-Location
  }
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\server'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\client'; npm run dev"
Start-Sleep -Seconds 6
Start-Process "http://localhost:5173"
