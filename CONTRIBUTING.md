# Contributing to Bunvel

Thank you for your interest in contributing to Bunvel! We welcome contributions from the community.

## 🚀 Getting Started

1. **Fork** the repository on GitHub
2. **Clone** the project to your own machine
3. **Commit** changes to your own branch
4. **Push** your work back up to your fork
5. Submit a **Pull Request** so we can review your changes

## 🛠 Development Setup

1. Install [Bun](https://bun.sh/) (v1.0 or later)
2. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bunvel.git
   cd bunvel
   ```
3. Install dependencies:
   ```bash
   bun install
   ```
4. Start the development server:
   ```bash
   bun run dev
   ```

## 📝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- Clear, descriptive title
- Detailed steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Bun version, etc.)
- Relevant logs or screenshots
- A minimal reproduction if possible

### Suggesting Features

Feature requests are welcome! Please:

- Use a clear, descriptive title
- Provide detailed description of the proposed feature
- Explain why this feature would be useful
- Include examples of how it would work
- Reference any related issues or PRs

### Pull Requests

1. Fork the repository and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## 🔧 Code Style

- Follow the existing code style
- Use meaningful commit messages
- Keep PRs focused and limited to a single feature/bug
- Update documentation when necessary
- Add tests for new functionality

## 🧪 Testing

Run the test suite:
```bash
bun test
```

## 📚 Documentation

- Keep documentation up-to-date
- Add examples for new features
- Document any breaking changes

## 🏷️ Versioning

We use [Semantic Versioning](https://semver.org/). For the versions available, see the [tags on this repository](https://github.com/yourusername/bunvel/tags).

## 👥 Community

Join our community on [Discord/Slack/Twitter] to ask questions and discuss development.

## 📝 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

1. **Fork the repository** and create your branch from `main`
2. **Follow the development setup** instructions in the README
3. **Make your changes** following our code style
4. **Add tests** for new functionality
5. **Ensure all tests pass** with `bun test`
6. **Update documentation** as needed
7. **Commit with clear messages** following our conventions
8. **Push to your fork** and submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/bunvel.git
cd bunvel

# Install dependencies
bun install

# Start development
docker-compose up -d  # PostgreSQL + Redis
cd app && bun run dev  # Backend
cd studio && bun run dev  # Studio
```

## Code Style

- **TypeScript**: Use TypeScript for all code
- **Formatting**: We use Biome for linting and formatting
- **Naming**: Use descriptive variable names, camelCase for variables, PascalCase for types/classes
- **Comments**: Write clear comments for complex logic

Run the linter:
```bash
# Backend
cd app
bun run lint

# Studio
cd studio
bun run lint
```

## Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add OAuth2 social login support

fix(storage): resolve file upload timeout issue

docs(api): update REST API examples
```

## Project Structure

```
bunvel/
├── app/           # Elysia backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── db/          # Database & migrations
│   │   └── utils/       # Helpers
│   └── package.json
├── studio/        # Next.js admin dashboard
│   ├── app/
│   └── package.json
└── docs/          # Documentation
```

## Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for good test coverage

```bash
# Run tests
bun test

# Run with coverage
bun test --coverage
```

## Documentation

- Update relevant documentation for changes
- Add JSDoc comments for public APIs
- Update README if adding new features

## Questions?

- Open a [GitHub Discussion](https://github.com/yourusername/bunvel/discussions)
- Join our Discord (coming soon)

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
