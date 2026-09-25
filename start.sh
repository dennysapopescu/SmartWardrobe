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
PID_8080=$(lsof -ti:8080 2>/dev/null)
if [ -n "$PID_8080" ]; then
    echo "Freeing port 8080 (PID: $PID_8080)..."
    kill -9 $PID_8080 2>/dev/null
fi

PID_5173=$(lsof -ti:5173 2>/dev/null)
if [ -n "$PID_5173" ]; then
    echo "Freeing port 5173 (PID: $PID_5173)..."
    kill -9 $PID_5173 2>/dev/null
fi

# Clean up any stale H2 lock file
rm -f "$PROJECT_ROOT/backend/data/wardrobedb.lock.db" 2>/dev/null

# Detect Database: PostgreSQL vs H2 Fallback
SPRING_PROFILE_ARG=""
DB_DESC="PostgreSQL (localhost:5432/smartwardrobe)"

if nc -z 127.0.0.1 5432 2>/dev/null; then
    echo "🐘 PostgreSQL detected on port 5432."
else
    if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
        echo "🐳 Starting PostgreSQL container via Docker..."
        (cd "$PROJECT_ROOT" && docker compose up -d postgres 2>/dev/null)
        sleep 2
    fi

    if nc -z 127.0.0.1 5432 2>/dev/null; then
        echo "🐘 PostgreSQL container is ready."
    else
        echo "💡 PostgreSQL not detected on port 5432. Activating zero-config H2 profile..."
        SPRING_PROFILE_ARG="-Dspring-boot.run.profiles=h2"
        DB_DESC="Embedded H2 Database (zero-config, persistent in backend/data/)"
    fi
fi

# 1. Start Spring Boot Backend
echo "🚀 Starting Spring Boot Backend (http://localhost:8080)..."
cd "$PROJECT_ROOT/backend"
./mvnw spring-boot:run $SPRING_PROFILE_ARG &
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
echo "   👉 Database:     $DB_DESC"
echo ""
echo "💡 Press Ctrl+C at any time to cleanly stop both servers."
echo "======================================================="

cleanup() {
    echo ""
    echo "🛑 Shutting down Smart Wardrobe servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    rm -f "$PROJECT_ROOT/backend/data/wardrobedb.lock.db" 2>/dev/null
    echo "👋 Stopped."
    exit 0
}

trap cleanup INT TERM

wait
