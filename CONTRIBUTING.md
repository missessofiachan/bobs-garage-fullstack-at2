# Contributing to Bob's Garage

Thank you for your interest in contributing to Bob's Garage! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Celebrate diversity and different perspectives

## Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/bobs-garage-fullstack-at2.git
   cd bobs-garage-fullstack-at2
   ```

3. **Install dependencies**:
   ```bash
   yarn install
   ```

4. **Set up environment variables**:
   - Copy `server/.env.example` to `server/.env`
   - Copy `client/.env.example` to `client/.env`
   - Configure your database and API settings

5. **Set up the database**:
   ```bash
   # Using Docker (recommended)
   docker-compose -f docker/docker-compose.yml up -d
   
   # Or use local MySQL
   # Create database and configure connection
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

### Branch Naming

Use descriptive branch names:
- `feature/audit-logging` - New features
- `fix/rate-limit-issue` - Bug fixes
- `docs/update-readme` - Documentation
- `refactor/auth-middleware` - Code refactoring
- `test/add-service-tests` - Testing

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write clean, readable code
   - Follow the coding standards
   - Add tests for new features
   - Update documentation

3. **Test your changes**:
   ```bash
   # Run all tests
   yarn test
   
   # Run linter
   yarn lint
   
   # Type check
   yarn typecheck
   ```

4. **Commit your changes** (see [Commit Guidelines](#commit-guidelines))

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper types or `unknown`
- Use interfaces for object shapes
- Prefer type unions over enums where possible

### Code Style

- Use **Biome** for formatting (configured in `biome.jsonc`)
- Run `yarn format` before committing
- Follow existing code patterns and conventions

### File Organization

- **Client**: Organize by feature/domain
  - `components/` - Reusable components
  - `pages/` - Page components
  - `hooks/` - Custom React hooks
  - `utils/` - Utility functions
  - `styles/` - Styling and themes

- **Server**: Organize by layer
  - `controllers/` - Route handlers
  - `services/` - Business logic
  - `middleware/` - Express middleware
  - `routes/` - Route definitions
  - `db/models/` - Database models
  - `db/migrations/` - Database migrations

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions**: camelCase (`getUserById`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserData`)
- **Files**: Match export name (component file = component name)

### Comments

- Use JSDoc comments for public APIs
- Explain "why" not "what" in comments
- Keep comments up-to-date with code changes

## Testing

### Writing Tests

- Write tests for new features and bug fixes
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- Test both success and error cases

### Test Structure

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

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn workspace client test:watch
yarn workspace server test:watch

# Run specific test file
yarn workspace server test auth.integration.test.ts
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements
- `ci:` - CI/CD changes

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

```bash
feat(auth): add refresh token rotation

Implement automatic refresh token rotation for improved security.
Tokens are rotated on each refresh to prevent token reuse.

Closes #123

fix(api): sanitize query parameters correctly

Previously, req.query was being replaced which caused errors.
Now we modify properties in place for read-only objects.

docs: add styling guide and layout patterns

Added comprehensive styling guide covering colors, typography,
layout patterns, and animation systems.

test(services): add integration tests for search

Add tests for full-text search functionality including edge cases.
```

## Pull Request Process

1. **Update your branch**:
   ```bash
   git checkout main
   git pull upstream main
   git checkout feature/your-feature-name
   git rebase main
   ```

2. **Create Pull Request**:
   - Use clear, descriptive title
   - Fill out the PR template
   - Reference related issues
   - Add screenshots for UI changes

3. **PR Checklist**:
   - [ ] Code follows style guidelines
   - [ ] Tests pass (`yarn test`)
   - [ ] Linter passes (`yarn lint`)
   - [ ] Type checking passes (`yarn typecheck`)
   - [ ] Documentation updated
   - [ ] No console.log statements
   - [ ] No commented-out code

4. **Respond to feedback**:
   - Address review comments
   - Update PR if needed
   - Keep discussions constructive

5. **After approval**:
   - Maintainers will merge
   - Your contribution will be credited

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Ask questions in issue discussions

Thank you for contributing! 🎉

