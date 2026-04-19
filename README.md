# Project Architect MCP Server

MCP (Model Context Protocol) server for navigating **Clean Architecture** codebases. Provides AI tools to trace events, validate feature layers, detect architecture violations, and map dependencies — without needing native file access.

## Version 3.0.0

9 tools optimized for Clean Architecture projects (Domain / Infrastructure / Application / Presentation layers).

---

## 🚀 Quick Start

### Option 1: npx from GitHub (no install needed)

```json
{
  "mcpServers": {
    "svg-editor-mcp": {
      "command": "npx",
      "args": ["-y", "github:nlpn1408/svg_editor_mcp"],
      "cwd": "/absolute/path/to/your/project"
    }
  }
}
```

### Option 2: Local build

```bash
git clone https://github.com/nlpn1408/svg_editor_mcp.git
cd svg_editor_mcp
npm install && npm run build
```

```json
{
  "mcpServers": {
    "svg-editor-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/svg_editor_mcp/dist/mcp-server.js"],
      "cwd": "/absolute/path/to/your/project"
    }
  }
}
```

> **Important:** `cwd` must point to your project root (where `src/` lives). Restart your AI client after adding config.

---

## 🛠️ Tools (9 total)

### Navigation & Structure

#### `get_module_map`
Map architecture structure by layer or feature.

```typescript
get_module_map({ target: "domain" })
// → lists entities, repository interfaces, domain services

get_module_map({ target: "chat-ai" })
// → lists feature folder structure
```

#### `get_entity_relationships`
Map full dependency chain: Entity → Repository → Services → Components → Events emitted.

```typescript
get_entity_relationships({ entityName: "Checkpoint" })
```

---

### Event-Driven Debugging

#### `get_event_flow` ⭐
Trace EventManager event flow — find all `Emit()` and `Subscribe()` usages for an event in one call.

```typescript
get_event_flow({ eventName: "CHECKPOINT:PROPERTY_UPDATED" })
// → shows all emitters and subscribers with file:line references

get_event_flow({ eventName: "CHECKPOINT" })
// → matches all checkpoint-related events (partial match)
```

---

### Architecture Validation

#### `find_architecture_violations`
Detect Clean Architecture rule violations.

```typescript
find_architecture_violations({ rule: "all" })
find_architecture_violations({ rule: "domain-purity" })       // domain importing infra
find_architecture_violations({ rule: "container-presenter" }) // fetch in Presenter
find_architecture_violations({ rule: "di-pattern" })          // missing constructor DI
find_architecture_violations({ rule: "naming-convention" })   // I* prefix on interfaces
find_architecture_violations({ rule: "api-base-service" })    // API service not extending base
find_architecture_violations({ rule: "import-sdk" })          // SDK import path
find_architecture_violations({ rule: "command-location" })    // Commands outside utils/commanders
find_architecture_violations({ rule: "store-devtools" })      // Zustand store missing devtools
find_architecture_violations({ rule: "direct-instantiation"}) // new Service() in UI layer
```

#### `validate_feature_complete` ⭐
Check if a feature has all 9 Clean Architecture layers implemented. Critical for TDD.

```typescript
validate_feature_complete({ featureName: "checkpoint" })
// Output:
//   ✅ Entity (CheckpointEntity)     → src/domain/entities/checkpoint/Checkpoint.ts
//   ✅ IRepository                   → src/domain/repositories/ICheckpointRepository.ts
//   ❌ Repository impl               → NOT FOUND
//   ✅ Mapper                        → src/infrastructure/...
//   ✅ API Service                   → src/editor/services/APICheckpointService.ts
//   ✅ Zustand Store                 → src/editor/stores/...
//   ✅ Container                     → src/editor/components/.../CheckpointContainer.tsx
//   ✅ Presenter                     → ...
//   ❌ Tests                         → NOT FOUND
```

#### `find_missing_tests` ⭐
Find domain entities, services, and Commands that have no corresponding test files.

```typescript
find_missing_tests({ scope: "all" })     // entities + services + commands
find_missing_tests({ scope: "domain" })  // entities + services only
find_missing_tests({ scope: "commands"}) // undo/redo commands only
```

---

### Tracing Specific Patterns

#### `get_command_trace`
Trace a Command in the undo/redo system: definition, execute/undo logic, callers, events emitted.

```typescript
get_command_trace({ commandName: "UpdateCheckpointPropertyCommand" })
// → file location, execute() snippet, undo() snippet, events emitted, all History.execute() call sites
```

#### `get_store_consumers`
Find all components and hooks consuming a Zustand store.

```typescript
get_store_consumers({ storeName: "AssetStore" })
// → store definition, state field sample, every consumer file with usage count
```

#### `get_api_surface`
Map API services extending APIBaseService.

```typescript
get_api_surface({ serviceName: "all" })
// → lists all API services with file paths

get_api_surface({ serviceName: "APIAssetsService" })
// → public methods, all components/hooks that consume this service
```

---

## 📁 Expected Project Structure

Works with Clean Architecture projects using this layout:

```
your-project/
└── src/
    ├── domain/
    │   ├── entities/        # Domain entities (BaseEntity<T>)
    │   ├── repositories/    # I* interfaces
    │   └── services/        # Pure domain services
    ├── infrastructure/
    │   └── repositories/    # Concrete implementations + mappers
    ├── editor/
    │   ├── services/        # API services (extend APIBaseService)
    │   ├── components/      # Container / Presenter components
    │   └── stores/          # Zustand stores
    ├── systems/             # Core systems (Singleton)
    ├── features/            # Feature modules
    └── utils/commanders/    # Command pattern (undo/redo)
```

---

## ⚙️ Requirements

- **Node.js** 18+
- **ripgrep** (`rg`) in PATH

```bash
# macOS
brew install ripgrep

# Ubuntu/Debian
sudo apt install ripgrep

# Windows
# Download from https://github.com/BurntSushi/ripgrep/releases
# and add to PATH
```

Verify: `rg --version`

---

## 🗺️ Tool Selection Guide

| I want to...                                 | Use                          |
|----------------------------------------------|------------------------------|
| Trace why an event isn't firing              | `get_event_flow`             |
| Check if a new feature is fully implemented  | `validate_feature_complete`  |
| Find untested domain code before a PR        | `find_missing_tests`         |
| Understand how undo works for a feature      | `get_command_trace`          |
| Find what breaks if I change a store         | `get_store_consumers`        |
| See all API endpoints for a service          | `get_api_surface`            |
| Audit codebase for architecture violations   | `find_architecture_violations` |
| Understand full data flow for an entity      | `get_entity_relationships`   |
| See what files exist in a layer              | `get_module_map`             |

---

## 🔄 Changelog

### v3.0.0
- ✅ Added `get_event_flow` — EventManager trace (emitters + subscribers)
- ✅ Added `validate_feature_complete` — 9-layer feature completeness check
- ✅ Added `find_missing_tests` — TDD coverage gap detector
- ✅ Added `get_command_trace` — undo/redo command tracer
- ✅ Added `get_store_consumers` — Zustand store consumer finder
- ✅ Added `get_api_surface` — API service mapper
- ✅ `find_architecture_violations` — added `command-location`, `store-devtools`, `direct-instantiation` rules
- ✅ `get_entity_relationships` — added events emitted section
- ❌ Removed `search_code`, `find_domain_logic`, `get_feature_checklist` (redundant for Claude Code)

### v2.1.0
- Added `get_feature_checklist`, expanded violation rules, Windows compatibility

### v2.0.0
- Refactored to match Clean Architecture structure, added layer-based search

---

## 📄 License

MIT
