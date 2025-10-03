#!/bin/bash
# ============================================
# CREATE COMPLETE BACKUP
# Backs up database, uploads, and configuration
# ============================================

set -e

CONFIG_FILE="${1:-/tmp/server-config.json}"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ Configuration file not found"
  exit 1
fi

echo "💾 Creating complete backup..."
echo ""

# Create backup directory
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

echo "📁 Backup location: $BACKUP_DIR"
echo ""

# Backup database
DATABASE_URL=$(cat "$CONFIG_FILE" | jq -r '.environment.database_url')

if [ -n "$DATABASE_URL" ] && [ "$DATABASE_URL" != "null" ]; then
  echo "1. Backing up database..."
  pg_dump "$DATABASE_URL" > "$BACKUP_DIR/database.sql"
  echo "  ✓ Database backed up ($(du -h "$BACKUP_DIR/database.sql" | cut -f1))"
else
  echo "⚠️  No database to backup"
fi

# Backup uploads directory
if [ -d "./uploads" ]; then
  echo ""
  echo "2. Backing up uploads..."
  tar -czf "$BACKUP_DIR/uploads.tar.gz" ./uploads
  echo "  ✓ Uploads backed up ($(du -h "$BACKUP_DIR/uploads.tar.gz" | cut -f1))"
fi

# Backup .env file
if [ -f ".env" ]; then
  echo ""
  echo "3. Backing up environment configuration..."
  cp .env "$BACKUP_DIR/env.backup"
  echo "  ✓ Environment backed up"
fi

# Backup WhatsApp sessions (if using Baileys)
if [ -d "./.wwebjs_auth" ]; then
  echo ""
  echo "4. Backing up WhatsApp sessions..."
  tar -czf "$BACKUP_DIR/whatsapp_sessions.tar.gz" ./.wwebjs_auth
  echo "  ✓ WhatsApp sessions backed up"
fi

# Create backup manifest
cat > "$BACKUP_DIR/manifest.json" <<EOF
{
  "backup_date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "version": "2.0.0",
  "components": {
    "database": $([ -f "$BACKUP_DIR/database.sql" ] && echo "true" || echo "false"),
    "uploads": $([ -f "$BACKUP_DIR/uploads.tar.gz" ] && echo "true" || echo "false"),
    "environment": $([ -f "$BACKUP_DIR/env.backup" ] && echo "true" || echo "false"),
    "whatsapp_sessions": $([ -f "$BACKUP_DIR/whatsapp_sessions.tar.gz" ] && echo "true" || echo "false")
  },
  "configuration": $(cat "$CONFIG_FILE")
}
EOF

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Backup Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Location: $BACKUP_DIR"
echo "  Total Size: $TOTAL_SIZE"
echo "  Components:"
[ -f "$BACKUP_DIR/database.sql" ] && echo "    ✓ Database"
[ -f "$BACKUP_DIR/uploads.tar.gz" ] && echo "    ✓ Uploads"
[ -f "$BACKUP_DIR/env.backup" ] && echo "    ✓ Environment"
[ -f "$BACKUP_DIR/whatsapp_sessions.tar.gz" ] && echo "    ✓ WhatsApp Sessions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Backup completed successfully!"
echo ""
echo "To restore this backup:"
echo "  bash scripts/rollback-patch.sh $TIMESTAMP"
