---
name: Bun
description: Use when building, testing, or deploying JavaScript/TypeScript applications. Reach for Bun when you need to run scripts, manage dependencies, bundle code, or test applications with a single unified toolkit.
metadata:
    mintlify-proj: bun
    version: "1.0"
---

# Bun Skill Reference

## Product Summary

Bun is an all-in-one JavaScript/TypeScript toolkit written in Rust and powered by JavaScriptCore. It replaces Node.js, npm, webpack, and Jest with a single executable. Key components:

- **Runtime**: Execute `.js`, `.ts`, `.jsx`, `.tsx` files with 4x faster startup than Node.js
- **Package Manager**: Install dependencies 25x faster than npm with `bun install`
- **Bundler**: Bundle TypeScript, JSX, React, and CSS with `bun build`
- **Test Runner**: Jest-compatible testing with `bun test`

**Key files**: `bunfig.toml` (configuration), `package.json` (scripts and dependencies), `bun.lock` (lockfile)

**Primary docs**: https://bun.com/docs

---

## When to Use

Use Bun when:

- **Running scripts**: Execute TypeScript/JSX files directly without compilation setup
- **Managing dependencies**: Install packages in existing Node.js projects (drop-in npm replacement)
- **Building applications**: Bundle frontend or full-stack apps with native support for TypeScript, JSX, CSS
- **Testing**: Write Jest-compatible tests with TypeScript support and watch mode
- **Scripting**: Run `package.json` scripts 28x faster than npm
- **Monorepos**: Manage workspaces with isolated or hoisted dependency strategies
- **Deployment**: Create single-file executables or optimize production builds

Do not use Bun for:
- Type checking (use `tsc` separately)
- Generating type declarations (use `tsc`)
- Projects requiring Node.js-specific APIs not yet implemented in Bun

---

## Quick Reference

### Essential Commands

| Task | Command |
|------|---------|
| Run a file | `bun run index.ts` or `bun index.ts` |
| Run a script | `bun run dev` (from `package.json`) |
| Install dependencies | `bun install` |
| Add a package | `bun add react` |
| Add dev dependency | `bun add -d @types/node` |
| Remove a package | `bun remove react` |
| Bundle code | `bun build ./index.tsx --outdir ./dist` |
| Run tests | `bun test` |
| Watch mode | `bun --watch run index.ts` or `bun test --watch` |
| Execute a package | `bunx cowsay "Hello"` |

### Configuration File: bunfig.toml

Place in project root alongside `package.json`. Optional; Bun works without it.

```toml
# Runtime settings
preload = ["./setup.ts"]  # Scripts to run before execution
jsx = "react"             # JSX configuration
logLevel = "warn"         # "debug" | "warn" | "error"

# Package manager
[install]
optional = true           # Install optional dependencies
dev = true                # Install dev dependencies
linker = "hoisted"        # "hoisted" or "isolated"
frozenLockfile = false    # Fail if package.json doesn't match lockfile

# Test runner
[test]
root = "./__tests__"      # Test directory
coverage = false          # Enable coverage reporting
timeout = 5000            # Per-test timeout in ms
preload = ["./setup.ts"]  # Setup files for tests

# HTTP server defaults
[serve]
port = 3000               # Default port for Bun.serve()
```

### File Conventions

- **Test files**: `*.test.ts`, `*.spec.ts`, `*_test.ts`, `*_spec.ts`
- **Lockfile**: `bun.lock` (text format, commit to version control)
- **Config**: `bunfig.toml`, `tsconfig.json`, `package.json`

---

## Decision Guidance

### When to Use Hoisted vs. Isolated Installs

| Aspect | Hoisted | Isolated |
|--------|---------|----------|
| **Use when** | Existing Node.js projects, single packages | New monorepos, strict dependency isolation |
| **node_modules layout** | Flat, shared directory | Nested per-package with symlinks |
| **Phantom dependencies** | Allowed (can import undeclared packages) | Prevented (strict isolation) |
| **Default for** | Existing projects, new single packages | New workspaces |
| **Set with** | `linker = "hoisted"` in bunfig.toml | `linker = "isolated"` in bunfig.toml |

### When to Use bun run vs. Direct Execution

| Scenario | Use |
|----------|-----|
| Running a package.json script | `bun run dev` |
| Running a file directly | `bun index.ts` (no `run` needed) |
| Running a CLI with node shebang | `bun run --bun vite` (override shebang) |
| Running system commands in scripts | `bun run` (uses system shell) |

### When to Bundle vs. Run Directly

| Scenario | Use |
|----------|-----|
| Development, single file | `bun run index.ts` |
| Production, browser code | `bun build --target browser` |
| Production, server code | `bun build --target bun` or `--target node` |
| Full-stack with HTML imports | `bun build --target bun` |
| Executable binary | `bun build --target bun --outdir ./dist` |

---

## Workflow

### 1. Initialize a Project

```bash
bun init my-app
# Choose template: Blank, React, or Library
cd my-app
```

This creates `package.json`, `tsconfig.json`, `bunfig.toml`, and a starter file.

### 2. Install Dependencies

```bash
bun install                    # Install all dependencies
bun add react                  # Add a package
bun add -d @types/react       # Add dev dependency
```

Bun creates `bun.lock` (commit this to version control).

### 3. Run Code

```bash
bun run index.ts              # Run a file
bun run dev                   # Run a script from package.json
bun --watch run index.ts      # Watch mode
```

Bun transpiles TypeScript/JSX on the fly; no build step needed for development.

### 4. Write Tests

Create `math.test.ts`:

```typescript
import { test, expect } from "bun:test";

test("2 + 2 = 4", () => {
  expect(2 + 2).toBe(4);
});
```

Run with `bun test` or `bun test --watch`.

### 5. Bundle for Production

```bash
bun build ./index.tsx --outdir ./dist --minify
```

For server code:
```bash
bun build ./server.ts --target bun --outdir ./dist
```

### 6. Verify Before Deployment

- Run tests: `bun test`
- Check types: `bunx tsc --noEmit`
- Build: `bun build ./index.tsx --outdir ./dist`
- Test bundle: `bun ./dist/index.js`

---

## Common Gotchas

### Bun Flags Must Come Before `run`

```bash
bun --watch run dev      # ✅ Correct
bun run --watch dev      # ❌ Wrong (flag passed to script)
```

### Auto-install Disabled in Production

By default, Bun auto-installs missing dependencies. Disable this in production:

```toml
[install]
auto = "disable"
```

Or use `--frozen-lockfile` in CI/CD:

```bash
bun install --frozen-lockfile
```

### Lifecycle Scripts Not Executed by Default

Bun does not run `postinstall` scripts for security. Explicitly allow them:

```json
{
  "trustedDependencies": ["esbuild", "sharp"]
}
```

### TypeScript Errors on Bun Global

If you see errors on the `Bun` global:

```bash
bun add -d @types/bun
```

Then update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "lib": ["ESNext"],
    "module": "Preserve",
    "moduleResolution": "bundler"
  }
}
```

### Bundler Does Not Type-Check

`bun build` transpiles but does not check types. Run TypeScript separately:

```bash
bunx tsc --noEmit
bun build ./index.tsx --outdir ./dist
```

### Node.js Compatibility Gaps

Not all Node.js APIs are implemented. Check [Node.js compatibility](/runtime/nodejs-compat) before using:

- `fs.watch()` (use `fs.watchFile()`)
- Some `crypto` functions
- Some `stream` APIs

### Monorepo Workspace Packages Must Have Names

In `packages/*/package.json`, always include a `name` field:

```json
{
  "name": "@myapp/utils",
  "version": "1.0.0"
}
```

### Test Files Not Found

Ensure test files match patterns:
- `*.test.ts`, `*.test.js`
- `*.spec.ts`, `*.spec.js`
- `*_test.ts`, `*_spec.ts`

Place them in the project root or subdirectories; Bun searches recursively.

---

## Verification Checklist

Before submitting work:

- [ ] Dependencies installed: `bun install` succeeds without errors
- [ ] Code runs: `bun run index.ts` (or your entry point) executes without errors
- [ ] Tests pass: `bun test` shows all tests passing
- [ ] Types check: `bunx tsc --noEmit` has no errors
- [ ] Bundle builds: `bun build ./index.tsx --outdir ./dist` succeeds
- [ ] No console errors: Check for warnings or deprecations in output
- [ ] Lockfile committed: `bun.lock` is in version control
- [ ] Scripts work: `bun run <script>` executes correctly for all package.json scripts
- [ ] Watch mode works: `bun --watch run dev` detects file changes
- [ ] Production build tested: Run bundled output to verify it works

---

## Resources

**Comprehensive navigation**: https://bun.com/docs/llms.txt

**Critical documentation pages**:
1. [Runtime](/runtime) — Execute files and scripts
2. [Package Manager](/pm/cli/install) — Install and manage dependencies
3. [Bundler](/bundler) — Bundle for production
4. [Test Runner](/test) — Write and run tests
5. [bunfig.toml](/runtime/bunfig) — Configuration reference

---

> For additional documentation and navigation, see: https://bun.com/docs/llms.txt