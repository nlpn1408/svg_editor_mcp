@echo off
REM Project Architect MCP Setup Script (Windows)

echo 🚀 Setting up Project Architect MCP v2.0.0...
echo.

REM Check ripgrep
where rg >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ripgrep (rg) not found!
    echo    Download: https://github.com/BurntSushi/ripgrep/releases
    exit /b 1
)

for /f "tokens=*" %%i in ('rg --version') do (
    echo ✅ ripgrep found: %%i
    goto :node_check
)

:node_check
REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found!
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do (
    echo ✅ Node.js found: %%i
    goto :install
)

:install
REM Install dependencies
echo.
echo 📦 Installing dependencies...
cd mcp
call npm install

REM Build
echo.
echo 🔨 Building TypeScript...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ MCP Server built successfully!
    echo.
    echo 📝 Next steps:
    echo    1. Add to Cursor MCP settings:
    echo       {
    echo         "mcpServers": {
    echo           "project-architect": {
    echo             "command": "node",
    echo             "args": ["mcp/dist/mcp-server.js"],
    echo             "cwd": "%CD:\mcp=%"
    echo           }
    echo         }
    echo       }
    echo.
    echo    2. Restart Cursor
    echo    3. Test: Ask AI to 'search for CheckpointEntity in domain layer'
    echo.
    echo 📚 See mcp\README.md for all available tools
) else (
    echo.
    echo ❌ Build failed!
    exit /b 1
)
