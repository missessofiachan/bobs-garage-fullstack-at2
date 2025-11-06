# 🎯 Easy DRY Wins - Frontend

This document identifies easy wins for improving DRY (Don't Repeat Yourself) principles in the frontend codebase.

## 🔥 High Priority - Easy Wins

### 1. **Extract `extractFieldErrors` utility function**
**Location:** `client/src/pages/Register.tsx` (lines 27-56)

**Issue:** The `extractFieldErrors` function is defined locally in Register.tsx but could be reused across multiple forms.

**Solution:** Move to `client/src/utils/errorFormatter.ts` and export it.

**Impact:** 
- Can be reused in Login, ForgotPassword, Contact, Profile, and admin forms
- Centralizes error extraction logic
- Makes testing easier

**Files affected:**
- `client/src/pages/Register.tsx` - Remove local function, import from utils
- `client/src/utils/errorFormatter.ts` - Add function
- Other form pages can use it too

---

### 2. **Create reusable error handling hook**
**Location:** Multiple files (Register, Login, ForgotPassword, Profile, Admin pages)

**Issue:** The pattern `const { message, requestId } = formatErrorMessageWithId(error); setErr(message); notify({ body: message, variant: "danger", requestId });` is repeated ~15+ times.

**Solution:** Create a hook like `useErrorHandler()` that encapsulates this pattern.

**Example:**
```typescript
// client/src/hooks/useErrorHandler.ts
export function useErrorHandler() {
  const { notify } = useToast();
  
  return useCallback((error: unknown, setError?: (msg: string) => void) => {
    const { message, requestId } = formatErrorMessageWithId(error);
    if (setError) setError(message);
    notify({ body: message, variant: "danger", requestId });
  }, [notify]);
}
```

**Impact:**
- Reduces ~3 lines to 1 line per error handler
- Ensures consistent error handling
- ~15+ locations can benefit

**Files affected:**
- `client/src/pages/Register.tsx`
- `client/src/pages/Login.tsx`
- `client/src/pages/ForgotPassword.tsx`
- `client/src/pages/Profile.tsx`
- `client/src/pages/Admin/ServicesAdmin.tsx`
- `client/src/pages/Admin/UsersAdmin.tsx`
- `client/src/pages/Admin/StaffAdmin.tsx`
- `client/src/components/FavouriteButton.tsx`

---

### 3. **Extract animation constants**
**Location:** Multiple files (Home, Services, Staff, Contact, About, ServiceDetail, Favorites)

**Issue:** `fadeInUp` and `staggerContainer` animation objects are duplicated across 7+ files.

**Solution:** Create `client/src/utils/animations.ts` with shared animation constants.

**Example:**
```typescript
// client/src/utils/animations.ts
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
```

**Impact:**
- Single source of truth for animations
- Easy to update animation timing globally
- ~7+ files can use shared constants

**Files affected:**
- `client/src/pages/Home.tsx`
- `client/src/pages/Services.tsx`
- `client/src/pages/Staff.tsx`
- `client/src/pages/Contact.tsx`
- `client/src/pages/About.tsx`
- `client/src/pages/ServiceDetail.tsx`
- `client/src/pages/Favorites.tsx`

---

### 4. **Create AuthCardLayout component**
**Location:** Register.tsx, Login.tsx, ForgotPassword.tsx

**Issue:** All three pages have nearly identical Card layout structure with motion animations:
- Same Row/Col structure
- Same Card with shadow-sm
- Same motion.div wrapper with scale animation
- Same header structure with icon and title
- Same error alert pattern

**Solution:** Create a reusable `AuthCardLayout` component.

**Example:**
```typescript
// client/src/components/layouts/AuthCardLayout.tsx
interface AuthCardLayoutProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  error?: string;
  children: ReactNode;
  footer?: ReactNode;
}
```

**Impact:**
- Reduces ~50 lines per page to ~10 lines
- Ensures consistent auth page styling
- 3 pages benefit immediately

**Files affected:**
- `client/src/pages/Register.tsx`
- `client/src/pages/Login.tsx`
- `client/src/pages/ForgotPassword.tsx`

---

### 5. **Enhance useForm hook to handle Zod validation**
**Location:** Register.tsx, Login.tsx

**Issue:** Register and Login both manually handle Zod validation errors with similar patterns. The existing `useForm` hook doesn't handle Zod validation errors well.

**Solution:** Enhance `useForm` to accept Zod schemas and handle validation automatically.

**Impact:**
- Register and Login can use the hook instead of manual validation
- Consistent validation error handling
- Reduces code duplication

**Files affected:**
- `client/src/hooks/useForm.ts` - Enhance
- `client/src/pages/Register.tsx` - Simplify
- `client/src/pages/Login.tsx` - Simplify

---

## 📊 Medium Priority

### 6. **Extract form field error display pattern**
**Location:** Register.tsx (lines 166-175, 201-210)

**Issue:** The pattern for displaying field errors with Form.Control.Feedback is repeated.

**Solution:** Enhance `TextField` component or create `FormFieldWithError` wrapper.

**Impact:**
- Cleaner form code
- Consistent error display

---

### 7. **Create useAsyncOperation hook**
**Location:** Profile.tsx, Contact.tsx, and others

**Issue:** The pattern of `loading` state + `try/catch` + `notify` is repeated.

**Solution:** Create a hook that wraps async operations with loading and error handling.

**Impact:**
- Reduces boilerplate in async operations
- Consistent error handling

---

## 📈 Summary

**Total Easy Wins:**
- **High Priority:** 5 items
- **Medium Priority:** 2 items

**Estimated Impact:**
- ~200+ lines of code can be reduced
- ~20+ files can benefit
- Improved maintainability and consistency

**Recommended Order:**
1. Extract animation constants (#3) - Easiest, no dependencies
2. Extract `extractFieldErrors` (#1) - Simple utility extraction
3. Create error handling hook (#2) - High impact, moderate effort
4. Create AuthCardLayout (#4) - High visual impact
5. Enhance useForm hook (#5) - Requires more testing

---

## 🧪 Testing Considerations

When implementing these changes:
- Ensure existing tests still pass
- Add tests for new utility functions/hooks
- Test error handling paths
- Verify animations still work correctly

