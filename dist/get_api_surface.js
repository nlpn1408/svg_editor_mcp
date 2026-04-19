import { runRg } from './utils/run-rg.js';
export const getApiSurfaceTool = {
    name: "get_api_surface",
    description: "Map API services extending APIBaseService. Use 'all' to list every service, or a specific name to see its public methods and consumers.",
    inputSchema: {
        type: "object",
        properties: {
            serviceName: {
                type: "string",
                description: "Service name (e.g., 'APIAssetsService', 'APIProjectService') or 'all' to list every service"
            }
        },
        required: ["serviceName"]
    },
    handler: async (args) => {
        const { serviceName } = args;
        try {
            const lines = [];
            lines.push(`\n🌐 API Surface: ${serviceName}`);
            lines.push('='.repeat(60));
            if (serviceName === 'all') {
                // List all services extending APIBaseService
                const allServicesRaw = await runRg([
                    'extends APIBaseService',
                    'src',
                    '--files-with-matches',
                    '-g', '*.ts',
                ]);
                const serviceFiles = allServicesRaw ? allServicesRaw.split('\n').filter(Boolean) : [];
                lines.push(`\n📋 ${serviceFiles.length} services extend APIBaseService:\n`);
                for (const file of serviceFiles) {
                    const name = file.split(/[/\\]/).pop()?.replace('.ts', '') ?? file;
                    lines.push(`   • ${name}`);
                    lines.push(`     ${file}`);
                }
                lines.push('');
                lines.push('💡 Use get_api_surface with a specific name for methods + consumers');
                return { content: [{ type: "text", text: lines.join('\n') }] };
            }
            // Specific service lookup
            const normalizedName = serviceName.endsWith('Service') ? serviceName : `${serviceName}Service`;
            const fileRaw = await runRg([
                `class ${normalizedName}`,
                'src',
                '--files-with-matches',
                '-g', '*.ts',
            ]);
            if (!fileRaw) {
                lines.push(`\n❌ "${normalizedName}" not found`);
                lines.push('Use get_api_surface with serviceName="all" to list every service');
                return { content: [{ type: "text", text: lines.join('\n') }] };
            }
            const file = fileRaw.split('\n')[0];
            lines.push(`\n📁 File: ${file}`);
            // Public methods — match async/public function signatures
            const methodsRaw = await runRg([
                '(async\\s+)?\\w+\\s*\\([^)]{0,80}\\)\\s*(:\\s*\\S+)?\\s*\\{',
                '--vimgrep',
                '-m', '30',
                file,
            ]);
            if (methodsRaw) {
                const methodLines = methodsRaw
                    .split('\n')
                    .filter(l => !l.includes('constructor') &&
                    !l.includes('private ') &&
                    !l.includes('protected ') &&
                    Boolean(l))
                    .slice(0, 20);
                if (methodLines.length > 0) {
                    lines.push(`\n⚙️  Public methods (${methodLines.length}):`);
                    methodLines.forEach(l => lines.push(`   ${l}`));
                }
            }
            // Consumers — components/hooks that import and use this service
            const consumersRaw = await runRg([
                normalizedName,
                'src',
                '--files-with-matches',
                '-g', '*.ts',
                '-g', '*.tsx',
            ]);
            if (consumersRaw) {
                const consumers = consumersRaw
                    .split('\n')
                    .filter(f => f && !f.includes('Service.ts') && !f.includes('APIBase'));
                lines.push(`\n👥 Used by (${consumers.length} file${consumers.length !== 1 ? 's' : ''}):`);
                consumers.slice(0, 15).forEach(f => lines.push(`   ${f}`));
                if (consumers.length > 15)
                    lines.push(`   ... and ${consumers.length - 15} more`);
            }
            else {
                lines.push('\n👥 Used by: (not referenced outside service files)');
            }
            return { content: [{ type: "text", text: lines.join('\n') }] };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error mapping API surface: ${error.message}` }],
                isError: true,
            };
        }
    }
};
//# sourceMappingURL=get_api_surface.js.map