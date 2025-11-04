/**
 * @author Bob's Garage Team
 * @purpose Zod validation schemas for staff create and update requests
 * @version 1.0.0
 */

import { z } from "zod";

export const staffCreateSchema = z.object({
	name: z.string().min(1),
	role: z.string().optional().default("Staff"),
	bio: z.string().optional().default(""),
	photoUrl: z.string().url().or(z.literal("")).default(""),
	active: z.boolean().optional().default(true),
});

export const staffUpdateSchema = staffCreateSchema.partial();

export default { staffCreateSchema, staffUpdateSchema };
