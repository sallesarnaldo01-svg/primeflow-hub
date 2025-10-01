#!/bin/bash

set -e

echo "🚀 PrimeFlow Installation Script"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "\n${YELLOW}Checking Node.js version...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 20 or higher"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Node.js version must be 20 or higher (current: $NODE_VERSION)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check PNPM
echo -e "\n${YELLOW}Checking PNPM...${NC}"
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}Installing PNPM...${NC}"
    npm install -g pnpm
fi
echo -e "${GREEN}✓ PNPM $(pnpm -v)${NC}"

# Check Docker
echo -e "\n${YELLOW}Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓ Docker $(docker -v | cut -d' ' -f3 | tr -d ',')${NC}"

# Check Docker Compose
echo -e "\n${YELLOW}Checking Docker Compose...${NC}"
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose${NC}"

# Create .env if not exists
echo -e "\n${YELLOW}Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env from .env.example...${NC}"
    cp .env.example .env
    
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -base64 32 | tr -d '=\n')
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    else
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    fi
    
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Please edit .env and configure your API keys${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Generate Prisma Client
echo -e "\n${YELLOW}Generating Prisma Client...${NC}"
pnpm prisma generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"

# Build the project
echo -e "\n${YELLOW}Building project...${NC}"
pnpm build
echo -e "${GREEN}✓ Project built${NC}"

# Start Docker containers
echo -e "\n${YELLOW}Starting Docker containers...${NC}"
docker compose -f docker/docker-compose.yml up -d postgres redis
echo -e "${GREEN}✓ Database and Redis started${NC}"

# Wait for database to be ready
echo -e "\n${YELLOW}Waiting for database to be ready...${NC}"
sleep 10

# Run migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"
pnpm prisma migrate deploy
echo -e "${GREEN}✓ Migrations completed${NC}"

# Seed database
echo -e "\n${YELLOW}Seeding database...${NC}"
pnpm seed
echo -e "${GREEN}✓ Database seeded${NC}"

# Start all services
echo -e "\n${YELLOW}Starting all services...${NC}"
docker compose -f docker/docker-compose.yml up -d
echo -e "${GREEN}✓ All services started${NC}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Installation completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nServices:"
echo -e "  API:      http://localhost:4000"
echo -e "  Swagger:  http://localhost:4000/docs"
echo -e "  Health:   http://localhost:4000/health"
echo -e "\nUseful commands:"
echo -e "  ${YELLOW}make logs${NC}      - View logs"
echo -e "  ${YELLOW}make restart${NC}   - Restart services"
echo -e "  ${YELLOW}make down${NC}      - Stop services"
echo -e "  ${YELLOW}make migrate${NC}   - Run migrations"
echo -e "\nDefault credentials:"
echo -e "  Email:    admin@primeflow.dev"
echo -e "  Password: admin123"
echo -e "\n${YELLOW}⚠ Don't forget to configure your .env file!${NC}\n"
