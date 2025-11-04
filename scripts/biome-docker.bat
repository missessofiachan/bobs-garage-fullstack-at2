@echo off
REM @author Bob's Garage Team
REM @purpose Run Biome via Docker container (Windows batch version)
REM @version 1.0.0

REM Docker image version (matches package.json)
set BIOME_VERSION=2.3.3
set BIOME_IMAGE=ghcr.io/biomejs/biome:%BIOME_VERSION%

REM Get the project root (parent of scripts directory)
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."

REM Convert to forward slashes for Docker
set "PROJECT_ROOT=%PROJECT_ROOT:\=/%"

REM Run Docker with Biome
docker run --rm -v "%PROJECT_ROOT%:/workspace" -w /workspace %BIOME_IMAGE% %*

