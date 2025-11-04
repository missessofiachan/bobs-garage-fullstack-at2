/**
 * @author Bob's Garage Team
 * @purpose React Query hooks for Staff resource
 * @version 2.0.0 (Refactored with generic hooks)
 */

import type { StaffDTO } from "../api/types";
import { createResourceHooks } from "./useResourceQuery";

// Create staff hooks using the generic factory
const staffHooks = createResourceHooks<StaffDTO>({
	resource: "staff",
	basePath: "/staff",
	staleTime: 30_000,
	uploadFieldName: "photo",
});

// Export with renamed functions for backward compatibility
export const useStaffList = staffHooks.useList;
export const useStaff = staffHooks.useGet;
export const useCreateStaff = staffHooks.useCreate;
export const useUpdateStaff = staffHooks.useUpdate;
export const useDeleteStaff = staffHooks.useDelete;
export const useUploadStaffPhoto = staffHooks.useUpload;

// Re-export query keys if needed
export { staffHooks };

export default useStaffList;
