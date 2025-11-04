# MCP Servers in Docker

This guide covers useful MCP (Model Context Protocol) servers that can run in Docker containers for use with AI assistants like Claude.

## What is MCP?

Model Context Protocol (MCP) is a protocol that allows AI assistants to connect to external tools and data sources. MCP servers provide capabilities like file system access, database queries, API integrations, and more.

## Recommended MCP Servers

### 1. **Filesystem MCP Server**
Provides secure file system access for reading/writing files.

**GitHub**: `modelcontextprotocol/servers` (official MCP servers repo)
**Docker Image**: Can be built from source

**Use Cases**:
- Read/write project files
- Search files by content
- List directories
- Create/edit files

### 2. **SQLite MCP Server**
Query and interact with SQLite databases.

**GitHub**: `modelcontextprotocol/servers`
**Features**:
- Execute SQL queries
- List tables
- Describe schema
- Safe read-only mode

**Use Cases**:
- Query local SQLite databases
- Analyze database schema
- Generate reports

### 3. **PostgreSQL MCP Server**
Connect to PostgreSQL databases.

**GitHub**: `modelcontextprotocol/servers`
**Features**:
- Execute SQL queries
- Manage connections
- Schema inspection

**Use Cases**:
- Query production/staging databases
- Database analysis
- Schema documentation

### 4. **Git MCP Server**
Git operations and repository management.

**GitHub**: `modelcontextprotocol/servers`
**Features**:
- Git operations (commit, push, pull)
- Branch management
- Diff viewing
- Repository status

**Use Cases**:
- Automated git workflows
- Code review assistance
- Branch management

### 5. **GitHub MCP Server**
GitHub API integration.

**GitHub**: `modelcontextprotocol/servers`
**Features**:
- Issue management
- PR operations
- Repository browsing
- Code search

**Use Cases**:
- Issue tracking
- PR reviews
- Repository management

### 6. **Brave Search MCP Server**
Web search capabilities.

**GitHub**: `modelcontextprotocol/servers`
**Features**:
- Web search
- Real-time information
- Search result parsing

### 7. **Puppeteer MCP Server**
Browser automation.

**GitHub**: `modelcontextprotocol/servers`
**Features**:
- Web scraping
- Screenshot capture
- Browser automation

**Use Cases**:
- Web testing
- Data extraction
- UI automation

## Docker Setup

### Building MCP Servers

Most MCP servers are Node.js/TypeScript applications that can be containerized:

```dockerfile
# Example Dockerfile for MCP server
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build if needed
RUN npm run build

# Expose MCP server port (varies by server)
EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Docker Compose Example

```yaml
version: '3.8'

services:
  mcp-filesystem:
    build:
      context: ./mcp-servers/filesystem
      dockerfile: Dockerfile
    volumes:
      - ./:/workspace:ro  # Read-only access
    environment:
      - MCP_PORT=3001
    networks:
      - mcp-network

  mcp-sqlite:
    build:
      context: ./mcp-servers/sqlite
      dockerfile: Dockerfile
    volumes:
      - ./data:/data:ro  # SQLite database files
    environment:
      - MCP_PORT=3002
    networks:
      - mcp-network

  mcp-postgres:
    build:
      context: ./mcp-servers/postgres
      dockerfile: Dockerfile
    environment:
      - MCP_PORT=3003
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=dbname
    depends_on:
      - postgres
    networks:
      - mcp-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=dbname
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - mcp-network

networks:
  mcp-network:
    driver: bridge

volumes:
  postgres_data:
```

## Official MCP Servers Repository

The official repository contains many server implementations:

**GitHub**: https://github.com/modelcontextprotocol/servers

**Available Servers**:
- Filesystem
- SQLite
- PostgreSQL
- GitHub
- Git
- Brave Search
- Puppeteer
- And many more...

## Setting Up MCP Servers

### 1. Clone Official Servers

```bash
git clone https://github.com/modelcontextprotocol/servers.git
cd servers
```

### 2. Build Docker Images

Each server typically has its own directory with setup instructions.

### 3. Configure MCP Client

MCP servers are typically configured in your AI assistant's settings:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-v",
        "${PWD}:/workspace:ro",
        "mcp-filesystem:latest"
      ]
    },
    "sqlite": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-v",
        "./data:/data:ro",
        "mcp-sqlite:latest"
      ]
    }
  }
}
```

## Security Considerations

1. **Read-Only Volumes**: Use `:ro` flag for volumes when possible
2. **Network Isolation**: Use Docker networks to isolate services
3. **Resource Limits**: Set CPU/memory limits
4. **Non-Root User**: Run containers as non-root when possible
5. **Secrets Management**: Use Docker secrets or environment files

## Best Practices

1. **Version Pinning**: Pin specific versions in Docker images
2. **Health Checks**: Add health checks to Docker containers
3. **Logging**: Configure proper logging for debugging
4. **Monitoring**: Monitor container resource usage
5. **Backup**: Regular backups for database MCP servers

## Useful Resources

- **Official MCP Documentation**: https://modelcontextprotocol.io
- **MCP Servers GitHub**: https://github.com/modelcontextprotocol/servers
- **MCP Specification**: https://spec.modelcontextprotocol.io

