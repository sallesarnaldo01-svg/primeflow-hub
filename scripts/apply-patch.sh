#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 PrimeFlow Patch Applicator${NC}"
echo "================================"

# Check if version is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Version not specified${NC}"
    echo "Usage: $0 <version>"
    echo "Example: $0 2.2.0"
    exit 1
fi

VERSION=$1
PATCH_FILE="patches/v${VERSION}/patch-v${VERSION}.tar.gz"
BACKUP_DIR="backups/pre-patch-v${VERSION}_$(date +%Y%m%d_%H%M%S)"
TEMP_EXTRACT_DIR=$(mktemp -d)

echo -e "\n${BLUE}Patch Details:${NC}"
echo "Version: v${VERSION}"
echo "Patch file: $PATCH_FILE"
echo "Backup location: $BACKUP_DIR"

# Verify patch file exists
if [ ! -f "$PATCH_FILE" ]; then
    echo -e "${RED}❌ Error: Patch file not found: $PATCH_FILE${NC}"
    echo "Please ensure the patch file exists in the patches directory."
    exit 1
fi

# Verify checksum
echo -e "\n${YELLOW}🔍 Verifying patch integrity...${NC}"
CHECKSUM_FILE="patches/v${VERSION}/checksum.md5"
if [ -f "$CHECKSUM_FILE" ]; then
    cd "patches/v${VERSION}"
    if md5sum -c checksum.md5 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Checksum verified${NC}"
    else
        echo -e "${RED}❌ Checksum verification failed!${NC}"
        echo "The patch file may be corrupted. Aborting."
        exit 1
    fi
    cd - > /dev/null
else
    echo -e "${YELLOW}⚠️  Warning: No checksum file found. Proceeding without verification.${NC}"
fi

# Confirmation prompt
echo -e "\n${YELLOW}⚠️  This will:${NC}"
echo "1. Stop all running services"
echo "2. Create a backup of current installation"
echo "3. Apply patch v${VERSION}"
echo "4. Run database migrations"
echo "5. Restart services"
echo ""
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Patch application cancelled."
    exit 0
fi

# Create backup directory
echo -e "\n${YELLOW}📦 Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"

# Stop services
echo -e "\n${YELLOW}🛑 Stopping services...${NC}"
make down 2>/dev/null || docker compose -f docker/docker-compose.yml down 2>/dev/null || true

# Backup current installation
echo "Backing up current files..."
rsync -a --progress \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude 'patches' \
    --exclude 'backups' \
    ./ "$BACKUP_DIR/"

# Backup database
echo "Backing up database..."
if command -v docker &> /dev/null; then
    docker compose -f docker/docker-compose.yml exec -T postgres pg_dump -U primeflow primeflow > "$BACKUP_DIR/database.sql" 2>/dev/null || echo "No database to backup"
fi

# Extract patch to temporary directory
echo -e "\n${YELLOW}📂 Extracting patch...${NC}"
tar -xzf "$PATCH_FILE" -C "$TEMP_EXTRACT_DIR"

# Apply patch files
echo -e "\n${YELLOW}🔄 Applying patch files...${NC}"
rsync -av --progress "$TEMP_EXTRACT_DIR/" ./

# Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
if [ -f "pnpm-lock.yaml" ]; then
    pnpm install
else
    npm install
fi

# Generate Prisma Client
echo -e "\n${YELLOW}🔨 Generating Prisma Client...${NC}"
pnpm prisma generate

# Run migrations
echo -e "\n${YELLOW}🗄️  Running database migrations...${NC}"
make up 2>/dev/null || docker compose -f docker/docker-compose.yml up -d postgres redis
sleep 5
pnpm prisma migrate deploy

# Build project
echo -e "\n${YELLOW}🏗️  Building project...${NC}"
pnpm build

# Start services
echo -e "\n${YELLOW}🚀 Starting services...${NC}"
make up

# Wait for services to be healthy
echo -e "\n${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Health check
echo -e "\n${YELLOW}🏥 Running health check...${NC}"
HEALTH_CHECK_URL="http://localhost:3001/health"
MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed${NC}"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
            echo -e "${RED}❌ Health check failed after $MAX_RETRIES attempts${NC}"
            echo -e "${YELLOW}To rollback, run: bash scripts/rollback-patch.sh ${VERSION}${NC}"
            exit 1
        fi
        echo "Retry $RETRY_COUNT/$MAX_RETRIES..."
        sleep 5
    fi
done

# Clean up
rm -rf "$TEMP_EXTRACT_DIR"

# Update VERSION file
echo "$VERSION" > VERSION

echo ""
echo -e "${GREEN}✅ Patch v${VERSION} applied successfully!${NC}"
echo "================================"
echo "Backup location: $BACKUP_DIR"
echo "Services are running."
echo ""
echo -e "${BLUE}Verification:${NC}"
echo "- Check logs: make logs"
echo "- View services: make ps"
echo "- API Health: curl http://localhost:3001/health"
echo ""
echo -e "${YELLOW}If you encounter issues:${NC}"
echo "bash scripts/rollback-patch.sh ${VERSION}"
