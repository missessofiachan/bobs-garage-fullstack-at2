# bobs-garage-fullstack-at2

Fullstack starter for Bob's Garage — React + Vite frontend and Node+Express+Sequelize (MySQL) backend.

Quick setup

1. Install pnpm (if not installed):

```pwsh
npm i -g pnpm
```

2. Start a local MySQL (recommended using Docker):

```pwsh
# from repo root (docker-compose.yml present)
docker compose up -d
```

Default DB (see server/.env):

- DB name: bobs_garage
- User: app
- Password: app
- Port: 3306

3. Install dependencies and run dev:

```pwsh
pnpm install
pnpm run dev
```

Seeding the DB

The project includes a seeder that creates an initial admin user:

- email: admin@bobs-garage.com
- password: admin1234

Run the seeder from the repo root:

```pwsh
pnpm run seed
```

Or run server seeder directly:

```pwsh
pnpm -C server run seed
```

Notes

- The server uses environment variables in `server/.env`. Create or update it before running.
- In development the seeder will call `sequelize.sync()`; for production, prefer migrations.
- To make re-running the seeder safe, update `server/src/db/seeders/user.seeder.ts` to upsert rather than blindly create.

Useful scripts (root)

- `pnpm run dev` — start both server and client in dev mode
- `pnpm run build` — build server and client
- `pnpm run seed` — run DB seed (server)

For more details see `server/README.md` and `client/README.md` (if present).
