#!/bin/bash
# =============================================================================
# Phase IV: Build Docker Images
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PHASE3_DIR="$PROJECT_ROOT/../phase-3-ai-chatbot"

echo "=============================================="
echo "  Phase IV: Building Docker Images"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

print_status "Docker is running..."

# Build Frontend Image
print_status "Building Frontend Docker image..."
cd "$PHASE3_DIR/frontend"

# Check if standalone output is enabled in next.config
if ! grep -q "output.*standalone" next.config.ts 2>/dev/null && ! grep -q "output.*standalone" next.config.js 2>/dev/null; then
    print_warning "Standalone output not found in next.config. Adding it..."
    # This needs to be configured in next.config.ts
fi

docker build \
    -t todo-frontend:latest \
    -f "$PROJECT_ROOT/docker/Dockerfile.frontend" \
    .

print_status "Frontend image built successfully!"

# Build Backend Image
print_status "Building Backend Docker image..."
cd "$PHASE3_DIR/backend"
docker build \
    -t todo-backend:latest \
    -f "$PROJECT_ROOT/docker/Dockerfile.backend" \
    .

print_status "Backend image built successfully!"

# Show image sizes
echo ""
print_status "Docker Images:"
docker images | grep -E "todo-frontend|todo-backend|REPOSITORY"

echo ""
echo "=============================================="
echo "  Build Complete!"
echo "=============================================="
echo ""
print_status "Next steps:"
echo "  1. Test locally: docker-compose up"
echo "  2. Load to Minikube: ./scripts/load-images.sh"
echo "  3. Deploy: ./scripts/deploy.sh"
