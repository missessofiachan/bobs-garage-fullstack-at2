/**
 * @author Bob's Garage Team
 * @purpose Async handler wrapper for Express controllers to catch errors
 * @version 1.0.0
 */

import type { NextFunction, Request, Response } from "express";

const asyncHandler =
	(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
	(req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};

export default asyncHandler;
