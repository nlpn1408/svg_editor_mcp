# 🚀 Hướng Dẫn Đẩy MCP Lên GitHub & NPM

## 📋 Checklist Chuẩn Bị

### 1. Files Cần Có Trong Repo

```
project-architect-mcp/
├── src/                          # Source code (rename from current structure)
│   ├── mcp-server.ts
│   ├── search_code.ts
│   ├── get_module_map.ts
│   ├── find_domain_logic.ts
│   ├── find_violations.ts
│   └── get_entity_relationships.ts
├── dist/                         # Build output (git ignored)
├── .gitignore                    # ✅ Created
├── package.json                  # ✅ Created (use package_github.json)
├── tsconfig.json                 # ✅ Already exists
├── LICENSE                       # ✅ Created (MIT)
├── README.md                     # ✅ Created (use README_GITHUB.md)
├── CHANGELOG.md                  # ✅ Created
└── cli.ts                        # ✅ Created (for global install)
```

---

## 🎯 Bước 1: Tổ Chức Lại Files

### 1.1. Tạo Repo Mới

```bash
# Tạo thư mục mới cho repo
mkdir project-architect-mcp
cd project-architect-mcp

# Init git
git init
```

### 1.2. Copy Files Từ MCP Folder

```bash
# Copy source code
mkdir src
cp ../svg_editor/mcp/*.ts src/

# Copy configs
cp ../svg_editor/mcp/package_github.json package.json
cp ../svg_editor/mcp/tsconfig.json .
cp ../svg_editor/mcp/README_GITHUB.md README.md
cp ../svg_editor/mcp/LICENSE .
cp ../svg_editor/mcp/CHANGELOG.md .
cp ../svg_editor/mcp/.gitignore .
```

### 1.3. Update tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",      // ← Changed from "./"
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": [
    "src/**/*"                   // ← Changed from "*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### 1.4. Update package.json

```json
{
  "name": "project-architect-mcp",
  "version": "2.0.0",
  "description": "MCP server for navigating Clean Architecture codebases",
  "type": "module",
  "main": "dist/mcp-server.js",
  "bin": {
    "project-architect-mcp": "dist/cli.js"   // ← Entry point for global install
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/mcp-server.js",
    "dev": "tsc && node dist/mcp-server.js",
    "prepublishOnly": "npm run build"
  },
  "files": [
    "dist/**/*",
    "README.md",
    "LICENSE"
  ],
  ...
}
```

### 1.5. Update cli.ts (Entry Point)

```typescript
#!/usr/bin/env node

// Entry point for global installation
import './mcp-server.js';
```

### 1.6. Update mcp-server.ts (Add Shebang)

Thêm dòng đầu tiên:

```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
// ... rest of code
```

---

## 🎯 Bước 2: Build & Test Local

```bash
# Install dependencies
npm install

# Build
npm run build

# Test locally
npm start
```

Kiểm tra:
- ✅ `dist/` folder được tạo
- ✅ Có files: `mcp-server.js`, `cli.js`, `*.js` cho các tools
- ✅ Chạy `node dist/mcp-server.js` không lỗi

---

## 🎯 Bước 3: Push Lên GitHub

### 3.1. Tạo Repo Trên GitHub

1. Vào https://github.com/new
2. Tên repo: `project-architect-mcp`
3. Description: "MCP server for navigating Clean Architecture codebases"
4. Public
5. **KHÔNG** check "Initialize with README" (vì bạn đã có)
6. Create repository

### 3.2. Push Code

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/project-architect-mcp.git

# Add files
git add .

# First commit
git commit -m "Initial release v2.0.0

- Clean Architecture navigation tools
- Search by layer
- Map structure
- Find domain logic
- Validate architecture
- Map entity relationships"

# Push
git branch -M main
git push -u origin main
```

### 3.3. Create Release Tag

```bash
git tag -a v2.0.0 -m "Release v2.0.0 - Clean Architecture MCP"
git push origin v2.0.0
```

### 3.4. GitHub Release (Optional)

1. Vào repo → Releases → Create a new release
2. Tag: `v2.0.0`
3. Title: "v2.0.0 - Clean Architecture MCP"
4. Description: Copy từ CHANGELOG.md
5. Publish release

---

## 🎯 Bước 4: Publish Lên NPM (Optional)

### 4.1. Tạo NPM Account

1. Vào https://www.npmjs.com/signup
2. Tạo account
3. Verify email

### 4.2. Login NPM CLI

```bash
npm login
# Enter username, password, email
```

### 4.3. Check Package Name

```bash
# Kiểm tra tên có available không
npm search project-architect-mcp
```

Nếu bị trùng, đổi tên trong `package.json`:
```json
{
  "name": "@your-username/project-architect-mcp",
  ...
}
```

### 4.4. Publish

```bash
# Dry run (test)
npm publish --dry-run

# Actual publish
npm publish

# If scoped package
npm publish --access public
```

### 4.5. Verify

```bash
# Check package page
open https://www.npmjs.com/package/project-architect-mcp

# Test install globally
npm install -g project-architect-mcp

# Test run
project-architect-mcp
```

---

## 🎯 Bước 5: Sử Dụng Package

### 5.1. Từ NPM (Sau khi publish)

```bash
# Global install
npm install -g project-architect-mcp

# NPX (no install)
npx project-architect-mcp
```

**Cursor config:**
```json
{
  "mcpServers": {
    "project-architect": {
      "command": "project-architect-mcp"
    }
  }
}
```

Hoặc với NPX:
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

### 5.2. Từ GitHub (Không cần NPM)

**Cursor config:**
```json
{
  "mcpServers": {
    "project-architect": {
      "command": "npx",
      "args": [
        "-y",
        "github:YOUR_USERNAME/project-architect-mcp"
      ]
    }
  }
}
```

Hoặc clone về:
```bash
git clone https://github.com/YOUR_USERNAME/project-architect-mcp.git
cd project-architect-mcp
npm install
npm run build
```

**Cursor config:**
```json
{
  "mcpServers": {
    "project-architect": {
      "command": "node",
      "args": ["/path/to/project-architect-mcp/dist/mcp-server.js"],
      "cwd": "/path/to/your/project"
    }
  }
}
```

---

## 🎯 Bước 6: Update README.md

Update các placeholder trong README:

1. **GitHub URL:**
   ```markdown
   https://github.com/YOUR_USERNAME/project-architect-mcp
   ```
   → Thay `YOUR_USERNAME`

2. **Author & Email:**
   ```json
   "author": "Your Name <your-email@example.com>"
   ```

3. **NPM badges:** (Sau khi publish)
   ```markdown
   [![npm version](https://badge.fury.io/js/project-architect-mcp.svg)]
   ```

---

## 🎯 Bước 7: Maintenance

### Update Version

```bash
# Patch: 2.0.0 → 2.0.1 (bug fixes)
npm version patch

# Minor: 2.0.0 → 2.1.0 (new features)
npm version minor

# Major: 2.0.0 → 3.0.0 (breaking changes)
npm version major

# Push tags
git push --follow-tags

# Publish update
npm publish
```

### Update Changelog

```markdown
## [2.0.1] - 2026-03-XX

### Fixed
- Fix bug in search_code tool
```

---

## 📊 Summary

### Files Structure (Final)

```
project-architect-mcp/           ← New standalone repo
├── src/
│   ├── cli.ts                   ← Entry point
│   ├── mcp-server.ts           ← Main server
│   ├── search_code.ts
│   ├── get_module_map.ts
│   ├── find_domain_logic.ts
│   ├── find_violations.ts
│   └── get_entity_relationships.ts
├── dist/                        ← Build output
├── .gitignore
├── package.json
├── tsconfig.json
├── LICENSE
├── README.md
└── CHANGELOG.md
```

### Usage Options

| Method | Command | Use Case |
|--------|---------|----------|
| **NPM Global** | `npm i -g project-architect-mcp` | Best for frequent use |
| **NPX** | `npx project-architect-mcp` | No installation needed |
| **GitHub Direct** | `npx github:user/repo` | Latest from GitHub |
| **Local Clone** | `node dist/mcp-server.js` | Development/testing |

---

## ✅ Checklist

### Pre-Publish
- [ ] All files copied to new repo
- [ ] `package.json` updated (name, author, urls)
- [ ] `README.md` updated (remove YOUR_USERNAME)
- [ ] Build successful (`npm run build`)
- [ ] Test locally (`npm start`)
- [ ] `.gitignore` includes `node_modules/`, `dist/`

### GitHub
- [ ] Repo created on GitHub
- [ ] Code pushed (`git push origin main`)
- [ ] Tag created (`git tag v2.0.0`)
- [ ] Release created (optional)

### NPM (Optional)
- [ ] NPM account created
- [ ] Logged in (`npm login`)
- [ ] Package name available
- [ ] Published (`npm publish`)
- [ ] Verified on npmjs.com

### Testing
- [ ] Install works (`npm i -g project-architect-mcp`)
- [ ] Command runs (`project-architect-mcp`)
- [ ] Cursor config works
- [ ] Tools return results

---

**Bạn đã sẵn sàng để publish!** 🚀

Có câu hỏi gì về các bước không?
