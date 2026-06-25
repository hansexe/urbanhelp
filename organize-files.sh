#!/bin/bash

# Urban Help - File Organization Script
# Moves generated files to their correct locations

set -e

echo "📁 Organizing generated files..."
echo ""

# Backend files
echo "🔧 Organizing backend files..."
mv -f backend-package.json backend/package.json 2>/dev/null || true
mv -f backend-tsconfig.json backend/tsconfig.json 2>/dev/null || true
mv -f backend-nest-cli.json backend/nest-cli.json 2>/dev/null || true
mv -f backend-Dockerfile backend/Dockerfile 2>/dev/null || true
mv -f backend-main.ts backend/src/main.ts 2>/dev/null || true
mv -f backend-app.module.ts backend/src/app.module.ts 2>/dev/null || true
mv -f backend-src-config-config.ts backend/src/config/config.ts 2>/dev/null || true
mv -f backend-src-common-common.module.ts backend/src/common/common.module.ts 2>/dev/null || true
echo "✓ Backend files organized"

# Frontend files
echo "🎨 Organizing frontend files..."
mv -f frontend-package.json frontend/package.json 2>/dev/null || true
mv -f frontend-tsconfig.json frontend/tsconfig.json 2>/dev/null || true
mv -f frontend-next.config.js frontend/next.config.js 2>/dev/null || true
mv -f frontend-Dockerfile frontend/Dockerfile 2>/dev/null || true
echo "✓ Frontend files organized"

# Critical implementations
echo "🔐 Organizing critical implementations..."
mv -f CRITICAL_FIX_001_STRIPE_WEBHOOKS.ts backend/src/modules/payments/stripe-webhook.service.ts 2>/dev/null || true
mv -f CRITICAL_FIX_002_STRIPE_IDEMPOTENCY.ts backend/src/modules/payments/stripe-payment.service.ts 2>/dev/null || true
mv -f CRITICAL_FIX_003_PASSWORD_RESET_EXPIRY.ts backend/src/modules/auth/password-reset.service.ts 2>/dev/null || true
mv -f CRITICAL_FIX_004_TRANSACTION_HANDLING.ts backend/src/modules/payments/payment.service.ts 2>/dev/null || true
mv -f CRITICAL_FIX_005_INPUT_VALIDATION_DTOS.ts backend/src/dtos/index.ts 2>/dev/null || true
mv -f COMPILE_AUDIT_DTO_FIXES.ts backend/src/common/enums/index.ts 2>/dev/null || true
echo "✓ Critical implementations organized"

# Architecture files
echo "🏗️  Organizing architecture files..."
mv -f CODEBASE_DATABASE_001_SCHEMA.sql backend/database/schema.sql 2>/dev/null || true
mv -f CODEBASE_BACKEND_001_CONFIG.ts backend/src/config/codebase.ts 2>/dev/null || true
mv -f CODEBASE_BACKEND_002_ENTITIES.ts backend/src/entities/_entities-reference.ts 2>/dev/null || true
mv -f CODEBASE_BACKEND_003_AUTH_MODULE.ts backend/src/modules/auth/_auth-reference.ts 2>/dev/null || true
mv -f CODEBASE_BACKEND_004_NOTIFICATIONS_STRIPE.ts backend/src/modules/notifications/_notifications-reference.ts 2>/dev/null || true
mv -f CODEBASE_BACKEND_005_MAIN_APP.ts backend/src/_app-reference.ts 2>/dev/null || true
mv -f CODEBASE_FRONTEND_001_CONFIG.ts frontend/config-reference.ts 2>/dev/null || true
mv -f CODEBASE_FRONTEND_002_API_HOOKS.tsx frontend/src/hooks/_hooks-reference.tsx 2>/dev/null || true
mv -f CODEBASE_FRONTEND_003_PAGES_COMPONENTS.tsx frontend/src/_pages-reference.tsx 2>/dev/null || true
echo "✓ Architecture files organized"

# TIER files
echo "📦 Organizing feature implementations..."
mv -f TIER1_*.ts backend/src/modules/ 2>/dev/null || true
mv -f TIER2_*.ts backend/src/modules/ 2>/dev/null || true
mv -f TIER3_*.ts backend/src/modules/ 2>/dev/null || true
mv -f TIER3_006_LEGAL_PAGES_FRONTEND.tsx frontend/src/pages/legal/ 2>/dev/null || true
mv -f TIER3_008_AWS_DEPLOYMENT_PIPELINE.yml .github/workflows/ 2>/dev/null || true
echo "✓ Feature implementations organized"

# Test files
echo "🧪 Organizing test files..."
mv -f CRITICAL_PATH_TESTS_COMPLETE.ts backend/test/critical-path.spec.ts 2>/dev/null || true
mv -f REAL_INTEGRATION_TESTS_MOCKED_SERVICES.ts backend/test/integration.spec.ts 2>/dev/null || true
echo "✓ Test files organized"

# Documentation
echo "📚 Organizing documentation..."
mkdir -p docs
mv -f PRODUCTION_READINESS_AUDIT.md docs/ 2>/dev/null || true
mv -f AUDIT_RECLASSIFICATION_AND_PRIORITY_PLAN.md docs/ 2>/dev/null || true
mv -f IDEMPOTENCY_KEY_MECHANISM_EXPLAINED.md docs/ 2>/dev/null || true
mv -f STRIPE_DB_TRANSACTION_STRATEGY.md docs/ 2>/dev/null || true
mv -f CRITICAL_PATH_IMPLEMENTATION_SUMMARY.md docs/ 2>/dev/null || true
echo "✓ Documentation organized"

echo ""
echo "✅ Files organized successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. cd backend && npm install"
echo "   2. cd ../frontend && npm install"
echo "   3. cp .env.example .env"
echo "   4. docker-compose up -d"
echo ""
