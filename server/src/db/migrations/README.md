# Database Migrations

This directory contains Sequelize migrations for managing database schema changes.

## Migration Files

- `20240101000001-create-audit-logs.js` - Creates the audit_logs table for tracking admin actions
- `20240101000002-add-fulltext-index-services.js` - Adds full-text search index on services table

## Running Migrations

### Using Sequelize CLI

```bash
# Install Sequelize CLI globally (if not already installed)
npm install -g sequelize-cli

# Run all pending migrations
npx sequelize-cli db:migrate

# Rollback last migration
npx sequelize-cli db:migrate:undo

# Rollback all migrations
npx sequelize-cli db:migrate:undo:all
```

### Using npm scripts

```bash
# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:undo
```

## Creating New Migrations

```bash
# Generate a new migration file
npx sequelize-cli migration:generate --name migration-name

# Or using npm script
npm run migrate:create -- migration-name
```

## Migration Best Practices

1. **Always test migrations** in development before applying to production
2. **Never modify existing migrations** - create new ones instead
3. **Include both up and down** methods for rollback support
4. **Use transactions** for data migrations when possible
5. **Backup database** before running migrations in production

## Notes

- Migrations are automatically run in development mode when using `sequelize.sync()`
- In production, migrations should be run manually using Sequelize CLI
- Full-text indexes require MySQL 5.6+ with InnoDB engine

