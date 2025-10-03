#!/bin/bash
# ============================================
# DETECT SERVER CONFIGURATION
# Detects existing configuration from the server
# ============================================

set -e

echo "🔍 Detecting server configuration..."

# Initialize config object
CONFIG_FILE="/tmp/server-config.json"

# Function to detect environment variable
detect_env() {
  local var_name=$1
  local default_value=$2
  local value=""
  
  # Check if .env file exists
  if [ -f ".env" ]; then
    value=$(grep "^${var_name}=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
  fi
  
  # Use default if not found
  if [ -z "$value" ]; then
    value=$default_value
  fi
  
  echo "$value"
}

# Detect PORT
PORT=$(detect_env "PORT" "4000")
echo "  ✓ PORT: $PORT"

# Detect DATABASE_URL
DATABASE_URL=$(detect_env "DATABASE_URL" "")
if [ -z "$DATABASE_URL" ]; then
  # Try to detect from PostgreSQL running locally
  if command -v psql &> /dev/null; then
    DB_NAME=$(psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -E '(primezap|primeflow)' | head -n 1 | tr -d ' ')
    if [ -n "$DB_NAME" ]; then
      DATABASE_URL="postgresql://postgres:postgres@localhost:5432/$DB_NAME"
    fi
  fi
fi
echo "  ✓ DATABASE_URL: ${DATABASE_URL:-'Not found'}"

# Detect REDIS_URL
REDIS_URL=$(detect_env "REDIS_HOST" "localhost")
REDIS_PORT=$(detect_env "REDIS_PORT" "6379")
REDIS_FULL_URL="redis://${REDIS_URL}:${REDIS_PORT}"
echo "  ✓ REDIS_URL: $REDIS_FULL_URL"

# Detect FRONTEND_ORIGIN
FRONTEND_ORIGIN=$(detect_env "FRONTEND_ORIGIN" "http://localhost:5173")
echo "  ✓ FRONTEND_ORIGIN: $FRONTEND_ORIGIN"

# Detect JWT_SECRET
JWT_SECRET=$(detect_env "JWT_SECRET" "")
if [ -z "$JWT_SECRET" ]; then
  # Generate new JWT secret if not found
  JWT_SECRET=$(openssl rand -base64 32)
  echo "  ⚠️  JWT_SECRET: Generated new secret"
else
  echo "  ✓ JWT_SECRET: Found existing"
fi

# Check if database has data
HAS_DATA=false
if [ -n "$DATABASE_URL" ]; then
  # Check if primezap database exists
  if psql "$DATABASE_URL" -c "SELECT 1 FROM users LIMIT 1;" &> /dev/null; then
    HAS_DATA=true
    echo "  ✓ Database has existing data"
  else
    echo "  ℹ️  Database is empty or not accessible"
  fi
fi

# Detect Docker
DOCKER_INSTALLED=false
if command -v docker &> /dev/null; then
  DOCKER_INSTALLED=true
  echo "  ✓ Docker is installed"
else
  echo "  ⚠️  Docker is NOT installed"
fi

# Check if services are running
API_RUNNING=false
if curl -s "http://localhost:${PORT}/health" &> /dev/null; then
  API_RUNNING=true
  echo "  ✓ API is currently running"
else
  echo "  ℹ️  API is NOT running"
fi

# Write configuration to JSON
cat > "$CONFIG_FILE" <<EOF
{
  "version": "3.0.0",
  "detected_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "environment": {
    "port": "$PORT",
    "database_url": "$DATABASE_URL",
    "redis_url": "$REDIS_FULL_URL",
    "frontend_origin": "$FRONTEND_ORIGIN",
    "jwt_secret": "$JWT_SECRET"
  },
  "infrastructure": {
    "docker_installed": $DOCKER_INSTALLED,
    "api_running": $API_RUNNING,
    "has_existing_data": $HAS_DATA
  },
  "migration_plan": {
    "preserve_tables": ["users", "conversations", "messages", "contacts"],
    "new_tables": ["ai_agents", "workflows", "knowledge_documents", "ai_tools"],
    "create_storage_buckets": true,
    "enable_rls": true
  }
}
EOF

echo ""
echo "✅ Configuration detected and saved to: $CONFIG_FILE"
echo ""

# Display summary
echo "📊 SUMMARY:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$CONFIG_FILE" | jq -r '
  "  Port: \(.environment.port)",
  "  Database: \(if .environment.database_url != "" then "✓ Configured" else "✗ Not found" end)",
  "  Redis: \(.environment.redis_url)",
  "  Frontend: \(.environment.frontend_origin)",
  "  Docker: \(if .infrastructure.docker_installed then "✓ Installed" else "✗ Not installed" end)",
  "  Existing Data: \(if .infrastructure.has_existing_data then "✓ Yes" else "✗ No" end)"
'
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Output the config file path
echo "$CONFIG_FILE"
