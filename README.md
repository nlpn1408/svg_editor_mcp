# Project Architect MCP Server

Custom MCP (Model Context Protocol) server for SVG Editor project. Provides AI-friendly tools to navigate and analyze Clean Architecture codebase.

## Version 2.0.0

Refactored to match actual project structure with Clean Architecture layers.

---

## 🛠️ Available Tools

### 1. `search_code`
Search code by Clean Architecture layer.

**Parameters:**
- `query` (required): Search term or regex
- `layer` (optional): `domain` | `infrastructure` | `application` | `presentation` | `systems` | `features` | `all`
- `fileType` (optional): `ts` | `tsx` | `js` | `jsx` | `all`

**Use cases:**
- Find all usages of a function across layers
- Search within specific architecture layer
- Filter by file type

**Example:**
```typescript
search_code({ 
  query: "CheckpointEntity", 
  layer: "domain" 
})
```

---

### 2. `get_module_map`
Map architecture structure by layer or feature.

**Parameters:**
- `target` (required): `domain` | `infrastructure` | `application` | `presentation` | `systems` | feature name
- `detailed` (optional): Include file details (default: false for token efficiency)

**Use cases:**
- Understand folder structure
- List all entities in domain layer
- Map feature components

**Example:**
```typescript
get_module_map({ target: "domain" })
// Returns: entities, repositories, services

get_module_map({ target: "chat-ai" })
// Returns: feature structure
```

---

### 3. `find_domain_logic`
Find business logic in entities and services.

**Parameters:**
- `query` (required): Business logic to search
- `type` (optional): `entity` | `service` | `all`

**Use cases:**
- Find where business rules are implemented
- Locate aggregate roots
- Search domain services

**Example:**
```typescript
find_domain_logic({ 
  query: "calculate score", 
  type: "entity" 
})
```

---

### 4. `find_architecture_violations`
Detect Clean Architecture rule violations.

**Parameters:**
- `rule` (required): `domain-purity` | `container-presenter` | `di-pattern` | `naming-convention` | `all`

**Use cases:**
- Check domain imports infrastructure (violation)
- Detect data fetching in Presenter components
- Find services without constructor DI
- Verify domain interfaces have `I` prefix

**Example:**
```typescript
find_architecture_violations({ rule: "domain-purity" })
// Checks: Domain importing infra/editor
```

**Rules checked:**

| Rule | Checks |
|------|--------|
| `domain-purity` | Domain importing infrastructure/editor/external libs |
| `container-presenter` | Presenters contain fetch/axios/useQuery |
| `di-pattern` | Services missing constructor DI |
| `naming-convention` | Domain interfaces without `I` prefix |

---

### 5. `get_entity_relationships`
Map dependencies between entity, repository, services, and components.

**Parameters:**
- `entityName` (required): Entity name (e.g., "CheckpointEntity" or "Checkpoint")

**Use cases:**
- Understand data flow for an entity
- See which services use an entity
- Find components consuming an entity

**Example:**
```typescript
get_entity_relationships({ entityName: "Checkpoint" })
// Returns: Entity → Repository → Services → Components
```

---

## 🏗️ Architecture Mapping

The MCP server understands project structure:

```
src/
├── domain/              → Pure logic (entities, I* interfaces, services)
├── infrastructure/      → Repository implementations, mappers
├── editor/
│   ├── services/        → API services, domain services
│   ├── components/      → UI components (Container/Presenter)
│   └── stores/          → Zustand stores
├── systems/             → Core systems (Singleton)
├── features/            → Feature modules
├── utils/commanders/    → Command pattern
└── workers/             → Web workers
```

---

## 🚀 Setup & Usage

### Prerequisites
- Node.js 18+
- ripgrep (`rg`) installed and in PATH

### Build & Run

```bash
# Clone the repository
git clone https://github.com/nlpn1408/svg_editor_mcp.git
cd svg_editor_mcp

# Install dependencies
npm install

# Build TypeScript
npm run build

# Test server
node dist/mcp-server.js
```

### Configure in Cursor

Add to MCP settings (Ctrl+Shift+P → "Preferences: Open Settings (JSON)"):

**Option 1: Use from GitHub (Recommended - No local setup needed)**

```json
{
  "mcpServers": {
    "svg-editor-mcp": {
      "command": "npx",
      "args": ["-y", "github:nlpn1408/svg_editor_mcp"]
    }
  }
}
```

**Option 2: Use local build**

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

Replace:
- `/absolute/path/to/svg_editor_mcp/` with your actual clone path
- `/absolute/path/to/your/project` with your project root where you want to use the MCP

Example (Windows):
```json
{
  "mcpServers": {
    "svg-editor-mcp": {
      "command": "node",
      "args": ["C:/Users/YourName/projects/svg_editor_mcp/dist/mcp-server.js"],
      "cwd": "C:/Users/YourName/projects/my-clean-architecture-app"
    }
  }
}
```

**Important:** Restart Cursor after adding config!

---

## 💡 Use Cases

### Code Navigation
```typescript
// Find all CheckpointEntity usages
search_code({ query: "CheckpointEntity", layer: "all" })

// Map domain structure
get_module_map({ target: "domain" })
```

### Architecture Validation
```typescript
// Check for violations
find_architecture_violations({ rule: "all" })

// Verify domain purity
find_architecture_violations({ rule: "domain-purity" })
```

### Understanding Relationships
```typescript
// Understand Checkpoint flow
get_entity_relationships({ entityName: "Checkpoint" })

// Find TriggerEntity business logic
find_domain_logic({ query: "TriggerEntity", type: "entity" })
```

### Feature Development
```typescript
// Map feature structure before modifying
get_module_map({ target: "chat-ai" })

// Find existing service patterns
find_domain_logic({ query: "Service", type: "service" })
```

---

## 🎯 Token Optimization

Tools are optimized for minimal token usage:

- **Max results limited** (10-20 per search)
- **Max columns** (200 chars per line)
- **Filtered results** (exclude tests, node_modules)
- **Structured output** (clear categorization)
- **Default: non-detailed** (summaries only)

---

## 🔄 Version History

### v2.0.0 (Current)
- ✅ Refactored to match Clean Architecture structure
- ✅ Removed hardcoded `src/modules/` paths
- ✅ Added layer-based search
- ✅ Implemented `find_domain_logic`
- ✅ Added `find_architecture_violations`
- ✅ Added `get_entity_relationships`
- ✅ Token-optimized outputs

### v1.0.0 (Deprecated)
- ❌ Had hardcoded structure (`src/modules/`)
- ❌ Didn't work with actual project
- ❌ Missing implementations

---

## 🐛 Troubleshooting

### Tool returns "not found"
- Check `ripgrep` is installed: `rg --version`
- Verify working directory is project root
- Check file paths match your structure

### No results for entity search
- Try with/without "Entity" suffix
- Check entity exists in `src/domain/entities/`
- Use `get_module_map({ target: "domain" })` to list entities

### Architecture violations not detected
- Rules use regex patterns, may need tuning
- Some violations require manual review
- Refer to `CLAUDE.md` for architecture rules

---

## 📚 References

- Architecture rules: `CLAUDE.md`
- Domain map: `.context/DOMAIN_MAP.md`
- DI patterns: `.context/DEPS_INJECTION.md`
- MCP Protocol: https://modelcontextprotocol.io/

---

**Status:** ✅ Production Ready  
**Last Updated:** 2026-03  
**Maintainer:** Project Team
