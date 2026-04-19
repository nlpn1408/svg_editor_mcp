import { runRg } from './utils/run-rg.js';
function toPascalCase(str) {
    return str
        .replace(/Entity$/, '')
        .replace(/Repository$/, '')
        .split(/[-_\s]+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
}
async function checkByContent(label, patterns, dirs, globs = ['*.ts', '*.tsx']) {
    for (const pattern of patterns) {
        const result = await runRg([
            pattern,
            ...dirs,
            '--files-with-matches',
            ...globs.flatMap(g => ['-g', g]),
        ]);
        if (result) {
            return { label, status: '✅', path: result.split('\n')[0] };
        }
    }
    return { label, status: '❌' };
}
export const validateFeatureCompleteTool = {
    name: "validate_feature_complete",
    description: "Check if a feature has all Clean Architecture layers: Entity, IRepository, Repository impl, Mapper, API Service, Store, Container, Presenter, and Tests. Critical for TDD workflow.",
    inputSchema: {
        type: "object",
        properties: {
            featureName: {
                type: "string",
                description: "Feature name in any format (e.g., 'checkpoint', 'chat-ai', 'Checkpoint', 'TriggerEntity')"
            }
        },
        required: ["featureName"]
    },
    handler: async (args) => {
        const pascal = toPascalCase(args.featureName);
        const lower = pascal
            .replace(/([A-Z])/g, (m, l, i) => (i ? '-' : '') + l.toLowerCase())
            .replace(/^-/, '');
        try {
            const checks = await Promise.all([
                // 1. Domain Entity
                checkByContent(`Entity (${pascal}Entity)`, [`class ${pascal}Entity`, `class ${pascal}\\b`], ['src/domain/entities'], ['*.ts']),
                // 2. IRepository interface
                checkByContent(`IRepository (I${pascal}Repository)`, [`interface I${pascal}Repository`], ['src/domain/repositories'], ['*.ts']),
                // 3. Repository implementation
                checkByContent(`Repository impl`, [`class ${pascal}Repository`], ['src/infrastructure'], ['*.ts']),
                // 4. Mapper
                checkByContent(`Mapper (*${lower}*-mappers.ts)`, [`fromDomainToExternal|fromExternalToDomain`], ['src/infrastructure'], [`*${lower}*mappers*`, `*${lower}*mapper*`]),
                // 5. API Service
                checkByContent(`API Service (API${pascal}Service)`, [`class API${pascal}Service`, `class.*${pascal}.*Service extends APIBaseService`], ['src/editor/services'], ['*.ts']),
                // 6. Zustand Store
                checkByContent(`Zustand Store (use${pascal}Store)`, [`use${pascal}Store`, `${pascal}Store`], ['src/editor/stores', 'src/editor/components'], ['*.ts', '*.tsx']),
                // 7. Container component
                checkByContent(`Container (${pascal}Container)`, [`${pascal}Container`], ['src/editor/components', 'src/features'], ['*.tsx', '*.ts']),
                // 8. Presenter component
                checkByContent(`Presenter (${pascal}Presenter)`, [`${pascal}Presenter`], ['src/editor/components', 'src/features'], ['*.tsx', '*.ts']),
                // 9. Tests
                checkByContent(`Tests (*.test.ts/tsx)`, [pascal, lower], ['src'], ['*.test.ts', '*.test.tsx', '*.spec.ts']),
            ]);
            const completed = checks.filter(c => c.status === '✅').length;
            const total = checks.length;
            const pct = Math.round((completed / total) * 100);
            const lines = [];
            lines.push(`\n🔍 Feature Completeness: "${args.featureName}" → ${pascal}`);
            lines.push('='.repeat(60));
            lines.push('');
            lines.push(`Progress: ${completed}/${total} layers (${pct}%)`);
            lines.push('');
            for (const check of checks) {
                const pathInfo = check.path ? `\n       → ${check.path}` : '';
                lines.push(`  ${check.status} ${check.label}${pathInfo}`);
            }
            const missing = checks.filter(c => c.status === '❌');
            if (missing.length > 0) {
                lines.push('');
                lines.push('📋 Next steps (missing layers):');
                missing.forEach(c => lines.push(`   • ${c.label}`));
                lines.push('');
                lines.push('💡 Order: Domain → Infra → App → UI  (see CLAUDE.md "Add Feature")');
            }
            else {
                lines.push('');
                lines.push('✅ All layers implemented!');
            }
            return { content: [{ type: "text", text: lines.join('\n') }] };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error validating feature: ${error.message}` }],
                isError: true,
            };
        }
    }
};
//# sourceMappingURL=validate_feature_complete.js.map