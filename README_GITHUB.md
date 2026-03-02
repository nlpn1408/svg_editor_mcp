# Project Architect MCP

[![npm version](https://badge.fury.io/js/project-architect-mcp.svg)](https://www.npmjs.com/package/project-architect-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP (Model Context Protocol) server for navigating Clean Architecture codebases. Provides AI-powered tools for searching, mapping, and validating architecture patterns.

Perfect for projects using **Clean Architecture** with layers: Domain, Infrastructure, Application, Presentation.

---

## 🚀 Features

- 🔍 **Layer-based search** - Search code by architecture layer
- 🗺️ **Structure mapping** - Map entities, repositories, services, components
- 🎯 **Business logic finder** - Locate domain logic in entities/services
- ✅ **Architecture validation** - Detect Clean Architecture violations
- 📊 **Dependency mapping** - Visualize entity relationships
- ⚡ **Token-optimized** - Efficient outputs for AI context

---

## 📦 Installation

### Option 1: NPM (Recommended)

```bash
npm install -g project-architect-mcp
```

### Option 2: NPX (No installation)

```bash
npx project-architect-mcp
```

### Option 3: From Source

```bash
git clone https://github.com/YOUR_USERNAME/project-architect-mcp.git
cd project-architect-mcp
npm install
npm run build
```

---

## ⚙️ Configuration

### For Cursor AI

Add to your Cursor MCP settings (Settings → Features → MCP Servers):

**Using global install:**
```json
{
  "mcpServers": {
    "project-architect": {
      "command": "project-architect-mcp"
    }
  }
}
```

**Using NPX:**
```json
{
  "mcpServers": {
    "project-architect": {
      "command": "npx",
      "args": ["project-architect-mcp"]
    }
  }
}
```

**Using local path:**
```json
{
  "mcpServers": {
    "project-architect": {
      "command": "node",
      "args": ["/absolute/path/to/project-architect-mcp/dist/mcp-server.js"],
      "cwd": "/absolute/path/to/your/project"
    }
  }
}
```

### For Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "project-architect": {
      "command": "npx",
      "args": ["-y", "project-architect-mcp"]
    }
  }
}
```

---

## 🛠️ Available Tools

### 1. search_code

Search code by Clean Architecture layer.

```typescript
// Usage in AI chat
"Search for CheckpointEntity in domain layer"

// Parameters
{
  query: string,          // Search term
  layer?: "domain" | "infrastructure" | "application" | "presentation" | "systems" | "all",
  fileType?: "ts" | "tsx" | "js" | "jsx" | "all"
}
```

### 2. get_module_map

Map architecture structure by layer or feature.

```typescript
"Map the domain structure"

// Parameters
{
  target: string,    // "domain" | "infrastructure" | "application" | "presentation" | feature-name
  detailed?: boolean // Include file details (default: false)
}
```

### 3. find_domain_logic

Find business logic in entities and services.

```typescript
"Find business logic for calculating scores"

// Parameters
{
  query: string,     // Business logic to search
  type?: "entity" | "service" | "all"
}
```

### 4. find_architecture_violations

Detect Clean Architecture rule violations.

```typescript
"Check for architecture violations"

// Parameters
{
  rule: "domain-purity" | "container-presenter" | "di-pattern" | "naming-convention" | "all"
}
```

### 5. get_entity_relationships

Map entity dependencies (entity → repository → services → components).

```typescript
"Show Checkpoint entity relationships"

// Parameters
{
  entityName: string  // Entity name (e.g., "Checkpoint" or "CheckpointEntity")
}
```

---

## 📁 Expected Project Structure

This MCP works best with Clean Architecture projects:

```
your-project/
├── src/
│   ├── domain/              # Pure business logic
│   │   ├── entities/        # Domain entities
│   │   ├── repositories/    # Repository interfaces (I* prefix)
│   │   └── services/        # Domain services
│   ├── infrastructure/      # External implementations
│   │   └── repositories/    # Repository implementations
│   ├── application/         # Use cases, services
│   │   └── services/        # Application services
│   └── presentation/        # UI layer
│       └── components/      # React/Vue/etc components
```

**Also supports:**
- `src/editor/services/` (application layer)
- `src/editor/components/` (presentation layer)
- `src/features/` (feature modules)
- `src/systems/` (core systems)

---

## 💡 Usage Examples

### Example 1: Find Code by Layer

```
You: "Search for CheckpointEntity in domain layer"

AI (using MCP): Searching domain layer...
Found in:
  src/domain/entities/checkpoint/CheckpointEntity.ts:5
  src/domain/services/CheckpointService.ts:12
```

### Example 2: Map Architecture

```
You: "Map the domain structure"

AI (using MCP):
📦 Domain Layer:
  Entities: CheckpointEntity.ts, TriggerEntity.ts, UserEntity.ts
  Repository Interfaces: ICheckpointRepository.ts, ITriggerRepository.ts
  Domain Services: CheckpointService.ts, TriggerService.ts
```

### Example 3: Validate Architecture

```
You: "Check for architecture violations"

AI (using MCP): Checking...
❌ Domain Purity Violation:
  src/domain/services/BadService.ts:3
  Imports from infrastructure layer (not allowed)
```

### Example 4: Map Dependencies

```
You: "Show Checkpoint entity relationships"

AI (using MCP):
📊 Entity Relationship Map: CheckpointEntity

🏛️  Domain Layer:
   └─ Entity: src/domain/entities/checkpoint/CheckpointEntity.ts
   └─ Repository: ICheckpointRepository

⚙️  Services using it:
   └─ CheckpointService
   └─ AutoSaveService

🎨 Components using it:
   └─ CheckpointList
   └─ CheckpointManager
```

---

## 🎯 Use Cases

### During Development
- **Quick navigation** - Find code across layers instantly
- **Understand structure** - Map project architecture on-demand
- **Locate logic** - Find where business rules are implemented

### During Code Review
- **Validate architecture** - Detect violations automatically
- **Check dependencies** - See entity relationship impacts
- **Verify patterns** - Ensure Clean Architecture compliance

### For Onboarding
- **Explore codebase** - New developers can map structure
- **Learn patterns** - See how layers interact
- **Find examples** - Locate similar implementations

---

## ⚙️ Requirements

- **Node.js** 18 or higher
- **ripgrep** (`rg`) - For fast code search
  - Mac: `brew install ripgrep`
  - Ubuntu: `sudo apt install ripgrep`
  - Windows: Download from [releases](https://github.com/BurntSushi/ripgrep/releases)

---

## 🔧 Development

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/project-architect-mcp.git
cd project-architect-mcp
npm install
```

### Build

```bash
npm run build
```

### Test Locally

```bash
npm start
```

### Run in Dev Mode

```bash
npm run dev
```

---

## 📊 Architecture

```
project-architect-mcp/
├── src/
│   ├── mcp-server.ts           # Main MCP server
│   ├── search_code.ts          # Layer-based search tool
│   ├── get_module_map.ts       # Structure mapping tool
│   ├── find_domain_logic.ts    # Business logic finder
│   ├── find_violations.ts      # Architecture validator
│   └── get_entity_relationships.ts  # Dependency mapper
├── dist/                       # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🐛 Troubleshooting

### MCP not appearing in Cursor

1. Check Cursor settings: Settings → Features → MCP Servers
2. Verify configuration is correct
3. Restart Cursor
4. Check server logs

### "ripgrep not found"

Install ripgrep:
```bash
# Mac
brew install ripgrep

# Ubuntu/Debian
sudo apt install ripgrep

# Windows
# Download from https://github.com/BurntSushi/ripgrep/releases
```

### No results found

- Ensure you're in a project with supported structure
- Check that `src/` directory exists
- Verify file paths match expected structure

### Build fails

```bash
rm -rf node_modules dist
npm install
npm run build
```

---

## 🔗 Links

- [GitHub Repository](https://github.com/YOUR_USERNAME/project-architect-mcp)
- [NPM Package](https://www.npmjs.com/package/project-architect-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## 📮 Support

- 🐛 [Report Issues](https://github.com/YOUR_USERNAME/project-architect-mcp/issues)
- 💬 [Discussions](https://github.com/YOUR_USERNAME/project-architect-mcp/discussions)
- 📧 [Email](mailto:your-email@example.com)

---

**Made with ❤️ for Clean Architecture projects**

*Compatible with Cursor AI, Claude Desktop, and any MCP-enabled AI client*
