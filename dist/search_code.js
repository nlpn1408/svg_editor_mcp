import { exec as execChildProcess } from 'child_process';
import { promisify } from 'util';
const exec = promisify(execChildProcess);
// Architecture layers theo Clean Architecture
const ARCHITECTURE_LAYERS = {
    domain: 'src/domain',
    infrastructure: 'src/infrastructure',
    application: 'src/editor/services',
    presentation: 'src/editor/components',
    systems: 'src/systems',
    features: 'src/features',
    utils: 'src/utils',
    workers: 'src/workers'
};
// Priority search paths for token optimization
const PRIORITY_DIRS = [
    'src/domain', // Pure logic, entities, interfaces
    'src/infrastructure', // Repository implementations
    'src/editor/services', // API/domain services
    'src/editor/components', // UI components
    'src/systems', // Core systems
    'src/features' // Feature modules
];
export const searchCodeTool = {
    name: "search_code",
    description: "Search code using ripgrep. Optimized for Clean Architecture layers (domain/infra/app/presentation). Can filter by layer or search across priority directories.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "Search term or regex pattern"
            },
            layer: {
                type: "string",
                enum: ["domain", "infrastructure", "application", "presentation", "systems", "features", "all"],
                description: "Architecture layer to search in (optional, defaults to 'all')"
            },
            fileType: {
                type: "string",
                enum: ["ts", "tsx", "js", "jsx", "all"],
                description: "File type filter (optional, defaults to 'all')"
            }
        },
        required: ["query"]
    },
    handler: async (args) => {
        const { query, layer = 'all', fileType = 'all' } = args;
        // Determine search path based on layer
        let searchPath;
        if (layer && layer !== 'all' && ARCHITECTURE_LAYERS[layer]) {
            searchPath = ARCHITECTURE_LAYERS[layer];
        }
        else {
            searchPath = PRIORITY_DIRS.join(' ');
        }
        // Build file type filter
        const fileGlob = fileType === 'all'
            ? "*.{ts,tsx,js,jsx}"
            : `*.${fileType}`;
        try {
            const rgCommand = [
                'rg',
                `"${query}"`,
                searchPath,
                '--vimgrep',
                `-g "${fileGlob}"`,
                '--max-columns 200',
                '--max-count 10', // Max 10 matches per file
                '--heading', // Group by file
                '--color never'
            ].join(' ');
            const { stdout } = await exec(rgCommand);
            if (!stdout.trim()) {
                return {
                    content: [{
                            type: "text",
                            text: `No results found for "${query}" in ${layer === 'all' ? 'any layer' : layer + ' layer'}.`
                        }],
                };
            }
            const resultText = `Found matches for "${query}" in ${layer === 'all' ? 'multiple layers' : layer + ' layer'}:\n\n${stdout}`;
            return {
                content: [{ type: "text", text: resultText }],
            };
        }
        catch (error) {
            // ripgrep returns exit code 1 when no matches found
            if (error.code === 1) {
                return {
                    content: [{
                            type: "text",
                            text: `No results found for "${query}" in ${layer === 'all' ? 'any layer' : layer + ' layer'}.`
                        }],
                };
            }
            return {
                content: [{ type: "text", text: `Search error: ${error.message}` }],
                isError: true,
            };
        }
    }
};
//# sourceMappingURL=search_code.js.map