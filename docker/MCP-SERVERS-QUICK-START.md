# MCP Servers Quick Start Guide

## Quick Setup

### 1. Clone Official MCP Servers Repository

```bash
# Run the setup script
./scripts/setup-mcp-servers.sh

# Or manually:
git clone https://github.com/modelcontextprotocol/servers.git ./mcp-servers
```

### 2. Popular MCP Servers to Use

#### **Filesystem Server** 📁
- **What**: Read/write files, search, list directories
- **Use Case**: File operations, code editing, project browsing
- **Docker**: Easy to containerize with volume mounts

#### **SQLite Server** 🗄️
- **What**: Query SQLite databases
- **Use Case**: Local database queries, data analysis
- **Docker**: Mount database files as volumes

#### **PostgreSQL Server** 🐘
- **What**: Query PostgreSQL databases
- **Use Case**: Production/staging database access
- **Docker**: Connect to existing PostgreSQL or use provided container

#### **Git Server** 🔀
- **What**: Git operations (commit, push, pull, branch management)
- **Use Case**: Automated git workflows, code review
- **Docker**: Mount git repository as volume

#### **GitHub Server** 🐙
- **What**: GitHub API operations
- **Use Case**: Issue management, PR reviews, repository operations
- **Docker**: Requires GitHub token as environment variable

#### **Brave Search Server** 🔍
- **What**: Web search capabilities
- **Use Case**: Real-time information, research
- **Docker**: Simple container, requires API key

#### **Puppeteer Server** 🤖
- **What**: Browser automation and web scraping
- **Use Case**: Web testing, data extraction, screenshots
- **Docker**: Requires Chrome/Chromium in container

## Docker Commands

### Start MCP Infrastructure

```bash
# Start PostgreSQL for MCP postgres server
docker-compose -f docker/docker-compose.mcp.yml up -d postgres

# Start SQLite data volume
docker-compose -f docker/docker-compose.mcp.yml up -d sqlite-data
```

### Build and Run MCP Servers

Each server in the official repository typically has:
- `package.json` - Node.js dependencies
- `Dockerfile` or instructions for containerization
- `README.md` - Setup and usage instructions

Example build:

```bash
cd mcp-servers/src/filesystem
docker build -t mcp-filesystem:latest .
docker run -d \
  -v "$(pwd):/workspace:ro" \
  -p 3001:3001 \
  --name mcp-filesystem \
  mcp-filesystem:latest
```

## Configuration

### Environment Variables

Create `.env.mcp`:

```env
# Database
POSTGRES_USER=mcp_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=mcp_db
POSTGRES_PORT=5432

# GitHub (for GitHub MCP server)
GITHUB_TOKEN=ghp_your_token_here

# Brave Search (for Brave MCP server)
BRAVE_API_KEY=your_api_key_here
```

### MCP Client Configuration

Configure in your AI assistant (Claude Desktop, etc.):

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-v",
        "${PWD}:/workspace:ro",
        "mcp-filesystem:latest"
      ]
    }
  }
}
```

## Recommended MCP Servers for This Project

Based on your Bob's Garage project:

1. **Filesystem Server** ✅
   - Read/write project files
   - Search code
   - Navigate project structure

2. **PostgreSQL Server** ✅
   - Query your MySQL database (via PostgreSQL adapter or direct MySQL server)
   - Database analysis
   - Schema inspection

3. **Git Server** ✅
   - Git operations
   - Branch management
   - Code review

4. **GitHub Server** ✅
   - Issue tracking
   - PR management
   - Repository operations

## Resources

- **Official Repository**: https://github.com/modelcontextprotocol/servers
- **MCP Documentation**: https://modelcontextprotocol.io
- **MCP Specification**: https://spec.modelcontextprotocol.io

## Next Steps

1. Run `./scripts/setup-mcp-servers.sh` to clone servers
2. Review `docs/MCP-SERVERS-DOCKER.md` for detailed setup
3. Build Docker images for servers you need
4. Configure in your AI assistant
5. Start using MCP capabilities!

