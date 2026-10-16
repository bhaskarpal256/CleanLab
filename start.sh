#!/usr/bin/env bash

# Exit on error
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting AI Resume Customizer full-stack application..."
echo "📂 Working directory: $PROJECT_ROOT"

# Check Python virtualenv
if [ ! -d "$PROJECT_ROOT/backend/venv" ]; then
    echo "⚙️ Creating backend virtual environment..."
    python3 -m venv "$PROJECT_ROOT/backend/venv"
    "$PROJECT_ROOT/backend/venv/bin/pip" install --upgrade pip
    "$PROJECT_ROOT/backend/venv/bin/pip" install -r "$PROJECT_ROOT/backend/requirements.txt"
fi

# Function to clean up child processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start FastAPI Backend
echo "🐍 Starting Python FastAPI Backend on http://localhost:8000..."
cd "$PROJECT_ROOT/backend"
./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend health
sleep 2

# 2. Start Next.js Frontend
echo "⚛️ Starting Next.js Frontend on http://localhost:3000..."
cd "$PROJECT_ROOT/frontend"
npm run dev -- -p 3000 &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "✨ CleanLab Resume AI Customizer is LIVE!"
echo "   🌐 Frontend UI:     http://localhost:3000"
echo "   🔌 Backend API:     http://localhost:8000"
echo "   📖 API Docs:        http://localhost:8000/docs"
echo "=========================================================="
echo "Press Ctrl+C to stop both servers."
echo ""

# Open browser if macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    sleep 2
    open http://localhost:3000 || true
fi

# Keep script running
wait
