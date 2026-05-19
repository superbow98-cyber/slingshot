#!/bin/bash
# Slingshot M2 - Quick start script
# Run AFTER you've filled in .env.local

set -e

echo "🚀 Slingshot M2 quickstart"
echo ""

# Check we're in the right folder
if [ ! -f "package.json" ]; then
  echo "❌ Error: Run this from ~/Desktop/slingshot folder"
  exit 1
fi

# Check .env.local exists
if [ ! -f ".env.local" ]; then
  echo "❌ Error: .env.local not found. Run: cp .env.example .env.local first"
  exit 1
fi

# Check Supabase URL is filled
if grep -q "your-project-ref" .env.local; then
  echo "❌ Error: .env.local still has placeholder values. Fill in Supabase + Stripe keys first."
  exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🧪 Starting dev server..."
echo "Visit http://localhost:3000 once it's ready"
echo ""
npm run dev
