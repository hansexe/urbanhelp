#!/bin/bash

# Urban Help - Repository Setup Script
# Automatically assembles the complete repository from generated files

set -e

echo "🚀 Urban Help - Repository Setup"
echo "=================================="
echo ""

# Detect source directory (where this script is located)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SOURCE_DIR="$SCRIPT_DIR"

# Default destination directory
DEST_DIR="${1:-.}"

echo "📁 Source directory: $SOURCE_DIR"
echo "📁 Destination directory: $DEST_DIR"
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    echo "Please install Python 3 first: https://www.python.org/downloads/"
    exit 1
fi

# Run the Python generator script
echo "🔧 Running repository generator..."
python3 "$SOURCE_DIR/generate-complete-repo.py" "$SOURCE_DIR" "$DEST_DIR"

echo ""
echo "✅ Repository structure created!"
echo ""
echo "📝 Next steps:"
echo "   1. cd $DEST_DIR"
echo "   2. cd backend && npm install"
echo "   3. cd ../frontend && npm install"
echo "   4. cp .env.example .env"
echo "   5. docker-compose up -d"
echo ""
echo "🌐 Access points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   API Docs: http://localhost:3001/api/docs"
echo ""
