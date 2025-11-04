# @author Bob's Garage Team
# @purpose Run Biome via Docker container (PowerShell version)
# @version 1.0.0

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$BiomeArgs
)

# Docker image version (matches package.json)
$BIOME_VERSION = "2.3.3"
$BIOME_IMAGE = "ghcr.io/biomejs/biome:${BIOME_VERSION}"

# Get the project root (parent of scripts directory)
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR

# Convert project root to Windows path format for Docker
$PROJECT_ROOT = $PROJECT_ROOT -replace '\\', '/'

# Build Docker command
$dockerArgs = @(
    "run", "--rm",
    "-v", "${PROJECT_ROOT}:/workspace",
    "-w", "/workspace",
    $BIOME_IMAGE
)

# Add Biome arguments
$dockerArgs += $BiomeArgs

# Run Docker
docker $dockerArgs

