#!/bin/bash

echo "🚀 Setting up Vercel Environment Variables..."
echo ""

# Production Convex URL
echo "Setting NEXT_PUBLIC_CONVEX_URL..."
echo "https://rosy-ibis-255.convex.cloud" | vercel env add NEXT_PUBLIC_CONVEX_URL production

# Convex Deployment
echo "Setting CONVEX_DEPLOYMENT..."
echo "prod:rosy-ibis-255" | vercel env add CONVEX_DEPLOYMENT production

# OpenRouter API Key
echo "Setting OPENROUTER_API_KEY..."
echo "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" | vercel env add OPENROUTER_API_KEY production

# Firecrawl API Key
echo "Setting FIRECRAWL_API_KEY..."
echo "fc-6bda4ce4c2844294882120a8bcfe9439" | vercel env add FIRECRAWL_API_KEY production

echo ""
echo "⚠️  IMPORTANT: You still need to add CONVEX_DEPLOY_KEY manually!"
echo ""
echo "1. Open Convex Dashboard: https://dashboard.convex.dev"
echo "2. Select project: open-competitor"
echo "3. Go to: Settings → Deploy Keys"
echo "4. Click: Create Deploy Key (for PRODUCTION)"
echo "5. Copy the key (starts with 'prod:...')"
echo ""
echo "6. Run this command with your key:"
echo "   echo 'YOUR_DEPLOY_KEY_HERE' | vercel env add CONVEX_DEPLOY_KEY production"
echo ""
echo "✅ All other environment variables have been set!"
