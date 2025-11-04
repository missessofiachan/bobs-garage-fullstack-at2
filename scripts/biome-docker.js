#!/usr/bin/env node
/**
 * @author Bob's Garage Team
 * @purpose Run Biome via Docker container (Cross-platform Node.js version)
 * @version 1.0.0
 */

const { execSync } = require("child_process");
const path = require("path");
const os = require("os");

const BIOME_VERSION = "2.3.3";
const BIOME_IMAGE = `ghcr.io/biomejs/biome:${BIOME_VERSION}`;

// Get project root (parent of scripts directory)
const scriptDir = __dirname;
const projectRoot = path.resolve(scriptDir, "..");

// Get Biome arguments (everything after script name)
const biomeArgs = process.argv.slice(2);

// Build Docker command
// Docker Desktop on Windows handles Windows paths automatically
const dockerArgs = [
	"run",
	"--rm",
	"-v",
	`${projectRoot}:/workspace`,
	"-w",
	"/workspace",
	BIOME_IMAGE,
	...biomeArgs,
];

// Execute Docker command
try {
	execSync(`docker ${dockerArgs.join(" ")}`, {
		stdio: "inherit",
		cwd: projectRoot,
		shell: true,
	});
} catch (error) {
	process.exit(error.status || 1);
}
