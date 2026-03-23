# MCP Diagnoser MCP-First Redesign

Date: 2026-03-22
Status: Proposed
Scope: MCP-first single-package redesign for a cross-platform diagnostic, package-management, search, crawl, and Playwright MCP server

## Summary

This redesign turns `mcp-diagnoser` into a real MCP-first product for general MCP clients. The MCP server becomes the primary interface. The CLI remains available, but only as a thin wrapper over the same core services.

The redesign keeps three formal capability groups:

- Diagnostics
- Package management
- Web and browser extensions

The first stable version must support Windows, macOS, and Linux as formally supported platforms. Heavy dependencies such as browser tooling and crawl/search integrations remain available, but are enabled on demand and must not block baseline server startup.

## Problems To Fix

The current project has drifted across multiple layers:

- CLI logic, MCP server logic, and published build artifacts do not come from one source of truth.
- The root package and the `server/` subtree have split implementations and build paths.
- Documentation claims tools and entry points that are not consistently implemented.
- Build output can be stale even when the source tree has moved on.
- Optional capabilities can affect confidence in the whole package because capability detection is not modeled explicitly.

These problems make the project look larger than it really is while reducing trust in packaging, docs, and MCP compatibility.

## Goals

- Make the MCP server the primary product surface.
- Keep a CLI for local inspection and manual troubleshooting, but route it through the same core logic.
- Support Windows, macOS, and Linux as first-class platforms.
- Auto-discover standard MCP configs and common client-specific config files.
- Keep diagnostics, package management, search, crawl, and Playwright capabilities.
- Make install and fix actions explicit and opt-in.
- Return structured results suitable for general MCP clients.
- Make build, packaging, testing, and documentation come from one source of truth.

## Non-Goals

- General-purpose shell execution through MCP.
- A remote HTTP service as the primary product shape.
- Unbounded fully automatic repair without explicit confirmation.
- Client-specific behavior hardcoded for every niche MCP client.
- Broad workflow orchestration beyond diagnostics, package handling, search, crawl, and Playwright support.

## Product Shape

The project becomes a single package with one shared core and two official entry points:

- `mcp-diagnoser`
- `mcp-diagnoser-server`

The server uses stdio and targets general MCP client compatibility. The CLI is retained for local use and debugging, but it must not own any business logic that is absent from the MCP server.

## Architecture

### Source Layout

Recommended source layout:

```text
src/
  bin/
    cli.ts
    mcp-server.ts
  core/
    services/
    models/
    validation/
  discovery/
    standard-configs.ts
    client-configs.ts
  platform/
    windows.ts
    macos.ts
    linux.ts
    index.ts
  features/
    diagnostics/
    packages/
    web/
    playwright/
  mcp/
    tools/
    schemas/
    adapters/
  cli/
    commands/
    formatters/
  types/
```

### Responsibilities

- `src/core`
  Pure business logic. No CLI formatting. No MCP protocol handling.
- `src/discovery`
  Finds and parses MCP config sources from standard locations and known client-specific locations.
- `src/platform`
  Encodes platform-specific command checks, path rules, install suggestions, and permission hints.
- `src/features/diagnostics`
  Server diagnostics, environment checks, runtime checks, issue synthesis.
- `src/features/packages`
  Package manager detection, package diagnosis, fix planning, controlled package actions.
- `src/features/web`
  Search, crawl, and website analysis tools with capability detection and graceful degradation.
- `src/features/playwright`
  Playwright diagnosis and browser installation support, also with explicit capability detection.
- `src/mcp`
  Maps core services into MCP tools, input schemas, and structured outputs.
- `src/cli`
  Thin wrappers and human-readable output built on top of the same service layer.
- `src/bin`
  Stable startup entry points only.

### Source Of Truth Rule

There must be exactly one source of truth for:

- tool definitions
- result types
- environment checks
- config discovery
- fix planning

No duplicated logic between CLI and MCP layers is allowed.

## Capability Groups

### Stable Core

The baseline installation must start and support these capabilities without heavy optional tooling:

- configuration discovery
- environment diagnosis
- single-server diagnosis
- multi-server diagnosis
- package diagnosis
- package-manager detection
- fix-plan generation

### Optional Extensions

The following remain first-class capabilities, but are dependency-aware and may degrade independently:

- web search
- website crawl
- website content search
- website information extraction
- Playwright diagnosis
- Playwright browser installation

These capabilities must not prevent server startup when their dependencies are missing.

## MCP Tool Catalog

The formal MCP tool set for the redesigned product is:

### Diagnostics

- `discover_configs`
- `diagnose_environment`
- `diagnose_server`
- `diagnose_servers`
- `explain_issue`

### Package Management

- `diagnose_package`
- `diagnose_packages`
- `check_package_managers`
- `plan_fix`
- `apply_fix`

### Web And Browser

- `web_search`
- `crawl_website`
- `search_website_content`
- `extract_website_info`
- `diagnose_playwright`
- `install_playwright_browsers`

## Tool Behavior Rules

- Read-only tools must be safe by default.
- Write-capable tools must require explicit confirmation, such as `confirm: true`.
- `apply_fix` must accept structured fix actions or a structured fix plan. It must not accept arbitrary shell text.
- Optional extension tools must return capability-aware results rather than crashing the whole server.
- MCP outputs must prioritize structured data rather than terminal-oriented formatting.

## Configuration Discovery

Configuration discovery works in this order:

1. Explicit user-provided path
2. Standard MCP config locations
3. Common client-specific MCP config locations

Each discovery hit returns:

- source kind
- path
- client type if known
- parse status
- discovered servers
- warnings or conflicts

Discovery must preserve provenance. The server should not flatten all configs into an opaque merged blob without reporting where each server entry came from.

## Cross-Platform Support

Windows, macOS, and Linux are all first-class targets.

Platform differences must be modeled in the platform layer, including:

- executable probing
- path conventions
- package manager suggestions
- permission guidance
- shell differences
- install command recommendations

The platform layer returns normalized data so the feature and MCP layers do not contain scattered platform conditionals.

## Permission Model

The permission model has two tiers:

- safe read-only diagnosis
- explicit write or install actions

Read-only actions:

- discover configs
- inspect runtimes
- inspect commands
- inspect packages
- inspect servers
- plan fixes

Explicit write actions:

- install missing packages
- modify environment configuration when supported
- install Playwright browsers
- execute approved fix actions

Any write action must:

- require explicit confirmation
- declare intended effect
- return a structured execution summary
- surface partial failures clearly

## Capability Detection

Heavy features use explicit capability detection and return one of:

- `available`
- `degraded`
- `unavailable`

Each capability result should include:

- `status`
- `reason`
- `missingDependencies`
- `suggestedActions`

This avoids a common failure mode where one optional dependency makes the whole MCP server look broken.

## Data Model

### DiagnosticIssue

Recommended structure:

```json
{
  "id": "missing-command",
  "severity": "error",
  "category": "installation",
  "message": "Command \"npx\" was not found",
  "resource": {
    "kind": "server",
    "name": "playwright"
  },
  "evidence": [],
  "suggestion": "Install Node.js or ensure npx is on PATH"
}
```

### CapabilityStatus

Represents whether a feature group or tool can execute fully:

- `available`
- `degraded`
- `unavailable`

### FixAction

A structured repair action, not raw shell:

- `install_package`
- `install_browser`
- `set_env`
- `update_path`
- `clear_cache`
- `manual_step`

### FixPlan

A sequence of structured actions with metadata:

- platform
- risk level
- confirmation required
- expected side effects
- action list

### ToolResult

All MCP tools should return a consistent top-level shape:

- `ok`
- `summary`
- `data`
- `issues`
- `nextActions`

## Error Model

Errors are classified into:

- `user_error`
- `environment_error`
- `execution_error`
- `internal_error`

Structured error payload:

- `code`
- `message`
- `details`
- `retryable`
- `suggestedActions`

The server should avoid exposing raw stack traces to normal MCP clients. Internal details can still be logged for local debugging.

## Build And Packaging

There must be one formal build path.

Required conditions:

- one root `package.json`
- one root `dist/`
- one build command that emits both CLI and MCP server entry points
- no separate authoritative implementation under `server/`

Official binaries:

- `mcp-diagnoser`
- `mcp-diagnoser-server`

Packaging validation must check:

- both formal entry points exist
- required runtime files are included
- no stale split build outputs are being shipped as the source of truth
- documented tool list matches actual MCP tool registration

## Testing Strategy

### Unit Tests

Cover:

- config discovery
- platform normalization
- runtime probing
- package parsing
- issue synthesis
- fix-plan generation

### Integration Tests

Cover:

- MCP tool schema wiring
- service-to-tool mapping
- structured output shape
- structured error shape

### Smoke Tests

Cover:

- CLI help
- MCP server startup
- MCP tool listing
- package artifact validation

### Fixture-Based Tests

Use fake config fixtures for:

- standard MCP configs
- client-specific configs
- multi-config conflict cases
- missing commands
- missing packages
- optional capability degradation

### Required Regression Tests

Add explicit regression coverage for:

- published MCP entry point exists and starts
- actual tool list matches documented stable tool list
- optional feature failure does not prevent baseline server startup
- build output is generated from current source, not stale side artifacts

## Migration Plan

### Phase 1: Unify Entry Points

- create formal `src/bin/cli.ts`
- create formal `src/bin/mcp-server.ts`
- stop treating `server/` as an authoritative parallel implementation

### Phase 2: Extract Shared Services

- move diagnostics into shared services
- move package management into shared services
- move web and Playwright features behind capability-aware adapters

### Phase 3: Rebuild MCP Tool Layer

- define tool schemas from one place
- register the formal tool set
- align MCP responses with structured result types

### Phase 4: Thin CLI Layer

- make CLI call the shared services only
- remove duplicated business logic from CLI handlers

### Phase 5: Verification And Docs

- add smoke tests and package validation
- align README, quick-start docs, and examples with the real tool set
- document cross-platform behavior and permission rules

### Phase 6: Compatibility Cleanup

- provide temporary compatibility aliases where justified
- mark old entry paths and split structures as deprecated
- remove dead build paths once migration is complete

## Acceptance Criteria

This redesign is complete when all of the following are true:

- general MCP clients can start the server through stdio
- Windows, macOS, and Linux all support the baseline diagnostic tool set
- CLI and MCP use one shared service layer
- tool schemas and tool outputs are stable and structured
- write-capable tools require explicit confirmation
- optional heavy features degrade independently without breaking the server
- build, package contents, and documentation all agree on the actual product

## Risks

- trying to preserve every legacy path can slow the cleanup and keep drift alive
- keeping optional heavy features inside one package increases complexity unless capability detection is strict
- documentation debt will return quickly if tool registration and docs remain manually synchronized

## Recommendation

Proceed with an MCP-first single-package refactor, keep CLI as a thin wrapper, formalize the tool catalog above, and treat optional heavy capabilities as dependency-aware extensions rather than baseline requirements.
