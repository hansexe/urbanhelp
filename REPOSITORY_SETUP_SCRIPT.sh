#!/bin/bash

# Urban Help - Complete Repository Setup Script
# This script organizes all generated code into the proper directory structure
# Usage: chmod +x setup-repo.sh && ./setup-repo.sh

set -e

echo "🚀 Urban Help - Repository Setup"
echo "=================================="

# Create directory structure
echo "📁 Creating directory structure..."

# Backend directories
mkdir -p backend/src/{config,entities,dtos,modules,common}
mkdir -p backend/src/modules/{auth,businesses,bookings,payments,reviews,customers,notifications,search,uploads,location,admin}
mkdir -p backend/src/modules/{auth/strategies,auth/guards}
mkdir -p backend/src/modules/payments/{services,controllers}
mkdir -p backend/src/modules/bookings/{services,controllers}
mkdir -p backend/src/modules/businesses/{services,controllers}
mkdir -p backend/src/modules/reviews/{services,controllers}
mkdir -p backend/src/modules/customers/{services,controllers}
mkdir -p backend/src/modules/notifications/{services}
mkdir -p backend/src/modules/search/{services,controllers}
mkdir -p backend/src/modules/uploads/{services,controllers}
mkdir -p backend/src/modules/location/{services,controllers}
mkdir -p backend/src/modules/admin/{services,controllers}
mkdir -p backend/src/common/{guards,decorators,filters,interceptors,pipes,middlewares,services,enums,utils}
mkdir -p backend/database/{migrations,seeds}
mkdir -p backend/test

# Frontend directories
mkdir -p frontend/src/{pages,components,hooks,services,store,types,styles,utils,context}
mkdir -p frontend/src/pages/{auth,search,business,bookings,payments,reviews,profile,legal,admin}
mkdir -p frontend/src/components/{Layout,Auth,Business,Booking,Payment,Review,Common,Maps}
mkdir -p frontend/public/{images,icons}
mkdir -p frontend/test

# Docker and config
mkdir -p nginx
mkdir -p infrastructure/{terraform,kubernetes,github-workflows}
mkdir -p docs
mkdir -p scripts

echo "✅ Directory structure created"

# Copy configuration files to backend
echo "📋 Setting up configuration files..."
cp backend-package.json backend/package.json
cp backend-tsconfig.json backend/tsconfig.json
cp backend-nest-cli.json backend/nest-cli.json
cp backend-Dockerfile backend/Dockerfile

# Copy configuration files to frontend
cp frontend-package.json frontend/package.json
cp frontend-tsconfig.json frontend/tsconfig.json
cp frontend-next.config.js frontend/next.config.js
cp frontend-Dockerfile frontend/Dockerfile

# Copy root configuration
cp docker-compose.yml ./docker-compose.yml
cp .env.example ./.env.example
cp README.md ./README.md

echo "✅ Configuration files installed"

echo ""
echo "✅ Repository setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. cd backend && npm install"
echo "2. cd ../frontend && npm install"
echo "3. cp .env.example .env (and fill in your credentials)"
echo "4. docker-compose up -d"
echo "5. Access frontend: http://localhost:3000"
echo "6. Access backend: http://localhost:3001"
echo ""
