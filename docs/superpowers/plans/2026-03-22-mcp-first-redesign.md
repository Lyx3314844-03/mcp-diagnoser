# MCP-First Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `mcp-diagnoser` into a real MCP-first single-package product with one shared service layer, stable stdio server entry point, thin CLI wrapper, cross-platform support, config auto-discovery, structured results, and dependency-aware web/Playwright extensions.

**Architecture:** Replace the split `src/` and `server/` implementations with one shared root source tree under `src/`. Core services own diagnostics, package management, discovery, platform normalization, and optional capability detection. The MCP layer exposes structured tools over stdio, while the CLI becomes a thin wrapper over the same services.

**Tech Stack:** TypeScript, Node.js, `@modelcontextprotocol/sdk`, Commander, Jest, ts-jest, execa, fs-extra

---

## Planned File Structure

### Create

- `src/bin/cli.ts`
- `src/bin/mcp-server.ts`
- `src/types/result.ts`
- `src/types/fix-plan.ts`
- `src/platform/index.ts`
- `src/platform/windows.ts`
- `src/platform/macos.ts`
- `src/platform/linux.ts`
- `src/discovery/discover-configs.ts`
- `src/discovery/client-locations.ts`
- `src/features/diagnostics/service.ts`
- `src/features/packages/service.ts`
- `src/features/web/service.ts`
- `src/features/web/capabilities.ts`
- `src/features/playwright/service.ts`
- `src/features/playwright/capabilities.ts`
- `src/mcp/tool-registry.ts`
- `src/mcp/server.ts`
- `src/mcp/tools/diagnostics.ts`
- `src/mcp/tools/packages.ts`
- `src/mcp/tools/web.ts`
- `src/cli/commands/check.ts`
- `src/cli/commands/packages.ts`
- `src/cli/commands/web.ts`
- `src/cli/formatters/json.ts`
- `tests/unit/discovery/discover-configs.test.ts`
- `tests/unit/platform/platform.test.ts`
- `tests/unit/packages/fix-plan.test.ts`
- `tests/integration/mcp/tool-registry.test.ts`
- `tests/smoke/cli-help.test.ts`
- `tests/smoke/mcp-server-start.test.ts`
- `tests/smoke/package-contents.test.ts`
- `tests/fixtures/configs/standard/.mcp.json`
- `tests/fixtures/configs/clients/cherry-studio.json`
- `tests/fixtures/configs/clients/cursor-mcp.json`
- `jest.config.cjs`

### Modify

- `package.json`
- `tsconfig.json`
- `src/index.ts`
- `src/core/diagnoser.ts`
- `src/tools/package-diagnoser.ts`
- `src/tools/browser-search.ts`
- `src/tools/web-crawler.ts`
- `src/tools/mcp-searcher.ts`
- `scripts/postinstall.js`
- `README.md`
- `README_zh.md`
- `QUICKSTART.md`
- `MCP_SERVER_GUIDE.md`

### Delete Or Deprecate After Migration

- `server/package.json`
- `server/package-lock.json`
- `server/tsconfig.json`
- `server/server.ts`
- `server/web-tools.ts`
- `server/dist/`

Deletion happens only after the new root entry points and tests are green.

## Task 1: Stabilize Build, Test, and Entry Points

**Files:**
- Create: `src/bin/cli.ts`
- Create: `src/bin/mcp-server.ts`
- Create: `jest.config.cjs`
- Test: `tests/smoke/cli-help.test.ts`
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `scripts/postinstall.js`
- Modify: `src/index.ts`

- [ ] **Step 1: Write the failing smoke test for the CLI help entry**

```ts
import { execa } from 'execa';

test('mcp-diagnoser --help exits successfully', async () => {
  const result = await execa('node', ['dist/bin/cli.js', '--help']);
  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain('mcp-diagnoser');
});
```

- [ ] **Step 2: Run the smoke test to verify it fails**

Run: `npx jest tests/smoke/cli-help.test.ts --runInBand`
Expected: FAIL because `dist/bin/cli.js` does not exist yet.

- [ ] **Step 3: Write the failing smoke test for the MCP server entry**

```ts
import { execa } from 'execa';

test('mcp-diagnoser-server starts over stdio', async () => {
  const child = execa('node', ['dist/bin/mcp-server.js'], { reject: false });
  await new Promise(resolve => setTimeout(resolve, 1000));
  child.kill();
  const result = await child;
  expect(result.stderr).toContain('stdio');
});
```

- [ ] **Step 4: Run the server smoke test to verify it fails**

Run: `npx jest tests/smoke/mcp-server-start.test.ts --runInBand`
Expected: FAIL because `dist/bin/mcp-server.js` does not exist yet.

- [ ] **Step 5: Create the new entry points and build outputs**

```ts
// src/bin/cli.ts
import '../index.js';
```

```ts
// src/bin/mcp-server.ts
import { startMcpServer } from '../mcp/server.js';

startMcpServer().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

- [ ] **Step 6: Update package scripts and bins**

```json
{
  "main": "dist/bin/cli.js",
  "bin": {
    "mcp-diagnoser": "dist/bin/cli.js",
    "mcp-diagnoser-server": "dist/bin/mcp-server.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "jest --runInBand"
  }
}
```

- [ ] **Step 7: Add Jest config for TypeScript tests**

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'js', 'json'],
};
```

- [ ] **Step 8: Run the entry-point smoke tests to verify they pass**

Run: `npx jest tests/smoke/cli-help.test.ts tests/smoke/mcp-server-start.test.ts --runInBand`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add package.json tsconfig.json jest.config.cjs scripts/postinstall.js src/bin src/index.ts tests/smoke
git commit -m "refactor: unify root CLI and MCP server entry points"
```

## Task 2: Introduce Shared Result Types and Platform Layer

**Files:**
- Create: `src/types/result.ts`
- Create: `src/types/fix-plan.ts`
- Create: `src/platform/index.ts`
- Create: `src/platform/windows.ts`
- Create: `src/platform/macos.ts`
- Create: `src/platform/linux.ts`
- Test: `tests/unit/platform/platform.test.ts`

- [ ] **Step 1: Write the failing platform normalization test**

```ts
import { getPlatformAdapter } from '../../../src/platform/index.js';

test('returns a normalized platform adapter with install hints', () => {
  const adapter = getPlatformAdapter('win32');
  expect(adapter.id).toBe('windows');
  expect(adapter.installHint('node')).toContain('Node');
});
```

- [ ] **Step 2: Run the unit test to verify it fails**

Run: `npx jest tests/unit/platform/platform.test.ts --runInBand`
Expected: FAIL because the platform layer does not exist.

- [ ] **Step 3: Implement minimal normalized result and fix-plan types**

```ts
export interface ToolResult<T> {
  ok: boolean;
  summary: string;
  data: T;
  issues: DiagnosticIssue[];
  nextActions: string[];
}
```

```ts
export interface FixAction {
  kind: 'install_package' | 'install_browser' | 'set_env' | 'update_path' | 'clear_cache' | 'manual_step';
  label: string;
  confirmRequired: boolean;
}
```

- [ ] **Step 4: Implement the platform adapters with one normalized interface**

```ts
export interface PlatformAdapter {
  id: 'windows' | 'macos' | 'linux';
  installHint(command: string): string;
}
```

- [ ] **Step 5: Run the platform unit test to verify it passes**

Run: `npx jest tests/unit/platform/platform.test.ts --runInBand`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/types src/platform tests/unit/platform/platform.test.ts
git commit -m "feat: add shared result types and platform adapters"
```

## Task 3: Add Config Discovery for Standard and Client-Specific MCP Configs

**Files:**
- Create: `src/discovery/discover-configs.ts`
- Create: `src/discovery/client-locations.ts`
- Create: `tests/fixtures/configs/standard/.mcp.json`
- Create: `tests/fixtures/configs/clients/cherry-studio.json`
- Create: `tests/fixtures/configs/clients/cursor-mcp.json`
- Test: `tests/unit/discovery/discover-configs.test.ts`

- [ ] **Step 1: Write the failing discovery test**

```ts
import { discoverConfigs } from '../../../src/discovery/discover-configs.js';

test('discovers explicit, standard, and client-specific configs with provenance', async () => {
  const results = await discoverConfigs({
    explicitPaths: ['tests/fixtures/configs/standard/.mcp.json'],
    homeDir: 'tests/fixtures/configs',
  });

  expect(results.some(result => result.sourceKind === 'explicit')).toBe(true);
  expect(results.some(result => result.clientType === 'cursor')).toBe(true);
});
```

- [ ] **Step 2: Run the discovery test to verify it fails**

Run: `npx jest tests/unit/discovery/discover-configs.test.ts --runInBand`
Expected: FAIL because discovery files do not exist.

- [ ] **Step 3: Create fixture config files**

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

- [ ] **Step 4: Implement config discovery with provenance fields**

```ts
export interface DiscoveredConfig {
  sourceKind: 'explicit' | 'standard' | 'client';
  path: string;
  clientType?: 'cursor' | 'cherry-studio' | 'unknown';
  parseStatus: 'ok' | 'error';
  serverCount: number;
}
```

- [ ] **Step 5: Run the discovery unit test to verify it passes**

Run: `npx jest tests/unit/discovery/discover-configs.test.ts --runInBand`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/discovery tests/unit/discovery tests/fixtures/configs
git commit -m "feat: add MCP config discovery with client-specific support"
```

## Task 4: Extract Shared Diagnostics Service

**Files:**
- Create: `src/features/diagnostics/service.ts`
- Modify: `src/core/diagnoser.ts`
- Test: `tests/integration/mcp/tool-registry.test.ts`

- [ ] **Step 1: Write the failing integration test for diagnostic tool wiring**

```ts
import { createToolRegistry } from '../../../src/mcp/tool-registry.js';

test('diagnostic tools are registered from shared services', () => {
  const registry = createToolRegistry();
  expect(registry.has('diagnose_environment')).toBe(true);
  expect(registry.has('diagnose_server')).toBe(true);
  expect(registry.has('diagnose_servers')).toBe(true);
});
```

- [ ] **Step 2: Run the integration test to verify it fails**

Run: `npx jest tests/integration/mcp/tool-registry.test.ts --runInBand`
Expected: FAIL because the registry does not exist yet.

- [ ] **Step 3: Move diagnostic logic into a shared service**

```ts
export class DiagnosticsService {
  async diagnoseEnvironment(): Promise<ToolResult<EnvironmentSummary>> {
    return { ok: true, summary: 'Environment scanned', data: { runtimes: [] }, issues: [], nextActions: [] };
  }
}
```

- [ ] **Step 4: Reuse current diagnosis logic instead of duplicating it**

Implementation note:
Move logic from `src/core/diagnoser.ts` into the new service or make `src/core/diagnoser.ts` an adapter over the new service. Do not keep two independent implementations.

- [ ] **Step 5: Run the integration test to verify it passes**

Run: `npx jest tests/integration/mcp/tool-registry.test.ts --runInBand`
Expected: PASS for diagnostic registrations

- [ ] **Step 6: Commit**

```bash
git add src/features/diagnostics src/core/diagnoser.ts tests/integration/mcp/tool-registry.test.ts
git commit -m "refactor: move diagnostics into shared service layer"
```

## Task 5: Extract Shared Package Service and Fix Planning

**Files:**
- Create: `src/features/packages/service.ts`
- Modify: `src/tools/package-diagnoser.ts`
- Test: `tests/unit/packages/fix-plan.test.ts`

- [ ] **Step 1: Write the failing fix-plan unit test**

```ts
import { PackagesService } from '../../../src/features/packages/service.js';

test('creates a confirm-required fix plan for missing packages', async () => {
  const service = new PackagesService();
  const plan = await service.planFix({
    missingPackages: ['@playwright/mcp'],
  });

  expect(plan.actions[0].kind).toBe('install_package');
  expect(plan.actions[0].confirmRequired).toBe(true);
});
```

- [ ] **Step 2: Run the unit test to verify it fails**

Run: `npx jest tests/unit/packages/fix-plan.test.ts --runInBand`
Expected: FAIL because the shared package service does not exist.

- [ ] **Step 3: Implement shared package diagnosis and fix planning**

```ts
export class PackagesService {
  async planFix(input: { missingPackages: string[] }): Promise<FixPlan> {
    return {
      platform: process.platform,
      riskLevel: 'medium',
      confirmRequired: true,
      actions: input.missingPackages.map((name) => ({
        kind: 'install_package',
        label: `Install ${name}`,
        confirmRequired: true,
      })),
    };
  }
}
```

- [ ] **Step 4: Make current package diagnosis code call the shared service**

Implementation note:
`src/tools/package-diagnoser.ts` becomes an adapter or helper library, not a second package workflow.

- [ ] **Step 5: Run the fix-plan unit test to verify it passes**

Run: `npx jest tests/unit/packages/fix-plan.test.ts --runInBand`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/packages src/tools/package-diagnoser.ts tests/unit/packages/fix-plan.test.ts
git commit -m "feat: add shared package service and structured fix plans"
```

## Task 6: Add Capability-Aware Web and Playwright Services

**Files:**
- Create: `src/features/web/capabilities.ts`
- Create: `src/features/web/service.ts`
- Create: `src/features/playwright/capabilities.ts`
- Create: `src/features/playwright/service.ts`
- Modify: `src/tools/browser-search.ts`
- Modify: `src/tools/web-crawler.ts`
- Modify: `src/tools/mcp-searcher.ts`

- [ ] **Step 1: Write the failing test for optional capability degradation**

```ts
import { detectWebCapabilities } from '../../../src/features/web/capabilities.js';

test('web capability detection degrades without breaking baseline startup', async () => {
  const result = await detectWebCapabilities({ forceUnavailable: true });
  expect(result.status).toBe('unavailable');
  expect(result.suggestedActions.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run the capability test to verify it fails**

Run: `npx jest tests/unit/platform/platform.test.ts tests/unit/packages/fix-plan.test.ts --runInBand`
Expected: FAIL because no capability detector exists. Replace with the actual new test path once created.

- [ ] **Step 3: Implement capability detection wrappers**

```ts
export interface CapabilityStatus {
  status: 'available' | 'degraded' | 'unavailable';
  reason?: string;
  missingDependencies: string[];
  suggestedActions: string[];
}
```

- [ ] **Step 4: Wrap current web and Playwright features behind service interfaces**

Implementation note:
Use existing search, crawl, and Playwright logic as internal helpers. The new service layer owns capability detection and structured outputs.

- [ ] **Step 5: Run the new capability test to verify it passes**

Run: `npx jest tests/unit/web/capabilities.test.ts --runInBand`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/web src/features/playwright src/tools/browser-search.ts src/tools/web-crawler.ts src/tools/mcp-searcher.ts tests/unit/web
git commit -m "feat: add capability-aware web and playwright services"
```

## Task 7: Build the MCP Tool Registry and stdio Server

**Files:**
- Create: `src/mcp/tool-registry.ts`
- Create: `src/mcp/server.ts`
- Create: `src/mcp/tools/diagnostics.ts`
- Create: `src/mcp/tools/packages.ts`
- Create: `src/mcp/tools/web.ts`
- Test: `tests/integration/mcp/tool-registry.test.ts`
- Test: `tests/smoke/mcp-server-start.test.ts`

- [ ] **Step 1: Expand the failing integration test to assert the full formal tool list**

```ts
const expectedTools = [
  'discover_configs',
  'diagnose_environment',
  'diagnose_server',
  'diagnose_servers',
  'explain_issue',
  'diagnose_package',
  'diagnose_packages',
  'check_package_managers',
  'plan_fix',
  'apply_fix',
  'web_search',
  'crawl_website',
  'search_website_content',
  'extract_website_info',
  'diagnose_playwright',
  'install_playwright_browsers',
];
```

- [ ] **Step 2: Run the integration test to verify it fails**

Run: `npx jest tests/integration/mcp/tool-registry.test.ts --runInBand`
Expected: FAIL because the formal registry is incomplete.

- [ ] **Step 3: Implement the tool registry from one authoritative list**

```ts
export function createToolRegistry() {
  return new Map<string, ToolHandler>([
    ['discover_configs', discoverConfigsTool],
    ['diagnose_environment', diagnoseEnvironmentTool],
  ]);
}
```

- [ ] **Step 4: Implement the stdio server on top of the registry**

```ts
export async function startMcpServer() {
  const server = new Server({ name: 'mcp-diagnoser', version: '3.0.0' }, { capabilities: { tools: {} } });
  // register list-tools and call-tool handlers from createToolRegistry()
}
```

- [ ] **Step 5: Run integration and smoke tests to verify they pass**

Run: `npx jest tests/integration/mcp/tool-registry.test.ts tests/smoke/mcp-server-start.test.ts --runInBand`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/mcp src/bin/mcp-server.ts tests/integration/mcp tests/smoke/mcp-server-start.test.ts
git commit -m "feat: add authoritative MCP tool registry and stdio server"
```

## Task 8: Reduce the CLI to Thin Wrappers

**Files:**
- Create: `src/cli/commands/check.ts`
- Create: `src/cli/commands/packages.ts`
- Create: `src/cli/commands/web.ts`
- Create: `src/cli/formatters/json.ts`
- Modify: `src/index.ts`
- Test: `tests/smoke/cli-help.test.ts`

- [ ] **Step 1: Write the failing CLI wrapper test**

```ts
import { execa } from 'execa';

test('CLI check command uses the shared diagnostics pipeline', async () => {
  const result = await execa('node', ['dist/bin/cli.js', 'check', '--json'], { reject: false });
  expect(result.stdout).toContain('"ok"');
});
```

- [ ] **Step 2: Run the CLI test to verify it fails**

Run: `npx jest tests/smoke/cli-help.test.ts --runInBand`
Expected: FAIL because the CLI still owns direct logic.

- [ ] **Step 3: Move command assembly into thin wrapper modules**

```ts
program.command('check').action(async () => {
  const result = await diagnosticsService.diagnoseServers();
  printJson(result);
});
```

- [ ] **Step 4: Remove duplicated logic from `src/index.ts`**

Implementation note:
`src/index.ts` should become command wiring only or be replaced entirely by `src/bin/cli.ts` plus `src/cli/commands/*`.

- [ ] **Step 5: Run the CLI smoke tests to verify they pass**

Run: `npx jest tests/smoke/cli-help.test.ts --runInBand`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/cli src/index.ts src/bin/cli.ts tests/smoke/cli-help.test.ts
git commit -m "refactor: convert CLI into thin wrappers over shared services"
```

## Task 9: Validate Package Contents and Remove Split Server Implementation

**Files:**
- Create: `tests/smoke/package-contents.test.ts`
- Modify: `package.json`
- Modify: `scripts/postinstall.js`
- Delete: `server/package.json`
- Delete: `server/package-lock.json`
- Delete: `server/tsconfig.json`
- Delete: `server/server.ts`
- Delete: `server/web-tools.ts`

- [ ] **Step 1: Write the failing package-content smoke test**

```ts
import { readFileSync } from 'fs';

test('published package exposes only the root authoritative MCP server entry', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  expect(pkg.bin['mcp-diagnoser-server']).toBe('dist/bin/mcp-server.js');
});
```

- [ ] **Step 2: Run the package-content smoke test to verify it fails if config is not final**

Run: `npx jest tests/smoke/package-contents.test.ts --runInBand`
Expected: FAIL until package metadata is finalized.

- [ ] **Step 3: Finalize package metadata and remove old split server authority**

Implementation note:
Do not delete `server/` until all root build, tool registry, and smoke tests pass. Once green, remove the old split package files and update docs and scripts to point only at the root entry points.

- [ ] **Step 4: Run smoke tests to verify package metadata and startup are correct**

Run: `npx jest tests/smoke/package-contents.test.ts tests/smoke/mcp-server-start.test.ts --runInBand`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json scripts/postinstall.js tests/smoke/package-contents.test.ts
git rm -r server
git commit -m "refactor: remove split server package and keep root build authoritative"
```

## Task 10: Align Documentation With the Real Product

**Files:**
- Modify: `README.md`
- Modify: `README_zh.md`
- Modify: `QUICKSTART.md`
- Modify: `MCP_SERVER_GUIDE.md`
- Test: `tests/integration/mcp/tool-registry.test.ts`
- Test: `tests/smoke/package-contents.test.ts`

- [ ] **Step 1: Write the failing documentation consistency assertion**

```ts
test('stable documented tools match the registry', () => {
  const documentedTools = [
    'discover_configs',
    'diagnose_environment',
    'diagnose_server',
    'diagnose_servers',
  ];
  expect(documentedTools).toEqual(expect.arrayContaining(Array.from(createToolRegistry().keys())));
});
```

- [ ] **Step 2: Run the consistency test to verify it fails or exposes drift**

Run: `npx jest tests/integration/mcp/tool-registry.test.ts --runInBand`
Expected: FAIL or expose mismatches until docs are updated.

- [ ] **Step 3: Rewrite docs to match the authoritative MCP-first product**

Implementation note:
Update:
- version and repository references
- root server entry path
- formal tool list
- permission model
- platform support
- optional capability behavior

- [ ] **Step 4: Run integration and smoke tests to verify docs no longer drift from the registry**

Run: `npx jest tests/integration/mcp/tool-registry.test.ts tests/smoke/package-contents.test.ts --runInBand`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add README.md README_zh.md QUICKSTART.md MCP_SERVER_GUIDE.md tests/integration/mcp/tool-registry.test.ts
git commit -m "docs: align documentation with the MCP-first product"
```

## Final Verification

- [ ] Run: `npm test`
Expected: all unit, integration, and smoke tests pass

- [ ] Run: `npm run build`
Expected: root `dist/` contains `bin/cli.js` and `bin/mcp-server.js`

- [ ] Run: `node dist/bin/cli.js --help`
Expected: help output shows the supported commands

- [ ] Run: `node dist/bin/mcp-server.js`
Expected: stdio server starts successfully without requiring optional heavy dependencies

- [ ] Run: `npm pack --dry-run`
Expected: package contents include the root authoritative server entry and exclude the old split `server/` package

## Notes For Execution

- Follow TDD literally for each task. Do not write production code before the failing test.
- Do not delete the old `server/` implementation until the root server entry, registry, and smoke tests are green.
- Preserve existing useful logic by moving or adapting it. Do not maintain two parallel implementations.
- Keep write-capable tools confirmation-gated at the service boundary and the MCP tool boundary.
- Make capability degradation explicit for web and Playwright features so missing optional dependencies do not look like server failure.
- If a task reveals that the file split above is wrong, update this plan before continuing.
