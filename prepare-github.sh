#!/bin/bash

# Script to prepare MCP for GitHub publishing
# Run from svg_editor/mcp/ directory

set -e

echo "🚀 Preparing Project Architect MCP for GitHub..."
echo ""

# Check current directory
if [ ! -f "mcp-server.ts" ]; then
    echo "❌ Please run this script from the mcp/ directory"
    exit 1
fi

# Create new repo directory
REPO_DIR="../../../project-architect-mcp"
echo "📁 Creating repo directory: $REPO_DIR"
mkdir -p "$REPO_DIR"

# Create src directory
echo "📁 Creating src/ directory..."
mkdir -p "$REPO_DIR/src"

# Copy source files
echo "📄 Copying source files..."
cp mcp-server.ts "$REPO_DIR/src/"
cp search_code.ts "$REPO_DIR/src/"
cp get_module_map.ts "$REPO_DIR/src/"
cp find_domain_logic.ts "$REPO_DIR/src/"
cp find_violations.ts "$REPO_DIR/src/"
cp get_entity_relationships.ts "$REPO_DIR/src/"
cp cli.ts "$REPO_DIR/src/"

# Copy configs
echo "📄 Copying configs..."
cp package_github.json "$REPO_DIR/package.json"
cp tsconfig.json "$REPO_DIR/"
cp .gitignore "$REPO_DIR/"

# Copy documentation
echo "📄 Copying documentation..."
cp README_GITHUB.md "$REPO_DIR/README.md"
cp LICENSE "$REPO_DIR/"
cp CHANGELOG.md "$REPO_DIR/"

# Update tsconfig.json
echo "🔧 Updating tsconfig.json..."
cat > "$REPO_DIR/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
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
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
EOF

# Add shebang to mcp-server.ts
echo "🔧 Adding shebang to mcp-server.ts..."
sed -i '1i#!/usr/bin/env node\n' "$REPO_DIR/src/mcp-server.ts" 2>/dev/null || \
echo -e "#!/usr/bin/env node\n\n$(cat $REPO_DIR/src/mcp-server.ts)" > "$REPO_DIR/src/mcp-server.ts"

# Initialize git
echo "🔧 Initializing git..."
cd "$REPO_DIR"
git init

# Create .gitignore if not exists
if [ ! -f ".gitignore" ]; then
    echo "📄 Creating .gitignore..."
    cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.DS_Store
.env
.env.local
*.tsbuildinfo
coverage/
.vscode/
.idea/
EOF
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build
echo "🔨 Building..."
npm run build

# Check build
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist/ directory not created"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📂 Repo created at: $REPO_DIR"
echo ""
echo "📝 Next steps:"
echo "   1. cd $REPO_DIR"
echo "   2. Update package.json (author, repository URL)"
echo "   3. Update README.md (replace YOUR_USERNAME)"
echo "   4. git add ."
echo "   5. git commit -m 'Initial release v2.0.0'"
echo "   6. Create GitHub repo: https://github.com/new"
echo "   7. git remote add origin https://github.com/YOUR_USERNAME/project-architect-mcp.git"
echo "   8. git push -u origin main"
echo "   9. git tag v2.0.0 && git push origin v2.0.0"
echo "   10. (Optional) npm publish"
echo ""
echo "📚 See PUBLISH_GUIDE.md for detailed instructions"
