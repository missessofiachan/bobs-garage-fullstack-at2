# Bob's Garage — Client (React + Vite)

Frontend for the Full Stack AT2 portfolio. Implements public pages, auth, protected admin dashboard, CRUD for services and staff, media upload, theme, and favourites.

## Setup

1. Copy env and edit as needed

```
cp .env.example .env
```

2. Install deps

```
yarn install
```

3. Run in dev

```
yarn dev
```

Visit http://localhost:5173

## Scripts

- yarn dev — start Vite dev server
- yarn build — typecheck and build for production
- yarn preview — serve the production build
- yarn test — run unit tests (if added)

## Environment

- VITE_API_URL — Base URL of the API (e.g., http://localhost:4000/api)

## Notes

- Uses Bootstrap 5 for responsive layout, and vanilla-extract for theme tokens.
- Axios client auto-attaches JWT access token and refreshes on 401 using httpOnly refresh cookie.
- All data fetches show loading and friendly error states with retry.

## Evidence checklist (UI)

- Pages: Home, About (with staff), Services (filter/sort), Login, Register, Profile, Settings, Admin Dashboard, Admin Services/Staff/Users, 404.
- Media: Upload/replace service images and staff photos with preview/progress.
- Personalisation: Theme toggle + persisted defaults; favourites on services.
- Accessibility: Keyboard-friendly controls, labelled inputs, visible focus.

See also: ../../docs/EVIDENCE_GUIDE.md for what screenshots/videos to capture and suggested filenames (docs/evidence/...).
