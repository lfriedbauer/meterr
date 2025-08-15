#!/bin/bash

echo "🚀 Setting up meterr MVP..."
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📋 Creating .env.local from example..."
    cp .env.local.example .env.local
    echo "✅ .env.local created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env.local and add your:"
    echo "   - Supabase URL and keys"
    echo "   - OpenAI API key (for embeddings)"
    echo "   - Encryption key (32 characters)"
    echo ""
    read -p "Press Enter when you've updated .env.local..."
fi

echo "📊 Setting up Supabase..."
echo ""
echo "Manual steps required:"
echo "1. Go to https://app.supabase.com"
echo "2. Open your project SQL Editor"
echo "3. Run this command first:"
echo ""
echo "   CREATE EXTENSION IF NOT EXISTS vector;"
echo "   CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
echo "   CREATE EXTENSION IF NOT EXISTS pgcrypto;"
echo ""
echo "4. Then run the migration file:"
echo "   infrastructure/supabase/migrations/003_quick_win_schema.sql"
echo ""
echo "5. Also run the vector functions:"
echo "   infrastructure/supabase/migrations/004_vector_search_functions.sql"
echo ""
read -p "Press Enter when you've run the migrations..."

echo "🔧 Installing dependencies..."
pnpm install

echo "🏗️  Building types..."
pnpm --filter=./apps/app run build

echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "1. cd apps/app"
echo "2. npm run dev"
echo "3. Visit http://localhost:3000"
echo ""
echo "To test the Quick Win system:"
echo "1. Create a customer via API"
echo "2. Add their OpenAI API key"
echo "3. Generate a Quick Win"