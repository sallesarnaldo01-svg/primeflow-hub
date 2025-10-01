#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 PrimeFlow Patch Creator${NC}"
echo "================================"

# Get version from argument or VERSION file
if [ -z "$1" ]; then
    CURRENT_VERSION=$(cat VERSION)
    echo -e "${YELLOW}No version specified, using VERSION file: ${CURRENT_VERSION}${NC}"
    NEW_VERSION=$CURRENT_VERSION
else
    NEW_VERSION=$1
fi

PATCH_DIR="patches/v${NEW_VERSION}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "\n${GREEN}Creating patch v${NEW_VERSION}...${NC}"

# Create patch directory
mkdir -p "$PATCH_DIR"

# Create temporary directory for patch contents
TMP_PATCH_DIR=$(mktemp -d)
echo "Using temporary directory: $TMP_PATCH_DIR"

# Copy relevant files (excluding node_modules, dist, etc.)
echo "Copying project files..."
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude 'patches' \
    --exclude '*.log' \
    --exclude '.env' \
    --exclude 'pnpm-lock.yaml' \
    ./ "$TMP_PATCH_DIR/"

# Copy migration files if they exist
if [ -d "prisma/migrations" ]; then
    echo "Copying database migrations..."
    mkdir -p "$TMP_PATCH_DIR/prisma/migrations"
    cp -r prisma/migrations/* "$TMP_PATCH_DIR/prisma/migrations/" 2>/dev/null || true
fi

# Create archive
echo "Creating patch archive..."
cd "$TMP_PATCH_DIR"
tar -czf "patch-v${NEW_VERSION}.tar.gz" .
cd - > /dev/null

# Move archive to patches directory
mv "$TMP_PATCH_DIR/patch-v${NEW_VERSION}.tar.gz" "$PATCH_DIR/"

# Generate checksum
echo "Generating checksum..."
cd "$PATCH_DIR"
md5sum "patch-v${NEW_VERSION}.tar.gz" > checksum.md5
cd - > /dev/null

# Create README for this patch
cat > "$PATCH_DIR/README.md" << EOF
# Patch v${NEW_VERSION}

**Created:** $(date)
**Type:** Full Patch

## Contents
- Complete project source code
- Database migrations
- Configuration templates

## Installation

\`\`\`bash
# On the target server
cd /path/to/production
curl -O [URL_DO_PATCH]/patch-v${NEW_VERSION}.tar.gz
bash scripts/apply-patch.sh ${NEW_VERSION}
\`\`\`

## Rollback

\`\`\`bash
bash scripts/rollback-patch.sh ${NEW_VERSION}
\`\`\`

## Changes
See PATCH_CHANGELOG.md for detailed changes.

## Verification
\`\`\`bash
md5sum -c checksum.md5
\`\`\`
EOF

# Copy changelog
if [ -f "PATCH_CHANGELOG.md" ]; then
    cp PATCH_CHANGELOG.md "$PATCH_DIR/CHANGELOG.md"
fi

# Create migration SQL backup if needed
if [ -d "prisma" ]; then
    echo "Exporting database schema..."
    pnpm prisma migrate diff \
        --from-empty \
        --to-schema-datamodel prisma/schema.prisma \
        --script > "$PATCH_DIR/schema.sql" 2>/dev/null || echo "-- No schema changes" > "$PATCH_DIR/schema.sql"
fi

# Clean up
rm -rf "$TMP_PATCH_DIR"

# Update VERSION file
echo "$NEW_VERSION" > VERSION

# Generate summary
PATCH_SIZE=$(du -h "$PATCH_DIR/patch-v${NEW_VERSION}.tar.gz" | cut -f1)
CHECKSUM=$(cat "$PATCH_DIR/checksum.md5" | cut -d' ' -f1)

echo ""
echo -e "${GREEN}✅ Patch created successfully!${NC}"
echo "================================"
echo "Version: v${NEW_VERSION}"
echo "Location: $PATCH_DIR"
echo "Size: $PATCH_SIZE"
echo "Checksum: $CHECKSUM"
echo ""
echo "Files created:"
echo "  - patch-v${NEW_VERSION}.tar.gz"
echo "  - checksum.md5"
echo "  - README.md"
echo "  - CHANGELOG.md"
echo "  - schema.sql"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Test patch in staging environment"
echo "2. Upload patch to distribution server"
echo "3. Apply patch with: make apply-patch VERSION=${NEW_VERSION}"
