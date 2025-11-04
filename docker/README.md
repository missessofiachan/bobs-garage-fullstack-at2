# Docker Configuration

This directory contains all Docker-related configuration files for the Bob's Garage project.

## Files Overview

### `docker-compose.yml`
Basic MySQL database setup with Adminer (database management UI).
- **MySQL 8.4** on port 3306
- **Adminer** on port 8080
- **Usage**: `docker-compose -f docker/docker-compose.yml up -d`

### `docker-compose.mysql.yml`
Production-ready MySQL database setup for the server.
- Uses environment variables from `server/.env`
- Includes health checks and proper networking
- **Usage**: `docker-compose -f docker/docker-compose.mysql.yml up -d`
- **Note**: Run from `server/` directory or specify path to `.env` file

### `docker-compose.mcp.yml`
MCP (Model Context Protocol) servers configuration.
- PostgreSQL database for MCP postgres server
- SQLite data volume for MCP sqlite server
- **Usage**: `docker-compose -f docker/docker-compose.mcp.yml up -d`
- See `docs/MCP-SERVERS-DOCKER.md` for details

### `docker-compose.override.yml.example`
Example override file for customizing Docker Compose configurations.
- Copy to `docker-compose.override.yml` to use
- Allows local customization without modifying base files

## Quick Start

### Start MySQL Database (Simple)
```bash
docker-compose -f docker/docker-compose.yml up -d
```

### Start MySQL Database (Production)
```bash
cd server
docker-compose -f ../docker/docker-compose.mysql.yml up -d
```

### Start MCP Servers Infrastructure
```bash
docker-compose -f docker/docker-compose.mcp.yml up -d
```

### View Logs
```bash
docker-compose -f docker/docker-compose.yml logs -f
```

### Stop Services
```bash
docker-compose -f docker/docker-compose.yml down
```

## Volume Management

### List Volumes
```bash
docker volume ls
```

### Remove Volumes (⚠️ This deletes data!)
```bash
docker-compose -f docker/docker-compose.yml down -v
```

## Network Management

All services use Docker networks for isolation:
- `bobs_garage_network` - For MySQL services
- `mcp-network` - For MCP servers

## Environment Variables

Different compose files use different environment sources:
- `docker-compose.yml` - Hardcoded values (for quick start)
- `docker-compose.mysql.yml` - Uses `server/.env` file
- `docker-compose.mcp.yml` - Uses `.env.mcp` file (create if needed)

## Troubleshooting

### Port Already in Use
If port 3306 or 8080 is already in use:
1. Change ports in the compose file
2. Or stop the conflicting service

### Permission Issues
On Linux, you may need to adjust permissions:
```bash
sudo chown -R $USER:$USER docker/
```

### Database Connection Issues
1. Check if container is running: `docker ps`
2. Check logs: `docker-compose -f docker/docker-compose.yml logs`
3. Verify environment variables are set correctly

