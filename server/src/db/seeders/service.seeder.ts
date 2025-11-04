import { Service } from "../models/Service.js";

export async function seedServices() {
	const existing = await Service.count();
	if (existing > 0) return;
	await Service.bulkCreate([
		{
			name: "Oil Change",
			price: 79.0,
			description: "Quality oil and filter replacement",
			published: true,
		},
		{
			name: "Brake Service",
			price: 249.0,
			description: "Full brake inspection and service",
			published: true,
		},
		{
			name: "Wheel Alignment",
			price: 129.0,
			description: "Precision 4-wheel alignment",
			published: true,
		},
	]);
}
