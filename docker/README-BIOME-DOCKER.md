# Using Biome via Docker

This project supports running Biome (linter/formatter) via Docker container, which is useful for:
- CI/CD pipelines
- Consistent formatting across different environments
- Avoiding local Biome installation

## Quick Start

### Pull the Biome Docker Image

```bash
docker pull ghcr.io/biomejs/biome:2.3.3
```

### Using Docker Scripts

The project includes Docker-based npm scripts:

```bash
# Lint via Docker
yarn lint:docker

# Fix linting issues via Docker
yarn lint:fix:docker

# Format code via Docker
yarn format:docker

# Check formatting (no write) via Docker
yarn format:check:docker

# Run any Biome command via Docker
yarn biome:docker check --write .
```

### Using Helper Scripts

#### Linux/macOS (bash)

```bash
# Make executable
chmod +x scripts/biome-docker.sh

# Use it
./scripts/biome-docker.sh lint .
./scripts/biome-docker.sh check --write .
./scripts/biome-docker.sh format --write .
```

#### Windows (PowerShell)

```powershell
# Use it
.\scripts\biome-docker.ps1 lint .
.\scripts\biome-docker.ps1 check --write .
.\scripts\biome-docker.ps1 format --write .
```

### Direct Docker Command

You can also run Biome directly with Docker:

```bash
docker run --rm \
  -v "$(pwd):/workspace" \
  -w /workspace \
  ghcr.io/biomejs/biome:2.3.3 \
  lint .

# Or on Windows (PowerShell)
docker run --rm `
  -v "${PWD}:/workspace" `
  -w /workspace `
  ghcr.io/biomejs/biome:2.3.3 `
  lint .
```

## Configuration

The Biome configuration (`biome.jsonc`) is automatically used by the Docker container when mounted in the workspace.

## Benefits of Docker Approach

1. **No Local Installation**: Don't need to install Biome locally
2. **Consistent Version**: Always uses the exact version (2.3.3) specified
3. **CI/CD Ready**: Works seamlessly in CI/CD pipelines
4. **Isolated**: Doesn't interfere with other projects or global installations

## Comparison

| Task | Local (yarn) | Docker |
|------|--------------|--------|
| Lint | `yarn lint` | `yarn lint:docker` |
| Format | `yarn format` | `yarn format:docker` |
| Fix | `yarn lint:fix` | `yarn lint:fix:docker` |

Both methods use the same `biome.jsonc` configuration and produce identical results.

