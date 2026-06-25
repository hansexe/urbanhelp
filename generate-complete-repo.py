#!/usr/bin/env python3
"""
Urban Help - Complete Repository Generator
Organizes all generated files into the proper directory structure
"""

import os
import shutil
import sys
from pathlib import Path

# File mappings: (source_file, destination_path)
FILE_MAPPINGS = {
    # Root configuration
    '.env.example': '.env.example',
    'docker-compose.yml': 'docker-compose.yml',
    'README.md': 'README.md',
    'backend-package.json': 'backend/package.json',
    'backend-tsconfig.json': 'backend/tsconfig.json',
    'backend-nest-cli.json': 'backend/nest-cli.json',
    'backend-Dockerfile': 'backend/Dockerfile',
    'backend-main.ts': 'backend/src/main.ts',
    'backend-app.module.ts': 'backend/src/app.module.ts',
    'backend-src-config-config.ts': 'backend/src/config/config.ts',

    # Frontend
    'frontend-package.json': 'frontend/package.json',
    'frontend-tsconfig.json': 'frontend/tsconfig.json',
    'frontend-next.config.js': 'frontend/next.config.js',
    'frontend-Dockerfile': 'frontend/Dockerfile',

    # Critical Path Implementations - will be processed and split
    'CRITICAL_FIX_001_STRIPE_WEBHOOKS.ts': 'backend/src/modules/payments/stripe-webhook.service.ts',
    'CRITICAL_FIX_002_STRIPE_IDEMPOTENCY.ts': 'backend/src/modules/payments/stripe-payment.service.ts',
    'CRITICAL_FIX_003_PASSWORD_RESET_EXPIRY.ts': 'backend/src/modules/auth/password-reset.service.ts',
    'CRITICAL_FIX_004_TRANSACTION_HANDLING.ts': 'backend/src/modules/payments/payment.service.ts',
    'CRITICAL_FIX_005_INPUT_VALIDATION_DTOS.ts': 'backend/src/dtos/index.ts',
    'COMPILE_AUDIT_DTO_FIXES.ts': 'backend/src/common/enums/index.ts',
}

def create_directory_structure(base_path: str):
    """Create all necessary directories"""
    directories = [
        'backend/src/config',
        'backend/src/entities',
        'backend/src/dtos',
        'backend/src/dtos/auth',
        'backend/src/dtos/business',
        'backend/src/dtos/booking',
        'backend/src/dtos/payment',
        'backend/src/dtos/review',
        'backend/src/dtos/common',
        'backend/src/modules',
        'backend/src/modules/auth/strategies',
        'backend/src/modules/auth/guards',
        'backend/src/modules/businesses',
        'backend/src/modules/bookings',
        'backend/src/modules/payments',
        'backend/src/modules/reviews',
        'backend/src/modules/customers',
        'backend/src/modules/notifications',
        'backend/src/modules/search',
        'backend/src/modules/uploads',
        'backend/src/modules/location',
        'backend/src/modules/admin',
        'backend/src/common',
        'backend/src/common/guards',
        'backend/src/common/decorators',
        'backend/src/common/filters',
        'backend/src/common/interceptors',
        'backend/src/common/pipes',
        'backend/src/common/middlewares',
        'backend/src/common/services',
        'backend/src/common/enums',
        'backend/src/common/utils',
        'backend/database/migrations',
        'backend/database/seeds',
        'backend/test',
        'frontend/src/pages',
        'frontend/src/pages/auth',
        'frontend/src/pages/search',
        'frontend/src/pages/business',
        'frontend/src/pages/bookings',
        'frontend/src/pages/payments',
        'frontend/src/pages/reviews',
        'frontend/src/pages/profile',
        'frontend/src/pages/legal',
        'frontend/src/pages/admin',
        'frontend/src/components',
        'frontend/src/components/Layout',
        'frontend/src/components/Auth',
        'frontend/src/components/Business',
        'frontend/src/components/Booking',
        'frontend/src/components/Payment',
        'frontend/src/components/Review',
        'frontend/src/components/Common',
        'frontend/src/components/Maps',
        'frontend/src/hooks',
        'frontend/src/services',
        'frontend/src/store',
        'frontend/src/types',
        'frontend/src/styles',
        'frontend/src/utils',
        'frontend/src/context',
        'frontend/public/images',
        'frontend/public/icons',
        'frontend/test',
        'infrastructure/terraform',
        'infrastructure/kubernetes',
        'docs',
        'scripts',
        'nginx',
    ]

    for directory in directories:
        full_path = os.path.join(base_path, directory)
        os.makedirs(full_path, exist_ok=True)
        print(f"✓ Created: {directory}")

def copy_files(source_dir: str, base_path: str):
    """Copy mapped files to their destinations"""
    copied = 0
    missing = 0

    for source_file, destination_path in FILE_MAPPINGS.items():
        source_path = os.path.join(source_dir, source_file)
        full_dest_path = os.path.join(base_path, destination_path)

        if os.path.exists(source_path):
            os.makedirs(os.path.dirname(full_dest_path), exist_ok=True)
            shutil.copy2(source_path, full_dest_path)
            print(f"✓ Copied: {source_file} → {destination_path}")
            copied += 1
        else:
            print(f"✗ Missing: {source_file}")
            missing += 1

    return copied, missing

def create_gitignore(base_path: str):
    """Create .gitignore file"""
    gitignore_content = """# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build outputs
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Testing
coverage/
.nyc_output/

# Docker
.dockerignore

# OS
Thumbs.db
"""

    gitignore_path = os.path.join(base_path, '.gitignore')
    with open(gitignore_path, 'w') as f:
        f.write(gitignore_content)
    print(f"✓ Created: .gitignore")

def create_license(base_path: str):
    """Create MIT LICENSE file"""
    license_content = """MIT License

Copyright (c) 2024 Urban Help

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

    license_path = os.path.join(base_path, 'LICENSE')
    with open(license_path, 'w') as f:
        f.write(license_content)
    print(f"✓ Created: LICENSE")

def main():
    """Main execution"""
    if len(sys.argv) < 2:
        print("Usage: python3 generate-complete-repo.py <source_dir> <destination_dir>")
        print("Example: python3 generate-complete-repo.py ./generated ./urbanhelp")
        sys.exit(1)

    source_dir = sys.argv[1]
    dest_dir = sys.argv[2] if len(sys.argv) > 2 else 'urbanhelp'

    print(f"🚀 Urban Help - Complete Repository Generator")
    print(f"===============================================")
    print(f"Source directory: {source_dir}")
    print(f"Destination directory: {dest_dir}")
    print()

    # Create directory structure
    print("📁 Creating directory structure...")
    create_directory_structure(dest_dir)
    print()

    # Copy files
    print("📋 Copying files...")
    copied, missing = copy_files(source_dir, dest_dir)
    print(f"\n✓ Copied: {copied} files")
    if missing > 0:
        print(f"✗ Missing: {missing} files (these need to be generated)")
    print()

    # Create additional files
    print("📝 Creating additional files...")
    create_gitignore(dest_dir)
    create_license(dest_dir)
    print()

    print("✅ Repository structure created successfully!")
    print()
    print("📝 Next steps:")
    print(f"   1. cd {dest_dir}")
    print("   2. cd backend && npm install")
    print("   3. cd ../frontend && npm install")
    print("   4. cp .env.example .env")
    print("   5. docker-compose up -d")
    print()
    print("🌐 Access points:")
    print("   Frontend: http://localhost:3000")
    print("   Backend:  http://localhost:3001")
    print("   API Docs: http://localhost:3001/api/docs")

if __name__ == '__main__':
    main()
