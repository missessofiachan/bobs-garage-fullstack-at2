# Testing Plan - Bob's Garage Client

## Current Status
- ✅ **197 tests passing** across 19 test files
- ✅ **Good coverage in tested areas**: 87.96% branches, 84.48% functions
- ⚠️ **Low overall coverage**: 12.73% statements/lines (many files untested)
- ✅ **Coverage thresholds set**: 50% statements/lines, 70% branches/functions

## Priority Levels

### 🔴 **Priority 1: Critical Business Logic** (High Impact, High Risk)
These are core functionality that must work correctly for the app to function.

#### API & Data Layer
- [ ] `src/api/auth.api.ts` - Authentication API calls
- [ ] `src/api/services.api.ts` - Services CRUD operations
- [ ] `src/api/http.ts` - HTTP utilities
- [ ] `src/api/jwt.ts` - JWT decoding/validation

#### Auth & Security
- [x] `src/routes/ProtectedRoute.tsx` - ✅ Already tested
- [x] `src/hooks/useAuth.ts` - ✅ Already tested
- [ ] `src/pages/lib/auth.ts` - Auth utilities (if exists)

#### Core Hooks
- [x] `src/hooks/useForm.ts` - ✅ Already tested
- [x] `src/hooks/useResourceQuery.ts` - ✅ Already tested
- [ ] `src/hooks/useFavorites.ts` - Favorites functionality
- [ ] `src/hooks/useServices.ts` - Services data fetching
- [ ] `src/hooks/useStaff.ts` - Staff data fetching
- [ ] `src/hooks/useConnectionStatus.ts` - Connection monitoring

---

### 🟡 **Priority 2: User-Facing Components** (High Visibility)
Components users interact with directly. Bugs here are immediately visible.

#### Navigation & Layout
- [ ] `src/components/NavBar.tsx` - Main navigation
- [ ] `src/components/Footer.tsx` - Footer with connection status
- [ ] `src/app/App.tsx` - Root app routing

#### Forms & Inputs
- [ ] `src/components/forms/TextField.tsx` - Text input component
- [ ] `src/components/forms/Select.tsx` - Select dropdown component
- [ ] `src/pages/Login.tsx` - Login form
- [ ] `src/pages/Register.tsx` - Registration form

#### UI Components
- [x] `src/components/ui/ConfirmDialog.tsx` - ✅ Already tested (accessibility fixed)
- [x] `src/components/ui/ToastProvider.tsx` - ✅ Already tested
- [ ] `src/components/ui/Loading.tsx` - Loading states
- [ ] `src/components/ui/AnimatedLoading.tsx` - Animated loading

---

### 🟢 **Priority 3: Pages & Routes** (Medium Impact)
Full page components that integrate multiple pieces.

#### Public Pages
- [ ] `src/pages/Home.tsx` - Landing page
- [ ] `src/pages/About.tsx` - About page
- [ ] `src/pages/Services.tsx` - Services listing
- [ ] `src/pages/Staff.tsx` - Staff listing
- [ ] `src/pages/NotFound.tsx` - 404 page

#### Protected Pages
- [ ] `src/pages/Profile.tsx` - User profile
- [ ] `src/pages/Settings.tsx` - User settings
- [ ] `src/pages/Favorites.tsx` - Favorites page
- [ ] `src/pages/ForgotPassword.tsx` - Password reset

#### Admin Pages
- [ ] `src/pages/Admin/Dashboard.tsx` - Admin dashboard
- [ ] `src/pages/Admin/ServicesAdmin.tsx` - Admin services CRUD
- [ ] `src/pages/Admin/StaffAdmin.tsx` - Admin staff CRUD
- [ ] `src/pages/Admin/UsersAdmin.tsx` - Admin users management

---

### 🔵 **Priority 4: Utilities & Helpers** (Low Risk, High Reusability)
Utility functions that are used throughout the app.

- [x] `src/utils/formatters.ts` - ✅ Already tested
- [ ] `src/utils/errorFormatter.ts` - Error message formatting
- [ ] `src/utils/api.ts` - API utilities
- [ ] `src/utils/imagePlaceholder.ts` - Image utilities
- [ ] `src/lib/validation.ts` - Validation schemas

---

### ⚪ **Priority 5: Edge Cases & Polish** (Nice to Have)
Components that are less critical but improve UX.

- [ ] `src/components/FavouriteButton.tsx` - ✅ Already tested
- [ ] `src/components/buttons/Button.tsx` - ✅ Already tested
- [ ] `src/pages/PrivacyPolicy.tsx` - Legal page
- [ ] `src/pages/TermsOfService.tsx` - Legal page
- [ ] `src/pages/Accessibility.tsx` - Accessibility info
- [ ] `src/pages/Error.tsx` - Error boundary
- [ ] `src/app/ScrollToTop.tsx` - Scroll behavior
- [ ] `src/app/providers.tsx` - Provider setup

---

## Testing Strategy

### Unit Tests
- **Target**: Pure functions, utilities, hooks, small components
- **Tools**: Vitest, React Testing Library
- **Focus**: Logic correctness, edge cases, error handling

### Integration Tests
- **Target**: Components with multiple dependencies, API integration
- **Tools**: Vitest, React Testing Library, MSW (Mock Service Worker)
- **Focus**: Component interactions, API calls, state management

### Component Tests
- **Target**: UI components, forms, dialogs
- **Tools**: Vitest, React Testing Library, user-event
- **Focus**: Rendering, user interactions, accessibility

### Page Tests (Limited)
- **Target**: Key user flows (login, registration, admin CRUD)
- **Tools**: Vitest, React Testing Library
- **Focus**: Critical paths, not exhaustive page testing

---

## Next Steps

1. ✅ **Fixed**: ConfirmDialog accessibility warning
2. ✅ **Added**: Coverage thresholds (50% statements/lines, 70% branches/functions)
3. 🔄 **In Progress**: Writing tests for Priority 1 & 2 components
4. 📋 **Next**: Complete API layer tests
5. 📋 **Then**: Add component tests for Navigation & Forms
6. 📋 **Finally**: Add selective page tests for critical flows

---

## Coverage Goals

- **Current**: 12.73% statements/lines
- **Short-term goal**: 50% (matches threshold)
- **Long-term goal**: 70%+ overall coverage
- **Focus**: Quality over quantity - ensure critical paths are well-tested

---

## Notes

- Many pages are complex with animations and API calls - focus on testing logic, not animations
- Use MSW for API mocking in integration tests
- Mock framer-motion animations in component tests (already done in some tests)
- Test user interactions with `@testing-library/user-event`
- Prioritize accessibility in component tests
