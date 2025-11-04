// role helpers, token utils

export function getUserRoleFromToken(token: string): string | null {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		return payload.role || null;
	} catch {
		return null;
	}
}

export function isTokenExpired(token: string): boolean {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		if (!payload.exp) return true;
		return Date.now() >= payload.exp * 1000;
	} catch {
		return true;
	}
}
