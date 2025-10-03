#!/bin/bash
# ============================================
# INTELLIGENT PATCH ORCHESTRATOR
# Manages the entire upgrade process
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
cat <<'EOF'
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗ ██████╗ ██╗███╗   ███╗███████╗███████╗██╗      ██╗ ║
║   ██╔══██╗██╔══██╗██║████╗ ████║██╔════╝██╔════╝██║      ██║ ║
║   ██████╔╝██████╔╝██║██╔████╔██║█████╗  █████╗  ██║      ██║ ║
║   ██╔═══╝ ██╔══██╗██║██║╚██╔╝██║██╔══╝  ██╔══╝  ██║ ██   ██║ ║
║   ██║     ██║  ██║██║██║ ╚═╝ ██║███████╗██║     ███╗╚█████╔╝ ║
║   ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚══════╝╚═╝     ╚══╝ ╚════╝  ║
║                                                               ║
║                   INTELLIGENT PATCH v3.0.0                    ║
║              PrimeZap → PrimeFlow Upgrade System              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if running as root (not recommended)
if [ "$EUID" -eq 0 ]; then
  echo -e "${YELLOW}⚠️  WARNING: Running as root is not recommended${NC}"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

MISSING_TOOLS=()

for tool in "node" "pnpm" "psql" "jq" "docker"; do
  if ! command -v $tool &> /dev/null; then
    MISSING_TOOLS+=("$tool")
    echo -e "  ${RED}✗${NC} $tool"
  else
    VERSION=$($tool --version 2>/dev/null | head -n 1)
    echo -e "  ${GREEN}✓${NC} $tool ($VERSION)"
  fi
done

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
  echo -e "${RED}❌ Missing required tools: ${MISSING_TOOLS[*]}${NC}"
  echo "Please install them before continuing."
  exit 1
fi

echo ""

# Step 1: Detect Configuration
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   STEP 1/7: Detecting Server Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

CONFIG_FILE=$(bash scripts/detect-server-config.sh)

if [ ! -f "$CONFIG_FILE" ]; then
  echo -e "${RED}❌ Failed to detect configuration${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Configuration detected${NC}"
echo ""
sleep 2

# Step 2: Create Backup
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   STEP 2/7: Creating Complete Backup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

HAS_DATA=$(cat "$CONFIG_FILE" | jq -r '.infrastructure.has_existing_data')

if [ "$HAS_DATA" == "true" ]; then
  echo -e "${YELLOW}⚠️  Existing data detected. Creating backup...${NC}"
  bash scripts/create-backup.sh "$CONFIG_FILE"
  echo -e "${GREEN}✅ Backup completed${NC}"
else
  echo -e "${BLUE}ℹ️  No existing data to backup${NC}"
fi

echo ""
sleep 2

# Step 3: Setup Environment
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   STEP 3/7: Configuring Environment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

bash scripts/setup-environment.sh "$CONFIG_FILE"

echo -e "${GREEN}✅ Environment configured${NC}"
echo ""
sleep 2

# Step 4: Migrate Database
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   STEP 4/7: Migrating Database Schema${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

bash scripts/migrate-database.sh "$CONFIG_FILE"

echo -e "${GREEN}✅ Database migrated${NC}"
echo ""
sleep 2

# Step 5: Install Dependencies
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   STEP 5/7: Installing Dependencies${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "  ↳ Installing Node.js packages..."
pnpm install --frozen-lockfile

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""
sleep 2

# Step 6: Build Services
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   STEP 6/7: Building Services${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "  ↳ Building frontend..."
pnpm build

echo "  ↳ Building API..."
pnpm --filter @primeflow/api build

echo "  ↳ Building worker..."
pnpm --filter @primeflow/worker build

echo -e "${GREEN}✅ Services built${NC}"
echo ""
sleep 2

# Step 7: Deploy Services
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   STEP 7/7: Deploying Services${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

DOCKER_INSTALLED=$(cat "$CONFIG_FILE" | jq -r '.infrastructure.docker_installed')

if [ "$DOCKER_INSTALLED" == "true" ]; then
  echo "  ↳ Starting services with Docker Compose..."
  docker compose -f docker/docker-compose.yml up -d --build
  
  echo ""
  echo "  ↳ Waiting for services to be healthy..."
  sleep 10
  
  # Health check
  bash scripts/health-check.sh "$CONFIG_FILE"
  
  echo -e "${GREEN}✅ Services deployed${NC}"
else
  echo -e "${YELLOW}⚠️  Docker not installed. Manual deployment required.${NC}"
  echo ""
  echo "To start services manually:"
  echo "  1. Start API: pnpm --filter @primeflow/api start"
  echo "  2. Start Worker: pnpm --filter @primeflow/worker start"
  echo "  3. Serve frontend: pnpm preview"
fi

echo ""
sleep 2

# Final Summary
echo -e "${GREEN}"
cat <<'EOF'
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                    ✅ PATCH APPLIED SUCCESSFULLY!             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

PORT=$(cat "$CONFIG_FILE" | jq -r '.environment.port')
FRONTEND_ORIGIN=$(cat "$CONFIG_FILE" | jq -r '.environment.frontend_origin')

echo -e "${GREEN}🎉 PrimeFlow v3.0.0 is now running!${NC}"
echo ""
echo "📍 Access your application:"
echo -e "   ${BLUE}Frontend:${NC} $FRONTEND_ORIGIN"
echo -e "   ${BLUE}API:${NC} http://localhost:$PORT"
echo ""
echo "📚 What's new in v3.0.0:"
echo "   ✓ AI Agents & Custom Tools (@puxarCNPJ)"
echo "   ✓ Visual Workflow Builder"
echo "   ✓ RAG Knowledge Base"
echo "   ✓ Advanced CRM with Custom Fields"
echo "   ✓ Multi-tenant Architecture"
echo "   ✓ Unified Conversation Timeline"
echo "   ✓ AI Usage Tracking & Cost Analytics"
echo "   ✓ Follow-up Cadences (Auto Reactivation)"
echo ""
echo "📋 Next steps:"
echo "   1. Configure Lovable AI (for AI features)"
echo "   2. Set up WhatsApp/Facebook/Instagram integrations"
echo "   3. Create your first AI agent"
echo "   4. Upload knowledge base documents"
echo ""
echo "📖 Documentation:"
echo "   - View PATCH_CHANGELOG.md for detailed changes"
echo "   - Check PATCH_SYSTEM.md for rollback instructions"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "   - Backup location: $(cat "$CONFIG_FILE" | jq -r '.migration_plan.backup_location // "./backups"')"
echo "   - Configuration saved: $CONFIG_FILE"
echo ""
echo -e "${GREEN}Thank you for upgrading to PrimeFlow! 🚀${NC}"
echo ""
