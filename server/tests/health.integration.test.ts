import request from "supertest";
import { describe, expect, test } from "vitest";
import { app } from "../src/app.js";

describe("Health & 404", () => {
	test("health (api prefix)", async () => {
		const res = await request(app as any).get("/api/health");
		expect(res.status).toBe(200);
	});

	test("health (root)", async () => {
		const res = await request(app as any).get("/health");
		expect(res.status).toBe(200);
	});

	test("db-status returns 200 or 500", async () => {
		const res = await request(app as any).get("/db-status");
		expect([200, 500]).toContain(res.status);
	});

	test("404 on undefined api route", async () => {
		const res = await request(app as any).get("/api/definitely-not-a-route");
		expect(res.status).toBe(404);
	});

	test("404 on root undefined", async () => {
		const res = await request(app as any).get("/nope");
		expect(res.status).toBe(404);
	});
});
