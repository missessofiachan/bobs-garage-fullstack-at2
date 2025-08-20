import { z } from 'zod';

export const serviceCreateSchema = z.object({
	name: z.string().min(2),
	price: z.coerce.number().nonnegative(),
	description: z.string().min(2),
	imageUrl: z.string().url().or(z.literal('')).optional(),
	published: z.boolean().optional().default(true),
});

export const serviceUpdateSchema = serviceCreateSchema.partial();

export default { serviceCreateSchema, serviceUpdateSchema };

