import { runRg } from './utils/run-rg.js';
async function listSourceFiles(dir) {
    const result = await runRg(['--files', dir, '-g', '*.ts', '--ignore-file-case-insensitive']);
    return result
        .split('\n')
        .filter(f => f && !f.includes('.test.') && !f.includes('.spec.') && !f.includes('index.ts'));
}
async function hasTestFile(baseName) {
    // Search for a test file that references this class/module by name
    const result = await runRg([
        baseName,
        'src',
        '--files-with-matches',
        '-g', '*.test.ts',
        '-g', '*.test.tsx',
        '-g', '*.spec.ts',
    ]);
    return result.trim().length > 0;
}
function getBaseName(filePath) {
    return filePath.split(/[/\\]/).pop()?.replace(/\.(ts|tsx)$/, '') ?? '';
}
export const findMissingTestsTool = {
    name: "find_missing_tests",
    description: "Find domain entities, domain services, and Commands that have no corresponding test files. Critical for TDD discipline — should be run before starting any new feature.",
    inputSchema: {
        type: "object",
        properties: {
            scope: {
                type: "string",
                enum: ["domain", "commands", "all"],
                description: "'domain' checks entities + services, 'commands' checks undo/redo commands, 'all' checks everything"
            }
        },
        required: ["scope"]
    },
    handler: async (args) => {
        const { scope } = args;
        const missing = [];
        try {
            if (scope === 'domain' || scope === 'all') {
                const entityFiles = await listSourceFiles('src/domain/entities');
                for (const file of entityFiles) {
                    const baseName = getBaseName(file);
                    if (!baseName || baseName === 'BaseEntity')
                        continue;
                    const hasTest = await hasTestFile(baseName);
                    if (!hasTest)
                        missing.push({ type: 'Domain Entity', file, baseName });
                }
                const serviceFiles = await listSourceFiles('src/domain/services');
                for (const file of serviceFiles) {
                    const baseName = getBaseName(file);
                    if (!baseName)
                        continue;
                    const hasTest = await hasTestFile(baseName);
                    if (!hasTest)
                        missing.push({ type: 'Domain Service', file, baseName });
                }
            }
            if (scope === 'commands' || scope === 'all') {
                const commandFiles = await listSourceFiles('src/utils/commanders');
                for (const file of commandFiles) {
                    const baseName = getBaseName(file);
                    // Skip base class and non-command files
                    if (!baseName || baseName === 'History' || baseName === 'Command' || !baseName.includes('Command'))
                        continue;
                    const hasTest = await hasTestFile(baseName);
                    if (!hasTest)
                        missing.push({ type: 'Command', file, baseName });
                }
            }
            const lines = [];
            lines.push(`\n🧪 Missing Tests Report (scope: ${scope})`);
            lines.push('='.repeat(60));
            lines.push('');
            if (missing.length === 0) {
                lines.push('✅ All scanned files have corresponding tests!');
                return { content: [{ type: "text", text: lines.join('\n') }] };
            }
            // Group by type
            const byType = missing.reduce((acc, item) => {
                if (!acc[item.type])
                    acc[item.type] = [];
                acc[item.type].push(item);
                return acc;
            }, {});
            for (const [type, items] of Object.entries(byType)) {
                lines.push(`❌ ${type} (${items.length} without tests):`);
                items.forEach(item => lines.push(`   • ${item.file}`));
                lines.push('');
            }
            lines.push(`Total: ${missing.length} file(s) without tests`);
            lines.push('');
            lines.push('💡 TDD: Write failing test BEFORE implementing (CLAUDE.md "Fix Bug (TDD)")');
            lines.push('   Pattern: npx vitest run path/to/file.test.ts');
            return { content: [{ type: "text", text: lines.join('\n') }] };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error scanning for missing tests: ${error.message}` }],
                isError: true,
            };
        }
    }
};
//# sourceMappingURL=find_missing_tests.js.map