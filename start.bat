@echo off
echo Starting SourceDirect Marketplace...

:: Start backend
start "Backend - FastAPI" cmd /k "cd backend && uvicorn main:app --reload --port 8000"

:: Wait a moment then start frontend
timeout /t 3 /nobreak >nul
start "Frontend - Vite" cmd /k "cd frontend && npm run dev"

echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
pause
