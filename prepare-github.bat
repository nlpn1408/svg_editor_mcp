@echo off
REM Script to prepare MCP for GitHub publishing
REM Run from svg_editor\mcp\ directory

echo 🚀 Preparing Project Architect MCP for GitHub...
echo.

REM Check current directory
if not exist "mcp-server.ts" (
    echo ❌ Please run this script from the mcp\ directory
    exit /b 1
)

REM Create new repo directory
set REPO_DIR=..\..\..\project-architect-mcp
echo 📁 Creating repo directory: %REPO_DIR%
if not exist "%REPO_DIR%" mkdir "%REPO_DIR%"

REM Create src directory
echo 📁 Creating src\ directory...
if not exist "%REPO_DIR%\src" mkdir "%REPO_DIR%\src"

REM Copy source files
echo 📄 Copying source files...
copy mcp-server.ts "%REPO_DIR%\src\" >nul
copy search_code.ts "%REPO_DIR%\src\" >nul
copy get_module_map.ts "%REPO_DIR%\src\" >nul
copy find_domain_logic.ts "%REPO_DIR%\src\" >nul
copy find_violations.ts "%REPO_DIR%\src\" >nul
copy get_entity_relationships.ts "%REPO_DIR%\src\" >nul
copy cli.ts "%REPO_DIR%\src\" >nul

REM Copy configs
echo 📄 Copying configs...
copy package_github.json "%REPO_DIR%\package.json" >nul
copy tsconfig.json "%REPO_DIR%\" >nul
copy .gitignore "%REPO_DIR%\" >nul

REM Copy documentation
echo 📄 Copying documentation...
copy README_GITHUB.md "%REPO_DIR%\README.md" >nul
copy LICENSE "%REPO_DIR%\" >nul
copy CHANGELOG.md "%REPO_DIR%\" >nul

REM Update tsconfig.json
echo 🔧 Updating tsconfig.json...
(
echo {
echo   "compilerOptions": {
echo     "target": "ES2022",
echo     "module": "ESNext",
echo     "moduleResolution": "bundler",
echo     "outDir": "./dist",
echo     "rootDir": "./src",
echo     "strict": true,
echo     "esModuleInterop": true,
echo     "skipLibCheck": true,
echo     "forceConsistentCasingInFileNames": true,
echo     "resolveJsonModule": true,
echo     "declaration": true,
echo     "declarationMap": true,
echo     "sourceMap": true
echo   },
echo   "include": [
echo     "src/**/*"
echo   ],
echo   "exclude": [
echo     "node_modules",
echo     "dist"
echo   ]
echo }
) > "%REPO_DIR%\tsconfig.json"

REM Add shebang to mcp-server.ts
echo 🔧 Adding shebang to mcp-server.ts...
(
echo #!/usr/bin/env node
echo.
type "%REPO_DIR%\src\mcp-server.ts"
) > "%REPO_DIR%\src\mcp-server.tmp"
move /y "%REPO_DIR%\src\mcp-server.tmp" "%REPO_DIR%\src\mcp-server.ts" >nul

REM Initialize git
echo 🔧 Initializing git...
cd "%REPO_DIR%"
git init

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Build
echo 🔨 Building...
call npm run build

REM Check build
if not exist "dist" (
    echo ❌ Build failed - dist\ directory not created
    exit /b 1
)

echo.
echo ✅ Setup complete!
echo.
echo 📂 Repo created at: %REPO_DIR%
echo.
echo 📝 Next steps:
echo    1. cd %REPO_DIR%
echo    2. Update package.json (author, repository URL)
echo    3. Update README.md (replace YOUR_USERNAME)
echo    4. git add .
echo    5. git commit -m "Initial release v2.0.0"
echo    6. Create GitHub repo: https://github.com/new
echo    7. git remote add origin https://github.com/YOUR_USERNAME/project-architect-mcp.git
echo    8. git push -u origin main
echo    9. git tag v2.0.0 ^&^& git push origin v2.0.0
echo    10. (Optional) npm publish
echo.
echo 📚 See PUBLISH_GUIDE.md for detailed instructions
