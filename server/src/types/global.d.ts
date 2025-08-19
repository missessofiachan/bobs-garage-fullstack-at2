// Global types and Express request augmentation
export interface JwtPayload {
	sub: number;
	role: 'user' | 'admin' | string;
	iat?: number;
	exp?: number;
	[key: string]: any;
}

declare global {
	namespace Express {
		interface Request {
			// Optional property set by auth middleware after verifying a JWT
			user?: JwtPayload;
		}
	}
}

export {};
