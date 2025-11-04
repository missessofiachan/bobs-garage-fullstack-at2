/**
 * @author Bob's Garage Team
 * @purpose React Query hooks for Admin Users resource
 * @version 2.0.0 (Refactored with generic hooks)
 */

import type { AdminUserCreateDTO, AdminUserDTO, AdminUserUpdateDTO } from "../api/types";
import { createResourceHooks } from "./useResourceQuery";

// Create admin users hooks using the generic factory
const adminUsersHooks = createResourceHooks<AdminUserDTO, AdminUserCreateDTO, AdminUserUpdateDTO>({
	resource: "admin.users",
	basePath: "/admin/users",
	staleTime: 0, // Admin data should always be fresh
});

// Export with renamed functions for backward compatibility
export const useAdminUsers = adminUsersHooks.useList;
export const useAdminUser = adminUsersHooks.useGet;
export const useCreateAdminUser = adminUsersHooks.useCreate;
export const useUpdateAdminUser = adminUsersHooks.useUpdate;
export const useDeleteAdminUser = adminUsersHooks.useDelete;

// Re-export query keys if needed
export { adminUsersHooks };

export default useAdminUsers;
