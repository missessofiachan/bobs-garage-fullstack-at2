#!/bin/bash
# @author Bob's Garage Team
# @purpose Setup script for MCP servers from official repository
# @version 1.0.0

set -e

echo "🚀 Setting up MCP Servers..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Create directory for MCP servers
MCP_DIR="./mcp-servers"
if [ ! -d "$MCP_DIR" ]; then
    echo -e "${BLUE}📦 Cloning official MCP servers repository...${NC}"
    git clone https://github.com/modelcontextprotocol/servers.git "$MCP_DIR"
else
    echo -e "${YELLOW}⚠️  MCP servers directory already exists. Updating...${NC}"
    cd "$MCP_DIR"
    git pull
    cd ..
fi

echo -e "${GREEN}✅ MCP servers repository cloned/updated${NC}"

# Create .env file for MCP configuration
if [ ! -f ".env.mcp" ]; then
    echo -e "${BLUE}📝 Creating .env.mcp file...${NC}"
    cat > .env.mcp << EOF
# MCP Servers Configuration
POSTGRES_USER=mcp_user
POSTGRES_PASSWORD=mcp_password_change_me
POSTGRES_DB=mcp_db
POSTGRES_PORT=5432

# MCP Server Ports
MCP_FILESYSTEM_PORT=3001
MCP_SQLITE_PORT=3002
MCP_POSTGRES_PORT=3003
MCP_GITHUB_PORT=3004
MCP_GIT_PORT=3005
EOF
    echo -e "${YELLOW}⚠️  Please update .env.mcp with secure passwords${NC}"
else
    echo -e "${GREEN}✅ .env.mcp already exists${NC}"
fi

echo -e "${GREEN}✅ MCP servers setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review and edit .env.mcp for your configuration"
echo "2. Build MCP server Docker images (see docs/MCP-SERVERS-DOCKER.md)"
echo "3. Start services: docker-compose -f docker/docker-compose.mcp.yml up -d"

