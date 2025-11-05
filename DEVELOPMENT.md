# Development Guide

This guide covers the development workflow, tools, and best practices for working on Bob's Garage.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Quality](#code-quality)
- [Git Workflow](#git-workflow)
- [Testing](#testing)
- [Debugging](#debugging)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- Yarn 1.22.22 (via Corepack)
- Git
- MySQL 8.0+ or Docker

### Initial Setup

1. **Clone repository**:
   ```bash
   git clone <repository-url>
   cd bobs-garage-fullstack-at2
   ```

2. **Enable Corepack**:
   ```bash
   corepack enable
   corepack prepare yarn@1.22.22 --activate
   ```

3. **Install dependencies**:
   ```bash
   yarn install
   ```

4. **Set up environment**:
   ```bash
   # Server
   cd server
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Client
   cd ../client
   cp .env.example .env
   ```

5. **Start database** (Docker):
   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```

6. **Run migrations**:
   ```bash
   yarn workspace server migrate
   ```

7. **Start development servers**:
   ```bash
   yarn dev
   ```

## Development Workflow

### Running Development Servers

**Both client and server**:
```bash
yarn dev
```

**Separately**:
```bash
# Terminal 1: Server
yarn workspace server dev

# Terminal 2: Client
yarn workspace client dev
```

### Hot Reload

- **Client**: Vite HMR automatically reloads on file changes
- **Server**: Nodemon automatically restarts on file changes

### Database Migrations

**Create migration**:
```bash
yarn workspace server migrate:create migration-name
```

**Run migrations**:
```bash
yarn workspace server migrate
```

**Rollback**:
```bash
yarn workspace server migrate:undo
```

**Check status**:
```bash
yarn workspace server migrate:status
```

## Code Quality

### Linting

**Run linter**:
```bash
yarn lint
```

**Fix automatically**:
```bash
yarn lint --fix
```

**Client only**:
```bash
yarn workspace client lint
```

**Server only**:
```bash
yarn workspace server lint
```

### Formatting

**Format code** (Biome):
```bash
yarn format
```

**Check formatting**:
```bash
yarn format --check
```

### Type Checking

**Check all TypeScript**:
```bash
yarn typecheck
```

**Client only**:
```bash
yarn workspace client typecheck
```

**Server only**:
```bash
yarn workspace server typecheck
```

### Pre-commit Checks

Before committing, ensure:
- [ ] `yarn lint` passes
- [ ] `yarn format` is applied
- [ ] `yarn typecheck` passes
- [ ] Tests pass (if applicable)

## Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch (if used)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation
- `refactor/*` - Code refactoring

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

**Examples**:
```bash
feat(auth): add refresh token rotation
fix(api): sanitize query parameters correctly
docs: add styling guide
refactor(middleware): simplify rate limiting logic
```

### Pull Requests

1. Create feature branch
2. Make changes and commit
3. Push to remote
4. Create PR with:
   - Clear title
   - Description of changes
   - Reference related issues
   - Screenshots for UI changes

## Testing

### Running Tests

**All tests**:
```bash
yarn test
```

**Client tests**:
```bash
yarn workspace client test
```

**Server tests**:
```bash
yarn workspace server test
```

**Watch mode**:
```bash
yarn workspace client test:watch
yarn workspace server test:watch
```

**Specific file**:
```bash
yarn workspace server test auth.integration.test.ts
```

### Writing Tests

**Integration Tests**:
- Test API endpoints
- Use test database
- Test authentication flows
- Test error cases

**Unit Tests**:
- Test utility functions
- Test business logic
- Test components (if applicable)

**Test Structure**:
```typescript
describe('Feature Name', () => {
  describe('when condition', () => {
    it('should do something', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Debugging

### Client Debugging

**React DevTools**:
- Install browser extension
- Inspect component tree
- View Redux state
- Check React Query cache

**Browser DevTools**:
- Console for errors
- Network tab for API requests
- Application tab for localStorage

**VS Code Debugging**:
```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Debug Client",
  "url": "http://localhost:5173",
  "webRoot": "${workspaceFolder}/client"
}
```

### Server Debugging

**Console Logging**:
```typescript
import { winstonLogger } from './config/winston';

winstonLogger.debug('Debug message', { data });
winstonLogger.info('Info message');
winstonLogger.warn('Warning message');
winstonLogger.error('Error message', { error });
```

**Logs Location**:
- `server/logs/combined.log` - All logs
- `server/logs/error.log` - Errors only
- `server/logs/api-requests.log` - API requests

**VS Code Debugging**:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Server",
  "runtimeExecutable": "yarn",
  "runtimeArgs": ["workspace", "server", "dev"],
  "console": "integratedTerminal",
  "skipFiles": ["<node_internals>/**"]
}
```

### Database Debugging

**Sequelize Logging**:
- Queries logged in development
- Check `server/logs/` for slow queries
- Use `SLOW_QUERY_THRESHOLD_MS` to configure

**Query Performance**:
```bash
# Check slow query logs
tail -f server/logs/combined.log | grep "Slow query"
```

## Common Tasks

### Adding a New API Endpoint

1. **Create route** (`server/src/routes/v1/index.ts`):
   ```typescript
   r.get('/new-endpoint', requireAuth, Controller.handler);
   ```

2. **Create controller** (`server/src/controllers/`):
   ```typescript
   export async function handler(req: Request, res: Response) {
     // Implementation
   }
   ```

3. **Add validation** (if needed):
   ```typescript
   import { validateBody } from '../middleware/validate';
   r.post('/endpoint', validateBody(schema), Controller.handler);
   ```

4. **Add to service** (if business logic):
   ```typescript
   // server/src/services/
   export async function businessLogic() {
     // Implementation
   }
   ```

### Adding a New Page

1. **Create page component** (`client/src/pages/`):
   ```typescript
   export default function NewPage() {
     return <div>Content</div>;
   }
   ```

2. **Add route** (`client/src/app/App.tsx`):
   ```typescript
   const NewPage = lazy(() => import('../pages/NewPage'));
   
   <Route path="/new-page" element={<NewPage />} />
   ```

3. **Add navigation** (if needed):
   ```typescript
   <Nav.Link as={Link} to="/new-page">New Page</Nav.Link>
   ```

### Adding a New Database Model

1. **Create model** (`server/src/db/models/`):
   ```typescript
   @Table({ tableName: 'new_table' })
   export class NewModel extends Model {
     @PrimaryKey
     @Column(DataType.INTEGER)
     declare id: number;
     // ... more fields
   }
   ```

2. **Create migration**:
   ```bash
   yarn workspace server migrate:create create-new-table
   ```

3. **Write migration** (`server/src/db/migrations/`):
   ```typescript
   await queryInterface.createTable('new_table', {
     id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
     // ... more fields
   });
   ```

4. **Run migration**:
   ```bash
   yarn workspace server migrate
   ```

### Adding a New Component

1. **Create component** (`client/src/components/`):
   ```typescript
   interface Props {
     // Props definition
   }
   
   export default function NewComponent({ prop }: Props) {
     return <div>Component content</div>;
   }
   ```

2. **Add styles** (if needed):
   ```typescript
   import { style } from '@vanilla-extract/css';
   
   const componentStyle = style({
     // Styles
   });
   ```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :4000  # Server
lsof -i :5173  # Client

# Kill process
kill -9 <PID>
```

### Database Connection Issues

1. Check database is running
2. Verify credentials in `.env`
3. Check connection string format
4. Test connection: `mysql -u user -p database`

### Module Not Found

```bash
# Clear and reinstall
rm -rf node_modules
yarn install
```

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf server/dist client/dist
yarn typecheck
```

### Build Failures

```bash
# Clear all caches
rm -rf node_modules client/dist server/dist
yarn install
yarn build
```

### Migration Issues

```bash
# Check migration status
yarn workspace server migrate:status

# Rollback if needed
yarn workspace server migrate:undo

# Check database directly
mysql -u user -p database
SHOW TABLES;
```

## Useful Commands

### Development

```bash
yarn dev              # Start both servers
yarn build            # Build for production
yarn lint             # Lint code
yarn format           # Format code
yarn typecheck        # Type check
yarn test             # Run tests
```

### Database

```bash
yarn workspace server migrate        # Run migrations
yarn workspace server migrate:undo   # Rollback
yarn workspace server migrate:status # Check status
yarn workspace server seed           # Seed database
```

### Server

```bash
yarn workspace server dev       # Development mode
yarn workspace server build    # Build
yarn workspace server start    # Production mode
```

### Client

```bash
yarn workspace client dev      # Development server
yarn workspace client build    # Build
yarn workspace client preview  # Preview build
```

---

For more information, see:
- [README.md](README.md) - Main documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture overview

