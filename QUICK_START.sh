#!/bin/bash

# Urban Help - Quick Start Script
# Run this from the directory containing all generated files

set -e

echo "🚀 Urban Help - Quick Start Setup"
echo "=================================="
echo ""

# Create urbanhelp directory
REPO_DIR="./urbanhelp"

if [ -d "$REPO_DIR" ]; then
    echo "⚠️  Directory '$REPO_DIR' already exists"
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$REPO_DIR"
    else
        echo "Aborting setup"
        exit 1
    fi
fi

echo "📁 Creating repository structure..."
mkdir -p "$REPO_DIR"

# List of configuration files to copy
CONFIG_FILES=(
    ".env.example"
    "docker-compose.yml"
    "README.md"
    "PROJECT_STRUCTURE_TREE.md"
    "FILE_MANIFEST.md"
    "FILE_MAPPING_COMPLETE.txt"
    "ASSEMBLE_REPOSITORY.md"
    "backend-package.json"
    "backend-tsconfig.json"
    "backend-nest-cli.json"
    "backend-Dockerfile"
    "backend-main.ts"
    "backend-app.module.ts"
    "backend-src-config-config.ts"
    "backend-src-common-common.module.ts"
    "frontend-package.json"
    "frontend-tsconfig.json"
    "frontend-next.config.js"
    "frontend-Dockerfile"
    "generate-complete-repo.py"
)

echo "📋 Copying configuration files..."
for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$REPO_DIR/"
        echo "   ✓ $file"
    fi
done

# List of critical implementation files to copy
CRITICAL_FILES=(
    "CRITICAL_FIX_001_STRIPE_WEBHOOKS.ts"
    "CRITICAL_FIX_002_STRIPE_IDEMPOTENCY.ts"
    "CRITICAL_FIX_003_PASSWORD_RESET_EXPIRY.ts"
    "CRITICAL_FIX_004_TRANSACTION_HANDLING.ts"
    "CRITICAL_FIX_005_INPUT_VALIDATION_DTOS.ts"
    "COMPILE_AUDIT_DTO_FIXES.ts"
)

echo "🔐 Copying critical implementations..."
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$REPO_DIR/"
        echo "   ✓ $file"
    fi
done

# List of CODEBASE files to copy
CODEBASE_FILES=(
    "CODEBASE_DATABASE_001_SCHEMA.sql"
    "CODEBASE_BACKEND_001_CONFIG.ts"
    "CODEBASE_BACKEND_002_ENTITIES.ts"
    "CODEBASE_BACKEND_003_AUTH_MODULE.ts"
    "CODEBASE_BACKEND_004_NOTIFICATIONS_STRIPE.ts"
    "CODEBASE_BACKEND_005_MAIN_APP.ts"
    "CODEBASE_FRONTEND_001_CONFIG.ts"
    "CODEBASE_FRONTEND_002_API_HOOKS.tsx"
    "CODEBASE_FRONTEND_003_PAGES_COMPONENTS.tsx"
)

echo "🏗️  Copying architecture files..."
for file in "${CODEBASE_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$REPO_DIR/"
        echo "   ✓ $file"
    fi
done

# List of TIER files
TIER_FILES=(
    "TIER1_001_BUSINESS_REGISTRATION_BACKEND.ts"
    "TIER1_002_NOTIFICATIONS_EXTENSIONS.ts"
    "TIER1_003_BUSINESS_APPROVAL_BACKEND.ts"
    "TIER1_004_BOOKING_SYSTEM_BACKEND.ts"
    "TIER1_005_SENDGRID_BOOKING_EMAILS.ts"
    "TIER1_006_TWILIO_BOOKING_SMS.ts"
    "TIER1_007_S3_UPLOAD_SYSTEM.ts"
    "TIER1_008_BUSINESS_DASHBOARD_BACKEND.ts"
    "TIER2_001_REVIEW_SYSTEM_BACKEND.ts"
    "TIER2_002_REVIEW_NOTIFICATIONS.ts"
    "TIER3_001_CUSTOMER_DASHBOARD_BACKEND.ts"
    "TIER3_002_GOOGLE_PLACES_GEOLOCATION.ts"
    "TIER3_003_BOOKING_ACCEPTANCE_WORKFLOW.ts"
    "TIER3_004_STRIPE_PAYOUT_REDIS_CACHE.ts"
    "TIER3_005_RATE_LIMITING_LOCKOUT_QUEUE.ts"
    "TIER3_006_LEGAL_PAGES_FRONTEND.tsx"
    "TIER3_007_COMPREHENSIVE_TEST_SUITES.ts"
    "TIER3_008_AWS_DEPLOYMENT_PIPELINE.yml"
)

echo "📦 Copying feature implementations..."
for file in "${TIER_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$REPO_DIR/"
        echo "   ✓ $file"
    fi
done

# List of test and documentation files
TEST_DOC_FILES=(
    "CRITICAL_PATH_TESTS_COMPLETE.ts"
    "REAL_INTEGRATION_TESTS_MOCKED_SERVICES.ts"
    "PRODUCTION_READINESS_AUDIT.md"
    "AUDIT_RECLASSIFICATION_AND_PRIORITY_PLAN.md"
    "IDEMPOTENCY_KEY_MECHANISM_EXPLAINED.md"
    "STRIPE_DB_TRANSACTION_STRATEGY.md"
    "CRITICAL_PATH_IMPLEMENTATION_SUMMARY.md"
    "COMPLETE_GENERATION_SUMMARY.md"
)

echo "🧪 Copying test and documentation files..."
for file in "${TEST_DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$REPO_DIR/"
        echo "   ✓ $file"
    fi
done

echo ""
echo "✅ All files copied!"
echo ""

# Run the Python generator to organize files
echo "🔧 Running Python repository generator..."
cd "$REPO_DIR"

if [ -f "generate-complete-repo.py" ]; then
    python3 generate-complete-repo.py . .
else
    echo "⚠️  generate-complete-repo.py not found"
    echo "Please copy it manually and run: python3 generate-complete-repo.py . ."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Your next steps:"
echo ""
echo "   1. Enter the repository:"
echo "      cd $REPO_DIR"
echo ""
echo "   2. Install backend dependencies:"
echo "      cd backend && npm install"
echo ""
echo "   3. Install frontend dependencies:"
echo "      cd ../frontend && npm install"
echo ""
echo "   4. Configure environment variables:"
echo "      cp .env.example .env"
echo "      # Edit .env and fill in your API keys:"
echo "      # - STRIPE_SECRET_KEY and STRIPE_PUBLIC_KEY"
echo "      # - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER"
echo "      # - SENDGRID_API_KEY"
echo "      # - AWS credentials"
echo "      # - JWT_SECRET and other secrets"
echo "      # - Database password"
echo ""
echo "   5. Start Docker services:"
echo "      docker-compose up -d"
echo ""
echo "   6. Verify installation:"
echo "      curl http://localhost:3001/health"
echo ""
echo "🌐 Access your marketplace:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   API Docs: http://localhost:3001/api/docs"
echo ""
echo "🚀 Start developing!"
echo ""
