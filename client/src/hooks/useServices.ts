/**
 * @author Bob's Garage Team
 * @purpose React Query hooks for Services resource
 * @version 2.0.0 (Refactored with generic hooks)
 */

import type { ServiceDTO } from '../api/types';
import { createResourceHooks } from './useResourceQuery';

// Create services hooks using the generic factory
const servicesHooks = createResourceHooks<ServiceDTO>({
  resource: 'services',
  basePath: '/services',
  staleTime: 30_000,
  uploadFieldName: 'image',
});

// Export with renamed functions for backward compatibility
export const useServices = servicesHooks.useList;
export const useService = servicesHooks.useGet;
export const useCreateService = servicesHooks.useCreate;
export const useUpdateService = servicesHooks.useUpdate;
export const useDeleteService = servicesHooks.useDelete;
export const useUploadServiceImage = servicesHooks.useUpload;

// Re-export query keys if needed
export { servicesHooks };

export default useServices;
