#!/bin/bash

echo "🔧 Updating Vercel Production Environment Variables..."
echo ""

# Update NEXT_PUBLIC_CONVEX_URL to prod
echo "Updating NEXT_PUBLIC_CONVEX_URL to production deployment..."
vercel env rm NEXT_PUBLIC_CONVEX_URL production --yes 2>/dev/null
echo "https://rosy-ibis-255.convex.cloud" | vercel env add NEXT_PUBLIC_CONVEX_URL production

# Update CONVEX_DEPLOYMENT to prod
echo "Updating CONVEX_DEPLOYMENT to production..."
vercel env rm CONVEX_DEPLOYMENT production --yes 2>/dev/null
echo "prod:rosy-ibis-255" | vercel env add CONVEX_DEPLOYMENT production

echo ""
echo "✅ Updated production URLs!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  FINAL STEP: Add CONVEX_DEPLOY_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Check the Convex Dashboard (should be open now)"
echo "2. You're in: Settings → Deploy Keys"
echo "3. Click: 'Create Deploy Key' button"
echo "4. Copy the key (looks like: prod:01234567...)"
echo "5. Paste it below when prompted"
echo ""
read -p "Enter your Convex Deploy Key: " DEPLOY_KEY
echo ""

if [ ! -z "$DEPLOY_KEY" ]; then
  echo "Adding CONVEX_DEPLOY_KEY to Vercel..."
  echo "$DEPLOY_KEY" | vercel env add CONVEX_DEPLOY_KEY production
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ ALL ENVIRONMENT VARIABLES SET!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "📋 Summary:"
  echo "  ✓ NEXT_PUBLIC_CONVEX_URL = https://rosy-ibis-255.convex.cloud"
  echo "  ✓ CONVEX_DEPLOYMENT = prod:rosy-ibis-255"
  echo "  ✓ CONVEX_DEPLOY_KEY = $DEPLOY_KEY"
  echo "  ✓ OPENROUTER_API_KEY = (set)"
  echo "  ✓ FIRECRAWL_API_KEY = (set)"
  echo ""
  echo "🚀 Ready to deploy! Run:"
  echo "   vercel --prod"
  echo ""
else
  echo "❌ No deploy key entered. Please run this script again."
fi
