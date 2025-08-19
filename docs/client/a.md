# Bob’s Garage Client – Requirements & Implementation Plan

> **Repo**: `bobs-garage-fullstack`
> **App**: `client/` – React + TypeScript SPA that consumes the API you’re building.
> **Scope**: Everything required from the **client side** to satisfy the project brief and AT2 (UI/UX, layouts, secure interactions, evidence).

---

## 1) Tech Stack & Libraries

* **Runtime/Build**: Vite + React 18 + TypeScript
* **Routing**: React Router v6+ (nested routes & loaders where useful)
* **Data**: TanStack Query (React Query) for server state, optimistic updates
* **HTTP**: Axios (with interceptors) or fetch wrapper
* **Forms & Validation**: React Hook Form + Zod
* **State (client-only)**: Zustand (lightweight) or Redux Toolkit if you prefer
* **UI**: Tailwind CSS + shadcn/ui (Radix UI primitives), lucide-react icons
* **Tables**: @tanstack/react-table (for admin lists)
* **Toast/Feedback**: sonner or shadcn/ui toast
* **Auth**: JWT access token in memory (Zustand) + silent refresh flow
* **i18n (optional)**: react-i18next
* **Accessibility**: eslint-plugin-jsx-a11y, Radix primitives, keyboard traps tested
* **Testing**: Vitest + Testing Library + MSW (API mocks), Playwright (E2E)
* **Quality**: ESLint + Prettier, Husky + lint-staged, TypeScript strict

### Install (client)

```bash
# create
pnpm create vite client --template react-ts
cd client

# deps
pnpm add react-router-dom @tanstack/react-query axios zod react-hook-form zustand
pnpm add @tanstack/react-table @radix-ui/react-slot class-variance-authority clsx lucide-react sonner
pnpm add -D tailwindcss postcss autoprefixer @types/node eslint-plugin-jsx-a11y vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom msw playwright @playwright/test prettier eslint-config-prettier husky lint-staged
```

### Tailwind setup

```bash
pnpm dlx tailwindcss init -p
```

`tailwind.config.js` should include `./index.html`, `./src/**/*.{ts,tsx}` and shadcn paths if used.

---

## 2) Project Structure

```
client/
├─ src/
│  ├─ main.tsx                 # App bootstrap, QueryClientProvider, RouterProvider
│  ├─ app/
│  │  ├─ routes.tsx            # route config
│  │  ├─ providers.tsx         # wrappers (AuthProvider, ThemeProvider, QueryClientProvider)
│  │  └─ store.ts              # Zustand slices (auth ui prefs)
│  ├─ api/
│  │  ├─ axios.ts              # axios instance + interceptors (403/401 refresh flow)
│  │  ├─ hooks/
│  │  │  ├─ useAuth.ts         # login/logout/register/refresh
│  │  │  ├─ useServices.ts     # list/create/update/delete
│  │  │  └─ useStaff.ts
│  │  └─ types.ts              # shared DTOs (aligned with server OpenAPI)
│  ├─ components/
│  │  ├─ ui/                   # shadcn components
│  │  ├─ layout/               # Navbar, Sidebar, Footer, ProtectedRoute
│  │  ├─ cards/                # ServiceCard, StaffCard
│  │  └─ forms/                # RHF+Zod forms (ServiceForm, StaffForm, LoginForm)
│  ├─ pages/
│  │  ├─ Home.tsx
│  │  ├─ Services.tsx
│  │  ├─ Staff.tsx
│  │  ├─ About.tsx (optional)
│  │  ├─ Login.tsx / Register.tsx
│  │  ├─ Admin/
│  │  │  ├─ Dashboard.tsx
│  │  │  ├─ ServicesAdmin.tsx
│  │  │  ├─ StaffAdmin.tsx
│  │  │  └─ UsersAdmin.tsx
│  │  └─ Error.tsx             # route error boundary
│  ├─ lib/
│  │  ├─ constants.ts
│  │  ├─ helpers.ts
│  │  └─ auth.ts               # role helpers, token utils
│  ├─ styles/
│  │  └─ globals.css
│  ├─ assets/                  # images (non-user uploads)
│  └─ vite-env.d.ts
├─ .env.example
├─ index.html
└─ package.json
```

---

## 3) Environment & Config

`.env.example`:

```dotenv
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_APP_NAME=Bobs Garage
VITE_LOG_LEVEL=debug
```

Never commit `.env`. Use `import.meta.env.VITE_*` in code. Allow override in deploy (Netlify/Vercel/nginx).

---

## 4) Information Architecture & Routes

**Public**

* `/` Home: hero, quick intro, CTA to Services
* `/services` Services catalogue (cards, price, description)
* `/services/:id` Service detail (optional)
* `/staff` Meet the team (images, roles, bios)
* `/login`, `/register`
* `/404` Not found

**Protected (role-gated)**

* `/admin` Dashboard (requires `admin` role)

  * `/admin/services` CRUD list + forms
  * `/admin/staff` CRUD list + forms
  * `/admin/users` (optional per brief) CRUD list + forms

**Guards**

* `ProtectedRoute`: redirects unauthenticated users to `/login`
* `RequireRole('admin')`: hides/blocks admin routes and admin UI controls

---

## 5) Auth Flow (client perspective)

* **Login** → POST `/auth/login` → store **accessToken** in memory (Zustand) and optionally in `sessionStorage` (not localStorage) if “Remember me”.
* **Refresh** → a response interceptor traps **401**; call `/auth/refresh` to rotate tokens, then retry the original request. Prefer server-set **HttpOnly cookie** for refresh if supported; otherwise store refresh token in memory only and request new pair when tab is alive.
* **Logout** → call `/auth/logout`, clear tokens, invalidate React Query cache.
* **Role-based UI**: derive `role` from decoded access token claims or user profile endpoint; render admin controls conditionally.

> Avoid storing access tokens in localStorage to reduce XSS risk. Use in-memory state + short TTL + refresh rotation.

---

## 6) Data Fetching Patterns (React Query)

* **Queries**: `useQuery(['services', page, filters], fetchServices)`
* **Mutations**: `useMutation(createService, { onSuccess: invalidate(['services']) })`
* **Optimistic updates** for quick UI feedback; rollback on error.
* **Error/Loading** UI states handled via reusable skeletons and `<QueryErrorResetBoundary>`.

```ts
// api/hooks/useServices.ts (sketch)
export function useServices(params) {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => axios.get('/services', { params }).then(r => r.data.data),
  });
}
```

---

## 7) Forms & Validation

* Use **React Hook Form** + **Zod** resolver.
* Client-side validation mirrors server Joi rules to prevent UX mismatch.
* Show field-level messages, disable submit while pending, show success toasts.

```ts
const schema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  price_cents: z.coerce.number().int().min(0),
  is_active: z.boolean().default(true)
});
```

---

## 8) UI/UX Guidelines

* **Design system**: Tailwind scales + shadcn/ui components (Button, Card, Dialog, Form, Input, Label, Table, Toast)
* **Layout**: responsive grid, mobile-first, 12-col at lg, use container widths
* **Navigation**: sticky top nav with clear CTA; breadcrumbs in admin
* **Tables**: pagination, sorting, search/filter for admin lists
* **Empty states**: helpful CTAs (e.g., “Add your first service”)
* **Feedback**: non-blocking toasts; modals for destructive actions
* **Theme (optional)**: light/dark via `class="dark"` + Tailwind
* **Images**: lazy load with modern `<img loading="lazy">`
* **Performance**: route-level code splitting; prefetch critical queries

---

## 9) Accessibility (WCAG 2.1 AA)

* Keyboard navigable menus, modals, and tables
* Form labels, described-by errors, focus outlines **on**
* Color contrast ≥ 4.5:1
* Skip-to-content link, semantic headings
* Screen-reader only texts for icons
* Run `@axe-core/react` in dev or use Lighthouse a11y checks

---

## 10) Security Considerations (Client)

* Never trust client validation alone—server validates again
* Avoid `dangerouslySetInnerHTML`; sanitize any external HTML
* Token handling: in-memory access token; refresh via secure cookie if possible
* CSRF: if refresh cookie is used, include CSRF header (double submit or custom header)
* CORS: client points at `VITE_API_BASE_URL` (server restricts origins)
* Prevent open redirects; validate `next` query params
* Do not log PII to console

---

## 11) Error Handling

* Global **ErrorBoundary** for render errors with a friendly fallback
* Route error elements for React Router (`<Route errorElement={<Error/>} />`)
* Axios interceptor → map API envelope `{success:false,error}` to toast + form errors
* Special handling for 401/403 (auth) and 422 (validation)

---

## 12) Pages & Components (Minimum to Meet Brief)

**Public pages**

* **Home**: value prop + quick links to Services/Staff
* **Services**: card grid with price; filter by active
* **ServiceDetail** (optional): show details
* **Staff**: card grid (Bob, mechanics, receptionist per brief)
* **Login/Register**: forms with validation

**Admin**

* **Dashboard**: stats (counts), quick actions
* **ServicesAdmin**: table + create/edit dialog (RHF+Zod)
* **StaffAdmin**: table + create/edit dialog
* **UsersAdmin** (optional): table + role select (admin only)

**Shared components**

* Navbar, Footer, ProtectedRoute, ConfirmDialog, DataTable, FormField wrapper, Skeletons, Toast

---

## 13) Testing Strategy & Evidence (AT2)

* **Unit/Component**: Vitest + Testing Library (forms, components, guards).
* **Integration**: MSW to mock API; verify happy/error paths.
* **E2E**: Playwright: login flow, protected route guard, Services CRUD (admin).
* **Cross-browser**: Playwright on Chromium + Firefox + WebKit; include screenshots/videos.
* **Lighthouse**: record Performance, Accessibility, Best Practices, SEO.
* **Evidence**: screenshots of admin CRUD, 404 page, protected route redirect, form validation messages. Capture before/after states and Postman alongside to link to backend.

Example scripts:

```jsonc
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "lint": "eslint ."
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,css,md}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## 14) API Integration Contract

* Base URL: `VITE_API_BASE_URL` (e.g., `http://localhost:4000/api/v1`)
* **Auth endpoints**: `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`
* **Resources**: `/services`, `/staff`, `/users` (admin only)
* **Envelope**: `{ success, data, error, meta }`
* **Errors**: 401 (unauthenticated), 403 (not allowed), 404, 422 (validation), 500
* **Pagination**: `?page=&limit=`; respond to `meta` for UI table controls

Axios instance (`src/api/axios.ts`) should:

* Attach `Authorization: Bearer <accessToken>`
* On 401, call refresh once → retry original request; if fails, logout

---

## 15) Runbook (Dev)

```bash
# 1) Install
cd client && pnpm install

# 2) Configure env
cp .env.example .env && edit .env

# 3) Start dev
pnpm dev   # http://localhost:5173

# 4) Point to API
# Ensure server is running at VITE_API_BASE_URL; login to unlock Admin pages
```

---

## 16) CI/CD & Deploy

* **CI**: GitHub Actions – install, lint, build, unit tests, upload Playwright artifacts
* **Preview**: Vercel/Netlify (set ENV); protect `/admin` with proper API auth
* **Cache**: enable React Query cache persistence if needed (localStorage) for public data only
* **Monitoring**: Sentry (optional) for client errors

---

## 17) Deliverables Checklist (maps to AT2)

**UI/Layouts & Advanced UI (ICTWEB519, ICTWEB513, ICTPRG535)**

* [ ] Responsive layout with header/nav/footer
* [ ] Services & Staff public pages meet brief (cards, images, text)
* [ ] Admin CRUD screens implemented with proper forms & validation
* [ ] Role-gated navigation and protected routes
* [ ] Error/empty/loading states and 404 page
* [ ] Accessibility checks (keyboard nav, labels, contrast)

**Security & Integration**

* [ ] JWT auth wiring (login/refresh/logout)
* [ ] Authorization guard for admin features
* [ ] No secrets in client repo; `.env` used
* [ ] API error handling and toasts

**Testing & Debugging**

* [ ] Unit & integration tests with MSW
* [ ] E2E Playwright: login + Services CRUD
* [ ] Cross-browser screenshots
* [ ] Lighthouse reports captured

**Evidence for Submission**

* [ ] Screenshots of CRUD from the UI
* [ ] Screenshot/video of protected route redirect
* [ ] Error/404 examples
* [ ] Link to OpenAPI docs shown in UI (optional “API Docs” link)

---

## 18) Example Snippets

**Protected Route**

```tsx
export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthed = useAuthStore(s => !!s.accessToken);
  return isAuthed ? children : <Navigate to="/login" replace />;
}
```

**Service Form (RHF + Zod)**

```tsx
const schema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  price_cents: z.coerce.number().int().min(0),
  is_active: z.boolean().default(true),
});

export function ServiceForm({ onSubmit, defaultValues }) {
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        {/* more fields... */}
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
```

**React Query Hook**

```ts
export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => axios.post('/services', payload).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });
}
```

---

## 19) Visual Polish & Content

* Use high-quality imagery (webp) with alt text for Services & Staff
* Consistent spacing, 8pt scale, large tap targets
* Typographic hierarchy via Tailwind utilities
* Skeletons while loading, shimmer placeholders for lists

---

## 20) Alignment Notes

* Mirrors server routes and envelope; uses JWT and role-gated admin tools.
* Demonstrates advanced UI patterns (tables, dialogs, optimistic updates).
* Collects the **evidence** required in AT2 (screenshots, cross-browser, protected routes, CRUD, 404).

> This document is client-side only; the server-side requirements are in its companion doc.
