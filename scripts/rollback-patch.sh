#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}⏪ PrimeFlow Patch Rollback${NC}"
echo "================================"

# Check if version is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Version not specified${NC}"
    echo "Usage: $0 <version>"
    echo "Example: $0 2.2.0"
    exit 1
fi

VERSION=$1

# Find the most recent backup for this version
BACKUP_DIR=$(find backups -type d -name "pre-patch-v${VERSION}_*" | sort -r | head -n 1)

if [ -z "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ Error: No backup found for version ${VERSION}${NC}"
    echo "Available backups:"
    ls -la backups/ 2>/dev/null || echo "No backups directory found"
    exit 1
fi

echo -e "\n${BLUE}Rollback Details:${NC}"
echo "Version: v${VERSION}"
echo "Backup location: $BACKUP_DIR"

# Confirmation prompt
echo -e "\n${YELLOW}⚠️  This will:${NC}"
echo "1. Stop all running services"
echo "2. Restore files from backup"
echo "3. Restore database from backup"
echo "4. Restart services"
echo ""
read -p "Continue with rollback? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Rollback cancelled."
    exit 0
fi

# Stop services
echo -e "\n${YELLOW}🛑 Stopping services...${NC}"
make down 2>/dev/null || docker compose -f docker/docker-compose.yml down 2>/dev/null || true

# Restore files
echo -e "\n${YELLOW}📂 Restoring files from backup...${NC}"
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'patches' \
    --exclude 'backups' \
    "$BACKUP_DIR/" ./

# Restore database
echo -e "\n${YELLOW}🗄️  Restoring database...${NC}"
make up 2>/dev/null || docker compose -f docker/docker-compose.yml up -d postgres redis
sleep 5

if [ -f "$BACKUP_DIR/database.sql" ]; then
    echo "Restoring database from backup..."
    cat "$BACKUP_DIR/database.sql" | docker compose -f docker/docker-compose.yml exec -T postgres psql -U primeflow primeflow || {
        echo -e "${YELLOW}⚠️  Database restore had warnings (this might be normal)${NC}"
    }
else
    echo -e "${YELLOW}⚠️  No database backup found, skipping database restore${NC}"
fi

# Reinstall dependencies
echo -e "\n${YELLOW}📦 Reinstalling dependencies...${NC}"
if [ -f "pnpm-lock.yaml" ]; then
    pnpm install
else
    npm install
fi

# Generate Prisma Client
echo -e "\n${YELLOW}🔨 Generating Prisma Client...${NC}"
pnpm prisma generate

# Build project
echo -e "\n${YELLOW}🏗️  Building project...${NC}"
pnpm build

# Start services
echo -e "\n${YELLOW}🚀 Starting services...${NC}"
make up

# Wait for services
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
            echo "Please check logs: make logs"
            exit 1
        fi
        echo "Retry $RETRY_COUNT/$MAX_RETRIES..."
        sleep 5
    fi
done

# Get previous version from backup
PREVIOUS_VERSION=$(cat "$BACKUP_DIR/VERSION" 2>/dev/null || echo "unknown")
echo "$PREVIOUS_VERSION" > VERSION

echo ""
echo -e "${GREEN}✅ Rollback completed successfully!${NC}"
echo "================================"
echo "Restored from: $BACKUP_DIR"
echo "Current version: $PREVIOUS_VERSION"
echo "Services are running."
echo ""
echo -e "${BLUE}Verification:${NC}"
echo "- Check logs: make logs"
echo "- View services: make ps"
echo "- API Health: curl http://localhost:3001/health"
