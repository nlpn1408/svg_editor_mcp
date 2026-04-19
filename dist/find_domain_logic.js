import { exec as execChildProcess } from 'child_process';
import { promisify } from 'util';
const exec = promisify(execChildProcess);
// Paths where domain logic resides
const DOMAIN_LOGIC_PATHS = [
    'src/domain/entities', // Aggregate Roots, Entities
    'src/domain/services', // Pure domain services
    'src/editor/services/domain' // Application domain services
];
export const findDomainLogicTool = {
    name: "find_domain_logic",
    description: "Find business logic in domain entities, services, and aggregate roots. Focuses on pure domain layer and domain services (not UI or infrastructure).",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "Business logic to search for (e.g., 'calculate score', 'validate checkpoint', 'TriggerEntity')"
            },
            type: {
                type: "string",
                enum: ["entity", "service", "all"],
                description: "Type of domain logic to search (default: all)"
            }
        },
        required: ["query"]
    },
    handler: async (args) => {
        const { query, type = 'all' } = args;
        // Determine search paths based on type
        let searchPaths;
        if (type === 'entity') {
            searchPaths = ['src/domain/entities'];
        }
        else if (type === 'service') {
            searchPaths = ['src/domain/services', 'src/editor/services/domain'];
        }
        else {
            searchPaths = DOMAIN_LOGIC_PATHS;
        }
        try {
            const rgCommand = [
                'rg',
                `"${query}"`,
                searchPaths.join(' '),
                '--vimgrep',
                `-g "*.ts"`,
                '--max-columns 200',
                '--max-count 5', // Max 5 matches per file for domain logic
                '--heading',
                '--color never',
                '-i' // Case insensitive for business logic search
            ].join(' ');
            const { stdout } = await exec(rgCommand);
            if (!stdout.trim()) {
                return {
                    content: [{
                            type: "text",
                            text: `No domain logic found for "${query}". Try searching in:\n- Entities (Aggregate Roots)\n- Domain Services\n- Business logic methods`
                        }],
                };
            }
            // Parse and categorize results
            const lines = stdout.split('\n');
            const results = {
                entities: [],
                services: [],
                other: []
            };
            let currentFile = '';
            for (const line of lines) {
                if (line.includes(':')) {
                    const [filePath] = line.split(':');
                    if (filePath && filePath !== currentFile) {
                        currentFile = filePath;
                        if (filePath.includes('entities')) {
                            results.entities.push(line);
                        }
                        else if (filePath.includes('services')) {
                            results.services.push(line);
                        }
                        else {
                            results.other.push(line);
                        }
                    }
                    else {
                        // Continue with current category
                        if (currentFile.includes('entities')) {
                            results.entities.push(line);
                        }
                        else if (currentFile.includes('services')) {
                            results.services.push(line);
                        }
                        else {
                            results.other.push(line);
                        }
                    }
                }
            }
            const responseLines = [];
            responseLines.push(`\n🔍 Domain Logic Search: "${query}"\n`);
            if (results.entities.length > 0) {
                responseLines.push('📦 Entities/Aggregate Roots:');
                responseLines.push(results.entities.join('\n'));
                responseLines.push('');
            }
            if (results.services.length > 0) {
                responseLines.push('⚙️  Domain Services:');
                responseLines.push(results.services.join('\n'));
                responseLines.push('');
            }
            if (results.other.length > 0) {
                responseLines.push('📁 Other Domain Logic:');
                responseLines.push(results.other.join('\n'));
            }
            const hint = '\n💡 Tip: Entities contain business rules, Services orchestrate operations.';
            responseLines.push(hint);
            return {
                content: [{ type: "text", text: responseLines.join('\n') }],
            };
        }
        catch (error) {
            // ripgrep returns exit code 1 when no matches
            if (error.code === 1) {
                return {
                    content: [{
                            type: "text",
                            text: `No domain logic found for "${query}".\n\nDomain logic should be in:\n- src/domain/entities/ (Aggregate Roots)\n- src/domain/services/ (Pure services)\n- src/editor/services/domain/ (Application services)`
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
//# sourceMappingURL=find_domain_logic.js.map