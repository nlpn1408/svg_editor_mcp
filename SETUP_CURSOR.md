# ✅ MCP Server Đã Sẵn Sàng!

## 🎉 Status

- ✅ Structure đúng (`src/` folder)
- ✅ TypeScript compiled thành công
- ✅ `dist/` folder đã có đầy đủ files
- ✅ Server test OK (chạy được)

---

## 🚀 Cách Sử Dụng Trong Cursor

### Bước 1: Mở Cursor Settings

**Windows:**
```
Ctrl + Shift + P → "Preferences: Open Settings (JSON)"
hoặc
File → Preferences → Settings → search "mcp"
```

### Bước 2: Add MCP Config

Tìm section `mcpServers` hoặc tạo mới. Thêm config sau:

```json
{
  "mcpServers": {
    "svg-editor-mcp": {
      "command": "node",
      "args": ["D:/phuongnam/src_code/svg_editor_mcp/dist/mcp-server.js"],
      "cwd": "D:/phuongnam/src_code/octokit/svg_editor"
    }
  }
}
```

**Giải thích:**
- `command`: Chạy bằng node
- `args`: Path đến `mcp-server.js` đã build
- `cwd`: Working directory (project root của bạn)

### Bước 3: Restart Cursor

Quan trọng! Phải restart Cursor để load MCP server.

---

## 🧪 Test MCP Server

Sau khi restart Cursor, test bằng các prompt:

### Test 1: Search Code
```
"Search for CheckpointEntity in domain layer"
```

AI sẽ dùng MCP tool `search_code` để tìm.

### Test 2: Map Structure
```
"Map the domain structure"
```

AI sẽ dùng `get_module_map` để show entities, repositories, services.

### Test 3: Find Business Logic
```
"Find business logic for TriggerEntity"
```

AI sẽ dùng `find_domain_logic`.

### Test 4: Check Violations
```
"Check for architecture violations"
```

AI sẽ dùng `find_architecture_violations`.

### Test 5: Entity Relationships
```
"Show Checkpoint entity relationships"
```

AI sẽ dùng `get_entity_relationships`.

---

## 🔧 Alternative: NPX Method

Nếu không muốn dùng local path, có thể dùng NPX từ GitHub:

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

**Lưu ý:** Method này cần:
1. Push code lên GitHub (đã có)
2. Có `prepare` script trong `package.json` (đã có)
3. Internet để download lần đầu

---

## 📁 File Locations

### Local Path Method (Recommended for dev)
```
Command: node
Args: D:/phuongnam/src_code/svg_editor_mcp/dist/mcp-server.js
Working dir: D:/phuongnam/src_code/octokit/svg_editor
```

### GitHub NPX Method (Recommended for sharing)
```
Command: npx
Args: -y github:nlpn1408/svg_editor_mcp
```

---

## 🐛 Troubleshooting

### MCP không xuất hiện trong Cursor

1. **Check Cursor version**: Settings → About → phải là version mới (có MCP support)
2. **Check config location**: 
   - User settings: `C:\Users\[username]\AppData\Roaming\Cursor\User\settings.json`
   - Workspace settings: `.vscode/settings.json` trong project
3. **Restart Cursor**: Quan trọng!
4. **Check logs**: Cursor Developer Tools (Help → Toggle Developer Tools) → Console tab

### "Command not found" error

Check path có đúng không:
```powershell
# Test path exists
Test-Path "D:/phuongnam/src_code/svg_editor_mcp/dist/mcp-server.js"
# Should return: True

# Test server runs
node "D:/phuongnam/src_code/svg_editor_mcp/dist/mcp-server.js"
# Should print: "Project Architect MCP Server v2.0.0 running..."
```

### Server starts but tools not working

1. Check `cwd` path đúng với project của bạn
2. Check `ripgrep` installed: `rg --version`
3. Check project structure match expected (src/domain/, src/infrastructure/, etc.)

---

## 📊 Expected Output

Khi MCP hoạt động, trong Cursor chat bạn sẽ thấy:

```
User: "Search for CheckpointEntity in domain layer"

AI: [Using MCP tool: search_code]
Found in:
  src/domain/entities/checkpoint/CheckpointEntity.ts:5
  src/domain/services/CheckpointService.ts:12
```

Hoặc:

```
User: "Map domain structure"

AI: [Using MCP tool: get_module_map]
📦 Domain Layer:
  Entities: CheckpointEntity.ts, TriggerEntity.ts
  Repositories: ICheckpointRepository.ts, ITriggerRepository.ts
  Services: CheckpointService.ts
```

---

## 🎯 Quick Copy Config

### For Windows (Your Setup)

```json
{
  "mcpServers": {
    "svg-editor-mcp": {
      "command": "node",
      "args": ["D:/phuongnam/src_code/svg_editor_mcp/dist/mcp-server.js"],
      "cwd": "D:/phuongnam/src_code/octokit/svg_editor"
    }
  }
}
```

### For Mac/Linux

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

---

## 🔄 Update MCP

Khi có changes trong code:

```bash
cd D:\phuongnam\src_code\svg_editor_mcp
npm run build
# Restart Cursor
```

Hoặc với GitHub method:
```bash
git add .
git commit -m "Update tools"
git push
# NPX sẽ auto-download version mới lần sau
```

---

## ✅ Success Checklist

- [ ] Cursor Settings có `mcpServers` config
- [ ] Path đến `mcp-server.js` đúng
- [ ] `cwd` path đúng với project
- [ ] Restart Cursor
- [ ] Test với prompt: "Search for CheckpointEntity"
- [ ] AI response có mention "Using MCP tool"

---

**Bạn đã sẵn sàng dùng MCP!** 🎉

Copy config vào Cursor Settings, restart, và test!
