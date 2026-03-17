# PowerShell script to start the OrenPlace application without Docker

# Assume PostgreSQL is running locally on port 5432 with the credentials in .env

# Start backend
Write-Host "Starting backend..."
Set-Location "backend"
npm install
npm run prisma:generate
npm run prisma:migrate  # If needed, uncomment if migrations are required
Start-Job -ScriptBlock { npm run start:dev } -Name "BackendJob"

# Wait a bit for backend to start
Start-Sleep -Seconds 10

# Start mobile app
Write-Host "Starting mobile app..."
Set-Location "..\mobile"
npm install
npm run web

# Note: Backend is running in the background. To stop it, use Stop-Job -Name "BackendJob"