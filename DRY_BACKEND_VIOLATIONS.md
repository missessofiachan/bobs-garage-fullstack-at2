# DRY Violations Found in Backend

This document identifies Don't Repeat Yourself (DRY) violations found in the backend codebase that should be refactored to improve maintainability and reduce code duplication.

## Summary

Found **6 major categories** of DRY violations across the backend controllers and utilities.

---

## 1. Pagination Logic Duplication ⚠️ HIGH PRIORITY

**Location:** Multiple controllers  
**Files Affected:**
- `server/src/controllers/service.controller.ts` (lines 112-113)
- `server/src/controllers/staff.controller.ts` (lines 70-71)
- `server/src/controllers/users.admin.controller.ts` (lines 73-74)
- `server/src/controllers/audit.controller.ts` (lines 50-51)

**Duplicated Code:**
```typescript
const offset = (Number(page) - 1) * Number(limit);
const actualLimit = Math.min(Number(limit), 100); // Cap at 100 per page
```

**Issue:** This pagination calculation is repeated in 4 different controllers. While `createPaginationResponse` exists in `utils/responses.ts`, the offset and limit calculation logic is duplicated.

**Recommendation:** 
- Create a utility function `calculatePaginationParams(page, limit)` in `server/src/utils/pagination.ts` that returns `{ offset, limit }`
- Or extend `createPaginationResponse` to also return offset/limit

**Impact:** Medium - If pagination logic needs to change (e.g., max limit), it must be updated in 4 places.

---

## 2. Get By ID Pattern Duplication ⚠️ HIGH PRIORITY

**Location:** Multiple controllers  
**Files Affected:**
- `server/src/controllers/service.controller.ts` (lines 142-154)
- `server/src/controllers/staff.controller.ts` (lines 99-111)
- `server/src/controllers/users.admin.controller.ts` (lines 106-120)

**Duplicated Pattern:**
```typescript
export async function getXById(req: Request, res: Response) {
	try {
		const id = parseIdParam(req, res);
		if (id === null) return; // Error response already sent

		const item = await Model.findByPk(id);
		if (!item) return sendNotFound(res);

		res.json(item);
	} catch (err) {
		handleControllerError(err, res);
	}
}
```

**Issue:** The "get by ID" pattern is nearly identical across all controllers. Only the model and response vary.

**Recommendation:**
- Create a generic helper function or factory that generates these handlers
- Example: `createGetByIdHandler(Model, resourceName)`
- Or use a higher-order function pattern

**Impact:** High - This pattern appears in at least 3 controllers and will likely be needed for future resources.

---

## 3. CRUD Operations Pattern Duplication ⚠️ HIGH PRIORITY

**Location:** Service and Staff controllers  
**Files Affected:**
- `server/src/controllers/service.controller.ts` (create, update, delete functions)
- `server/src/controllers/staff.controller.ts` (create, update, delete functions)

**Duplicated Patterns:**

### Create Pattern:
```typescript
export async function createX(req: Request, res: Response) {
	try {
		const body = req.body as CreateXRequest;
		const s = await Model.create(body as unknown as Parameters<typeof Model.create>[0]);

		// Invalidate cache for X list
		await invalidateCache("resourceName");

		// Log audit event
		await logCreate(req, "resourceName", s.id, `Created X: ${s.name}`, s.toJSON());

		res.status(201).json(s);
	} catch (err) {
		handleControllerError(err, res, {
			uniqueConstraintMessage: "Duplicate entry",
		});
	}
}
```

### Update Pattern:
```typescript
export async function updateX(req: Request, res: Response) {
	try {
		const id = parseIdParam(req, res);
		if (id === null) return;

		const body = req.body as UpdateXRequest;
		const s = await Model.findByPk(id);
		if (!s) return sendNotFound(res);

		const previousState = s.toJSON();
		await s.update(body);
		const newState = s.toJSON();

		// Invalidate cache
		await invalidateCache("resourceName", id);

		// Log audit event
		await logUpdate(req, "resourceName", id, `Updated X: ${s.name}`, previousState, newState);

		res.json(s);
	} catch (err) {
		handleControllerError(err, res, {
			uniqueConstraintMessage: "Duplicate entry",
		});
	}
}
```

### Delete Pattern:
```typescript
export async function deleteX(req: Request, res: Response) {
	try {
		const id = parseIdParam(req, res);
		if (id === null) return;

		const s = await Model.findByPk(id);
		if (!s) return sendNotFound(res);

		const previousState = s.toJSON();

		// Delete related records (if any)
		// ...

		await s.destroy();

		// Invalidate cache
		await invalidateCache("resourceName", id);

		// Log audit event
		await logDelete(req, "resourceName", id, `Deleted X: ${s.name}`, previousState);

		res.status(204).send();
	} catch (err) {
		handleControllerError(err, res);
	}
}
```

**Issue:** The create, update, and delete operations follow nearly identical patterns in both service and staff controllers. The only differences are:
- Model type
- Resource name for cache/audit
- Optional cleanup logic (e.g., deleting favorites in service delete)

**Recommendation:**
- Create generic CRUD handler factories or base controller class
- Extract common patterns into reusable functions
- Consider using a controller base class or mixin pattern

**Impact:** Very High - These patterns will likely be needed for future resources, leading to more duplication.

---

## 4. Upload Image Pattern Duplication ⚠️ MEDIUM PRIORITY

**Location:** Service and Staff controllers  
**Files Affected:**
- `server/src/controllers/service.controller.ts` (lines 299-328)
- `server/src/controllers/staff.controller.ts` (lines 248-277)

**Duplicated Code:**
```typescript
export async function uploadXImage(req: Request, res: Response) {
	try {
		const id = parseIdParam(req, res);
		if (id === null) return;

		const filename = getUploadedFilename((req as unknown as FileUploadRequest).file);
		if (!filename) {
			return sendBadRequest(res, "No file uploaded");
		}

		const s = await Model.findByPk(id);
		if (!s) return sendNotFound(res);

		// Delete old image if it exists
		await deleteOldUpload(s.imageUrl); // or s.photoUrl

		const publicUrl = generatePublicUrl(filename, "resourceName");
		await s.update({ imageUrl: publicUrl }); // or photoUrl

		// Invalidate cache
		await invalidateCache("resourceName", id);

		// Log audit event
		await logUpload(req, "resourceName", id, `Uploaded image for X: ${s.name}`);

		res.status(200).json({ id: s.id, imageUrl: publicUrl }); // or photoUrl
	} catch (err) {
		handleControllerError(err, res);
	}
}
```

**Issue:** The upload image/photo logic is nearly identical between services and staff, with only minor differences:
- Field name (`imageUrl` vs `photoUrl`)
- Resource name for cache/audit
- Model type

**Recommendation:**
- Create a generic `uploadImageHandler` function that accepts:
  - Model
  - Resource name
  - Field name (imageUrl/photoUrl)
  - Upload directory name

**Impact:** Medium - If upload logic needs to change, it must be updated in 2+ places.

---

## 5. List/Query Pattern Similarities ⚠️ MEDIUM PRIORITY

**Location:** Multiple controllers  
**Files Affected:**
- `server/src/controllers/service.controller.ts` (listServices)
- `server/src/controllers/staff.controller.ts` (listStaff)
- `server/src/controllers/users.admin.controller.ts` (listUsers)
- `server/src/controllers/audit.controller.ts` (getAuditLogs)

**Common Pattern:**
All list functions follow a similar structure:
1. Extract query parameters
2. Build where clause from filters
3. Calculate pagination (offset, limit)
4. Execute `findAndCountAll`
5. Return paginated response

**Issue:** While each has unique filtering logic, the overall structure is very similar.

**Recommendation:**
- Create a generic `listHandler` factory that accepts:
  - Model
  - Filter builder function
  - Default order
  - Optional attributes
- Or create a base query builder utility

**Impact:** Low-Medium - The filtering logic is unique per resource, so abstraction may be less beneficial.

---

## 6. ID Validation and Error Handling Pattern ⚠️ LOW PRIORITY

**Location:** Multiple controllers  
**Pattern:**
```typescript
const id = parseIdParam(req, res);
if (id === null) return; // Error response already sent

const item = await Model.findByPk(id);
if (!item) return sendNotFound(res);
```

**Issue:** This pattern is repeated many times. While `parseIdParam` and `sendNotFound` are already utilities, the pattern itself is duplicated.

**Recommendation:**
- Create a helper: `async function findByIdOr404(Model, id, res)` that:
  - Validates ID
  - Finds the record
  - Sends 404 if not found
  - Returns the record or null (if error sent)

**Impact:** Low - The utilities already exist, this is just a convenience wrapper.

---

## 7. Unauthorized Check Pattern (Favorites Controller) ⚠️ LOW PRIORITY

**Location:** `server/src/controllers/favorites.controller.ts`  
**Duplicated Code:**
```typescript
const userId = getUserIdFromRequest(req);
if (!userId) {
	return res.status(401).json({ message: "Unauthorized" });
}
```

**Issue:** This pattern appears 4 times in the favorites controller (lines 37-40, 86-88, 144-146, 193-195).

**Recommendation:**
- Create middleware or helper: `requireAuth(req, res)` that:
  - Gets userId from request
  - Sends 401 if missing
  - Returns userId or null
- Or use existing auth middleware more consistently

**Impact:** Low - Only affects one controller, but could be useful elsewhere.

---

## Recommendations Summary

### High Priority Refactoring:
1. **Extract pagination calculation** into `utils/pagination.ts`
2. **Create generic CRUD handlers** for create/update/delete operations
3. **Create generic getById handler** factory

### Medium Priority Refactoring:
4. **Create generic upload image handler**
5. **Consider base controller class** or factory pattern for common operations

### Low Priority Refactoring:
6. **Create findByIdOr404 helper**
7. **Extract unauthorized check pattern**

---

## Files to Review/Refactor

### Controllers:
- `server/src/controllers/service.controller.ts`
- `server/src/controllers/staff.controller.ts`
- `server/src/controllers/users.admin.controller.ts`
- `server/src/controllers/audit.controller.ts`
- `server/src/controllers/favorites.controller.ts`

### Utilities to Create/Enhance:
- `server/src/utils/pagination.ts` (enhance with calculation functions)
- `server/src/utils/crud.ts` (new - generic CRUD handlers)
- `server/src/utils/controllers.ts` (new - controller helper factories)

---

## Notes

- The codebase already has good separation of concerns with utilities for error handling, validation, and responses
- Most duplication is in controller layer, which is common but can be improved
- Consider TypeScript generics and factory patterns for maximum reusability
- Ensure any refactoring maintains type safety and doesn't reduce code clarity

