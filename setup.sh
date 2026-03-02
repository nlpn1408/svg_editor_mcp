#!/bin/bash

# Project Architect MCP Setup Script

echo "🚀 Setting up Project Architect MCP v2.0.0..."
echo ""

# Check ripgrep
if ! command -v rg &> /dev/null; then
    echo "❌ ripgrep (rg) not found!"
    echo "   Install: https://github.com/BurntSushi/ripgrep#installation"
    exit 1
fi

echo "✅ ripgrep found: $(rg --version | head -n 1)"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
cd mcp
npm install

# Build
echo ""
echo "🔨 Building TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ MCP Server built successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Add to Cursor MCP settings:"
    echo "      {"
    echo "        \"mcpServers\": {"
    echo "          \"project-architect\": {"
    echo "            \"command\": \"node\","
    echo "            \"args\": [\"mcp/dist/mcp-server.js\"],"
    echo "            \"cwd\": \"$(pwd | sed 's|/mcp$||')\""
    echo "          }"
    echo "        }"
    echo "      }"
    echo ""
    echo "   2. Restart Cursor"
    echo "   3. Test: Ask AI to 'search for CheckpointEntity in domain layer'"
    echo ""
    echo "📚 See mcp/README.md for all available tools"
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi
