#!/bin/bash

# Manufacturing ERP System - Quick Start Script
echo "🏭 Manufacturing ERP System - Quick Start"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+ and try again."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL and try again."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ PostgreSQL detected"

# Check if database exists
DB_EXISTS=$(psql -lqt | cut -d \| -f 1 | grep -w manufacturing_erp | wc -l)

if [ $DB_EXISTS -eq 0 ]; then
    echo "📊 Creating database 'manufacturing_erp'..."
    createdb manufacturing_erp 2>/dev/null || {
        echo "⚠️  Database creation failed. Please create it manually:"
        echo "   createdb manufacturing_erp"
        echo "   Or: psql -c 'CREATE DATABASE manufacturing_erp;'"
    }
else
    echo "✅ Database 'manufacturing_erp' exists"
fi

# Setup Backend
echo ""
echo "🔧 Setting up Backend..."
cd backend

if [ ! -f .env ]; then
    echo "📝 Creating backend .env file..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your database credentials"
fi

if [ ! -d node_modules ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

echo "🌱 Seeding database with sample data..."
npm run seed

echo ""
echo "🖥️  Setting up Frontend..."
cd ../frontend

if [ ! -f .env ]; then
    echo "📝 Creating frontend .env file..."
    cp .env.example .env
fi

if [ ! -d node_modules ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting the application..."
echo ""
echo "Backend will start on: http://localhost:5000"
echo "Frontend will start on: http://localhost:3000"
echo ""
echo "Demo credentials:"
echo "  Email: admin@example.com"
echo "  Password: password123"
echo ""

# Start backend in background
cd ../backend
echo "🔄 Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
cd ../frontend
echo "🔄 Starting frontend server..."
npm start &
FRONTEND_PID=$!

echo ""
echo "✨ Application is starting up!"
echo ""
echo "To stop the application, press Ctrl+C or run:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Wait for user to stop
wait
