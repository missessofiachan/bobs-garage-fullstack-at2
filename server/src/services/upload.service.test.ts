/**
 * @author Bob's Garage Team
 * @purpose Unit tests for upload service
 * @version 1.0.0
 */

import fs from "node:fs/promises";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteOldUpload, generatePublicUrl, getUploadedFilename } from "./upload.service.js";

// Mock env config
vi.mock("../config/env.js", () => ({
	env: {
		BASE_URL: "http://localhost:3000",
	},
}));

// Mock upload middleware constants
vi.mock("../middleware/upload.js", () => ({
	UPLOADS_PUBLIC_PATH: "/uploads",
	ROOT_UPLOAD_DIR_ABS: "/tmp/uploads",
}));

// Mock fs
vi.mock("node:fs/promises", () => ({
	default: {
		unlink: vi.fn(),
	},
}));

// Mock path
vi.mock("node:path", () => ({
	default: {
		resolve: vi.fn((...args) => {
			// Simple mock that joins paths
			return args.join("/").replace(/\/+/g, "/");
		}),
		join: vi.fn((...args) => {
			return args.join("/").replace(/\/+/g, "/");
		}),
	},
}));

describe("generatePublicUrl", () => {
	it("should generate URL for services subdirectory", () => {
		const url = generatePublicUrl("image.jpg", "services");
		expect(url).toBe("http://localhost:3000/uploads/services/image.jpg");
	});

	it("should generate URL for staff subdirectory", () => {
		const url = generatePublicUrl("photo.png", "staff");
		expect(url).toBe("http://localhost:3000/uploads/staff/photo.png");
	});

	it("should handle filenames with special characters", () => {
		const url = generatePublicUrl("my-image-123_abc.jpg", "services");
		expect(url).toBe("http://localhost:3000/uploads/services/my-image-123_abc.jpg");
	});

	it("should use BASE_URL from env", () => {
		// BASE_URL is mocked to 'http://localhost:3000'
		const url = generatePublicUrl("test.jpg", "services");
		expect(url).toContain("http://localhost:3000");
	});

	it("should handle nested paths in filename", () => {
		const url = generatePublicUrl("folder/subfolder/image.jpg", "services");
		expect(url).toBe("http://localhost:3000/uploads/services/folder/subfolder/image.jpg");
	});
});

describe("deleteOldUpload", () => {
	const mockUnlink = fs.unlink as ReturnType<typeof vi.fn>;
	const mockResolve = path.resolve as ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return early for null URL", async () => {
		await deleteOldUpload(null);
		expect(mockUnlink).not.toHaveBeenCalled();
	});

	it("should return early for undefined URL", async () => {
		await deleteOldUpload(undefined);
		expect(mockUnlink).not.toHaveBeenCalled();
	});

	it("should return early for non-string URL", async () => {
		await deleteOldUpload(123 as any);
		expect(mockUnlink).not.toHaveBeenCalled();
	});

	it("should return early for URL not starting with uploads prefix", async () => {
		await deleteOldUpload("http://external.com/file.jpg");
		expect(mockUnlink).not.toHaveBeenCalled();
	});

	it("should delete file for valid upload URL", async () => {
		// Mock path.resolve to return a path within uploads directory
		mockResolve.mockImplementation((...args) => {
			const joined = args.join("/").replace(/\/+/g, "/");
			// Always return path that starts with /tmp/uploads for this test
			if (joined.includes("/tmp/uploads")) {
				return joined;
			}
			return `/tmp/uploads/${joined.replace(/^\./, "")}`;
		});
		mockUnlink.mockResolvedValue(undefined);

		await deleteOldUpload("http://localhost:3000/uploads/services/image.jpg");

		expect(mockUnlink).toHaveBeenCalled();
	});

	it("should handle file deletion errors silently", async () => {
		mockResolve.mockImplementation((...args) => {
			const joined = args.join("/").replace(/\/+/g, "/");
			return joined.includes("/tmp/uploads") ? joined : `/tmp/uploads/${joined}`;
		});
		mockUnlink.mockRejectedValue(new Error("File not found"));

		// Should not throw
		await expect(
			deleteOldUpload("http://localhost:3000/uploads/services/image.jpg"),
		).resolves.not.toThrow();

		expect(mockUnlink).toHaveBeenCalled();
	});

	it("should not delete files outside uploads directory (security check)", async () => {
		// Mock path.resolve to return different values based on what's being resolved
		let callCount = 0;
		mockResolve.mockImplementation((...args) => {
			callCount++;
			const joined = args.join("/");
			// First call: creating candidate path (path.join result)
			// Second call: safety check (ROOT_UPLOAD_DIR_ABS = '/tmp/uploads')
			if (callCount === 1) {
				// First resolve call for candidate - return malicious path
				return "/etc/passwd";
			} else {
				// Second resolve call for safety check - return resolved uploads dir
				return "/tmp/uploads";
			}
		});

		await deleteOldUpload("http://localhost:3000/uploads/../../../etc/passwd");

		// The function checks if candidate starts with resolved ROOT_UPLOAD_DIR_ABS
		// Since /etc/passwd doesn't start with /tmp/uploads, unlink should not be called
		expect(mockUnlink).not.toHaveBeenCalled();
	});

	it("should handle URLs with query parameters", async () => {
		mockResolve.mockImplementation((...args) => {
			const joined = args.join("/").replace(/\/+/g, "/");
			return joined.includes("/tmp/uploads") ? joined : `/tmp/uploads/${joined}`;
		});
		mockUnlink.mockResolvedValue(undefined);

		await deleteOldUpload("http://localhost:3000/uploads/services/image.jpg?v=123");

		// Should still attempt to delete (though path parsing may vary)
		expect(mockUnlink).toHaveBeenCalled();
	});

	it("should silently ignore all errors", async () => {
		// Mock path.resolve to throw, but the function should catch and ignore
		const originalResolve = path.resolve;
		mockResolve.mockImplementation(() => {
			throw new Error("Path resolution error");
		});

		// Should not throw - errors are caught and ignored
		await expect(
			deleteOldUpload("http://localhost:3000/uploads/services/image.jpg"),
		).resolves.not.toThrow();
	});
});

describe("getUploadedFilename", () => {
	it("should return filename from Multer file object", () => {
		const file = {
			filename: "uploaded-image.jpg",
			originalname: "original.jpg",
			fieldname: "image",
			encoding: "7bit",
			mimetype: "image/jpeg",
			size: 12345,
			destination: "/tmp",
			path: "/tmp/uploaded-image.jpg",
			buffer: Buffer.from(""),
		} as Express.Multer.File;

		const filename = getUploadedFilename(file);
		expect(filename).toBe("uploaded-image.jpg");
	});

	it("should return null when file is undefined", () => {
		const filename = getUploadedFilename(undefined);
		expect(filename).toBeNull();
	});

	it("should return null when filename is undefined", () => {
		const file = {
			originalname: "original.jpg",
		} as Express.Multer.File;

		const filename = getUploadedFilename(file);
		expect(filename).toBeNull();
	});

	it("should return null when filename is empty string", () => {
		const file = {
			filename: "",
		} as Express.Multer.File;

		const filename = getUploadedFilename(file);
		expect(filename).toBeNull(); // Empty string is falsy
	});

	it("should handle file with only filename property", () => {
		const file = {
			filename: "test.png",
		} as Express.Multer.File;

		const filename = getUploadedFilename(file);
		expect(filename).toBe("test.png");
	});
});
