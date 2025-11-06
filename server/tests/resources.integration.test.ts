import request from "supertest";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../src/app.js";
import { sequelize } from "../src/config/sequelize.js";
import { User } from "../src/db/models/User.js";
import { hashPassword as hashPasswordFn } from "../src/utils/hash.js";

async function loginAndGetAccess(agent: any, email: string, password: string) {
	const res = await agent
		.post("/api/auth/login")
		.send({ email, password })
		.set("Accept", "application/json");
	expect(res.status).toBe(200);
	expect(res.body).toHaveProperty("access");
	return res.body.access as string;
}

describe("Services/Staff/Users/Admin integration", () => {
	const agent = request.agent(app as any);
	const userEmail = `user+${Math.floor(Math.random() * 1e6)}@example.com`;
	const userPassword = "ChangeMe!123";
	const adminEmail = `admin+${Math.floor(Math.random() * 1e6)}@example.com`;
	const adminPassword = "ChangeMe!123";
	let userId: number | null = null;
	let adminId: number | null = null;

	beforeAll(async () => {
		await sequelize.sync();
		// create normal user
		const u1 = await User.create({
			email: userEmail,
			passwordHash: await hashPasswordFn(userPassword),
			role: "user",
		} as any);
		userId = u1.id;
		// create admin
		const u2 = await User.create({
			email: adminEmail,
			passwordHash: await hashPasswordFn(adminPassword),
			role: "admin",
		} as any);
		adminId = u2.id;
	});

	afterAll(async () => {
		if (userId) await User.destroy({ where: { id: userId } });
		if (adminId) await User.destroy({ where: { id: adminId } });
	});

	test("services: list (public) & 404 by id", async () => {
		const list = await agent.get("/api/services");
		expect(list.status).toBe(200);
		expect(Array.isArray(list.body)).toBe(true);
		const notFound = await agent.get("/api/services/9999999");
		expect([404, 400]).toContain(notFound.status);
	});

	test("services: protected create/update/delete require admin role", async () => {
		const userAccess = await loginAndGetAccess(agent, userEmail, userPassword);
		// Create as user -> 403
		const c1 = await agent
			.post("/api/services")
			.set("Authorization", `Bearer ${userAccess}`)
			.send({ name: "SvcX", price: 10, description: "x" });
		expect([401, 403]).toContain(c1.status);

		// Create without token -> 401
		const cNo = await agent
			.post("/api/services")
			.send({ name: "SvcNoAuth", price: 10, description: "x" });
		expect(cNo.status).toBe(401);

		const adminAccess = await loginAndGetAccess(agent, adminEmail, adminPassword);
		// Create as admin -> 201
		const c2 = await agent.post("/api/services").set("Authorization", `Bearer ${adminAccess}`).send({
			name: "Full Service",
			price: 249.0,
			description: "Full service",
			imageUrl: "https://example.com/x.png",
			published: true,
		});
		expect([200, 201]).toContain(c2.status);
		const serviceId = c2.body.id;

		// Get by id -> 200
		const g1 = await agent.get(`/api/services/${serviceId}`);
		expect(g1.status).toBe(200);

		// Update as admin -> 200
		const u1 = await agent
			.put(`/api/services/${serviceId}`)
			.set("Authorization", `Bearer ${adminAccess}`)
			.send({ price: 199.0, published: true });
		expect(u1.status).toBe(200);

		// Delete as admin -> 204/200
		const d1 = await agent
			.delete(`/api/services/${serviceId}`)
			.set("Authorization", `Bearer ${adminAccess}`);
		expect([200, 204]).toContain(d1.status);
	});

	test("services: 400 on invalid payload (admin)", async () => {
		const adminAccess = await loginAndGetAccess(agent, adminEmail, adminPassword);
		const res = await agent
			.post("/api/services")
			.set("Authorization", `Bearer ${adminAccess}`)
			.send({ name: "x", price: -1, description: "y" });
		expect(res.status).toBe(400);
	});

	test("staff: public list & protected create/update/delete", async () => {
		const list = await agent.get("/api/staff");
		expect(list.status).toBe(200);

		const adminAccess = await loginAndGetAccess(agent, adminEmail, adminPassword);
		const c1 = await agent.post("/api/staff").set("Authorization", `Bearer ${adminAccess}`).send({
			name: "Bob",
			role: "Owner/Mechanic",
			bio: "Veteran",
			photoUrl: "https://example.com/bob.png",
		});
		expect([200, 201]).toContain(c1.status);
		const staffId = c1.body.id;

		// Get non-existing staff -> 404
		const g404 = await agent.get("/api/staff/9999999");
		expect([404, 400]).toContain(g404.status);

		const userAccess = await loginAndGetAccess(agent, userEmail, userPassword);
		const uAttempt = await agent
			.put(`/api/staff/${staffId}`)
			.set("Authorization", `Bearer ${userAccess}`)
			.send({ role: "Head Mechanic" });
		expect([401, 403]).toContain(uAttempt.status);

		const u2 = await agent
			.put(`/api/staff/${staffId}`)
			.set("Authorization", `Bearer ${adminAccess}`)
			.send({ role: "Head Mechanic" });
		expect(u2.status).toBe(200);

		const d1 = await agent
			.delete(`/api/staff/${staffId}`)
			.set("Authorization", `Bearer ${adminAccess}`);
		expect([200, 204]).toContain(d1.status);
	});

	test("users: me requires auth", async () => {
		const unauth = await agent.get("/api/users/me");
		expect(unauth.status).toBe(401);

		const access = await loginAndGetAccess(agent, userEmail, userPassword);
		const me = await agent.get("/api/users/me").set("Authorization", `Bearer ${access}`);
		expect(me.status).toBe(200);
		expect(me.body).toHaveProperty("email", userEmail);
	});

	test("users: update profile requires auth and can toggle active", async () => {
		// 401 when unauthenticated
		const unauth = await agent.put("/api/users/me").send({ active: true });
		expect(unauth.status).toBe(401);

		const access = await loginAndGetAccess(agent, userEmail, userPassword);
		const upd = await agent
			.put("/api/users/me")
			.set("Authorization", `Bearer ${access}`)
			.send({ active: true });
		expect(upd.status).toBe(200);
		expect(upd.body).toHaveProperty("active", true);
	});

	test("users: update email 409 when already used", async () => {
		const access = await loginAndGetAccess(agent, userEmail, userPassword);
		const conflict = await agent
			.put("/api/users/me")
			.set("Authorization", `Bearer ${access}`)
			.send({ email: adminEmail });
		expect([400, 409]).toContain(conflict.status);
	});

	test("admin: metrics and list users require admin", async () => {
		const userAccess = await loginAndGetAccess(agent, userEmail, userPassword);
		const m1 = await agent.get("/api/admin/metrics").set("Authorization", `Bearer ${userAccess}`);
		expect(m1.status).toBe(403);

		const adminAccess = await loginAndGetAccess(agent, adminEmail, adminPassword);
		const m2 = await agent.get("/api/admin/metrics").set("Authorization", `Bearer ${adminAccess}`);
		expect(m2.status).toBe(200);
		expect(m2.body).toHaveProperty("users");

		const l1 = await agent.get("/api/admin/users").set("Authorization", `Bearer ${adminAccess}`);
		expect(l1.status).toBe(200);
		expect(Array.isArray(l1.body)).toBe(true);
	});
});
