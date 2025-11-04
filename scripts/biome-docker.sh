#!/bin/bash
# @author Bob's Garage Team
# @purpose Run Biome via Docker container
# @version 1.0.0

# Docker image version (matches package.json)
BIOME_VERSION="2.3.3"
BIOME_IMAGE="ghcr.io/biomejs/biome:${BIOME_VERSION}"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root (parent of scripts directory)
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Run Biome in Docker with:
# - Mount project root to /workspace
# - Use same working directory context
# - Pass all arguments to Biome
docker run --rm \
  -v "${PROJECT_ROOT}:/workspace" \
  -w /workspace \
  "${BIOME_IMAGE}" \
  "$@"

