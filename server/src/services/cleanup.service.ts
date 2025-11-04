/**
 * @author Bob's Garage Team
 * @purpose Cleanup service for removing orphaned uploaded files
 * @version 1.0.0
 */

import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import { Service } from "../db/models/Service.js";
import { Staff } from "../db/models/Staff.js";
import { ROOT_UPLOAD_DIR_ABS } from "../middleware/upload.js";

let timer: NodeJS.Timeout | null = null;

async function listAllFiles(dir: string): Promise<string[]> {
	const results: string[] = [];
	async function walk(d: string) {
		const items = await fs.readdir(d, { withFileTypes: true });
		for (const it of items) {
			const full = path.join(d, it.name);
			if (it.isDirectory()) await walk(full);
			else results.push(full);
		}
	}
	await walk(dir);
	return results;
}

export async function runCleanupOnce() {
	const uploadsRoot = path.resolve(ROOT_UPLOAD_DIR_ABS);
	const files = await listAllFiles(uploadsRoot);
	const services = await Service.findAll({ attributes: ["imageUrl"] });
	const staff = await Staff.findAll({ attributes: ["photoUrl"] });
	const referenced = new Set<string>();
	const base = env.BASE_URL || "http://localhost:3000";
	const prefix = `${base}/uploads`;
	for (const s of services) if (s.imageUrl) referenced.add(s.imageUrl as string);
	for (const s of staff) if (s.photoUrl) referenced.add(s.photoUrl as string);

	for (const f of files) {
		const rel = path.relative(uploadsRoot, f).replace(/\\/g, "/");
		const url = `${prefix}/${rel}`;
		if (!referenced.has(url)) {
			// delete orphan
			await fs.unlink(f).catch(() => {});
		}
	}
}

export function startCleanup(intervalMs?: number) {
	const ms = (intervalMs ?? Number(env.CLEANUP_INTERVAL_MS)) || 24 * 60 * 60 * 1000;
	if (timer) clearInterval(timer);
	timer = setInterval(() => {
		runCleanupOnce().catch(() => {});
	}, ms);
}

export function stopCleanup() {
	if (timer) clearInterval(timer);
	timer = null;
}

export default { runCleanupOnce, startCleanup, stopCleanup };
