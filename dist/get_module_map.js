import fs from 'fs/promises';
import path from 'path';
export const getModuleMapTool = {
    name: "get_module_map",
    description: "Map architecture structure by layer (domain/infrastructure/application/presentation) or by feature. Helps understand Clean Architecture organization.",
    inputSchema: {
        type: "object",
        properties: {
            target: {
                type: "string",
                description: "Target to map: 'domain', 'infrastructure', 'application', 'presentation', 'systems', or feature name (e.g., 'chat-ai')"
            },
            detailed: {
                type: "boolean",
                description: "Include file details (default: false for token efficiency)"
            }
        },
        required: ["target"]
    },
    handler: async (args) => {
        const { target, detailed = false } = args;
        const cwd = process.cwd();
        try {
            let map = {
                entities: [],
                repositories: [],
                services: [],
                components: [],
                stores: [],
                systems: []
            };
            // Map by architecture layer
            if (target === 'domain') {
                map.entities = await scanDirectory(path.join(cwd, 'src/domain/entities'));
                map.repositories = await scanDirectory(path.join(cwd, 'src/domain/repositories'));
                map.services = await scanDirectory(path.join(cwd, 'src/domain/services'));
            }
            else if (target === 'infrastructure') {
                map.repositories = await scanDirectory(path.join(cwd, 'src/infrastructure/repositories'));
            }
            else if (target === 'application') {
                map.services = await scanDirectory(path.join(cwd, 'src/editor/services'));
            }
            else if (target === 'presentation') {
                map.components = await scanDirectory(path.join(cwd, 'src/editor/components'));
                map.stores = await scanDirectory(path.join(cwd, 'src/editor/stores'));
            }
            else if (target === 'systems') {
                map.systems = await scanDirectory(path.join(cwd, 'src/systems'));
            }
            // Map by feature
            else {
                const featurePath = path.join(cwd, 'src/features', target);
                const stats = await fs.stat(featurePath).catch(() => null);
                if (!stats?.isDirectory()) {
                    return {
                        content: [{ type: "text", text: `Feature "${target}" not found. Try: domain, infrastructure, application, presentation, systems, or a feature name from src/features/` }],
                        isError: true
                    };
                }
                // Scan feature subfolders
                const subDirs = await fs.readdir(featurePath);
                for (const dir of subDirs) {
                    const fullPath = path.join(featurePath, dir);
                    const stat = await fs.stat(fullPath).catch(() => null);
                    if (stat?.isDirectory()) {
                        const files = await scanDirectory(fullPath);
                        map[dir] = files;
                    }
                }
            }
            // Build response
            const responseLines = [];
            responseLines.push(`\n📦 Module Map: ${target}`);
            responseLines.push('─'.repeat(50));
            if (target === 'domain') {
                responseLines.push('\n🏛️  Domain Layer (Pure Logic):');
                responseLines.push(`  Entities: ${formatFiles(map.entities)}`);
                responseLines.push(`  Repository Interfaces (I*): ${formatFiles(map.repositories)}`);
                responseLines.push(`  Domain Services: ${formatFiles(map.services)}`);
            }
            else if (target === 'infrastructure') {
                responseLines.push('\n🔧 Infrastructure Layer:');
                responseLines.push(`  Repository Implementations: ${formatFiles(map.repositories)}`);
            }
            else if (target === 'application') {
                responseLines.push('\n⚙️  Application Layer:');
                responseLines.push(`  Services (API/Domain): ${formatFiles(map.services)}`);
            }
            else if (target === 'presentation') {
                responseLines.push('\n🎨 Presentation Layer:');
                responseLines.push(`  Components: ${formatFiles(map.components)}`);
                responseLines.push(`  Stores (Zustand): ${formatFiles(map.stores)}`);
            }
            else if (target === 'systems') {
                responseLines.push('\n⚡ Core Systems:');
                responseLines.push(`  Systems: ${formatFiles(map.systems)}`);
            }
            else {
                // Feature map
                responseLines.push(`\n📂 Feature: ${target}`);
                for (const [key, files] of Object.entries(map)) {
                    if (files.length > 0) {
                        responseLines.push(`  ${key}: ${formatFiles(files)}`);
                    }
                }
            }
            return {
                content: [{ type: "text", text: responseLines.join('\n') }],
            };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error mapping module: ${error.message}` }],
                isError: true,
            };
        }
    }
};
// Helper: Scan directory and return file names
async function scanDirectory(dirPath) {
    try {
        const files = await fs.readdir(dirPath);
        return files.filter(f => (f.endsWith('.ts') || f.endsWith('.tsx')) &&
            !f.includes('.test.') &&
            !f.includes('.spec.'));
    }
    catch {
        return [];
    }
}
// Helper: Format file list
function formatFiles(files) {
    if (files.length === 0)
        return '(none)';
    if (files.length <= 5)
        return files.join(', ');
    return `${files.slice(0, 5).join(', ')} ... (+${files.length - 5} more)`;
}
//# sourceMappingURL=get_module_map.js.map