# setup commands

- install deps: `yarn install`
- start dev server: `yarn dev`
- start client: `yarn workspace client dev`
- build for production: `yarn build`
- run tests: `yarn test`
- format code: `yarn format`
- lint code: `yarn lint`

## code style

- Use TypeScript strict mode for type safety.
- Prefer `const` and `let` over `var`.
- Use explicit types for function parameters and return values.
- Avoid using `any`; prefer specific types or generics.
- Keep functions small and focused on a single task.
- Use descriptive variable and function names.
- Organize code into modules and folders by feature.
- Avoid magic numbers and strings; use constants or enums.
- Write comments for complex logic, but keep code self-explanatory.
- Use Biome to enforce consistent formatting and linting.
- Write unit tests for critical logic and components.
- Use async/await for asynchronous code; handle errors gracefully.
- Prefer immutable data patterns; avoid direct mutation.
- Document public APIs and components.
- Review code before merging; use pull requests for
