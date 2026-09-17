#!/usr/bin/env bash
# Smart Wardrobe - One-Click Launcher for Backend & Frontend

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load environment variables from .env if present
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
fi

echo "======================================================="
echo "   👗 Smart Wardrobe - AI Outfit Generator Studio      "
echo "======================================================="

# Free up ports 8080 and 5173 if currently occupied
echo "🧹 Checking ports 8080 and 5173..."
lsof -ti:8080 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# 1. Start Spring Boot Backend
echo "🚀 Starting Spring Boot Backend (http://localhost:8080)..."
cd "$PROJECT_ROOT/backend"
./mvnw spring-boot:run &
BACKEND_PID=$!

# 2. Wait briefly for backend startup
sleep 3

# 3. Start React + Vite Frontend
echo "✨ Starting React Frontend (http://localhost:5173)..."
cd "$PROJECT_ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are launching!"
echo "   👉 Frontend UI:  http://localhost:5173"
echo "   👉 Backend API:  http://localhost:8080"
echo "   👉 PostgreSQL:   localhost:5432/smartwardrobe"
echo ""
echo "💡 Press Ctrl+C at any time to cleanly stop both servers."
echo "======================================================="

cleanup() {
    echo ""
    echo "🛑 Shutting down Smart Wardrobe servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    echo "👋 Stopped."
    exit 0
}

trap cleanup INT TERM

wait
