import { runRg } from './utils/run-rg.js';
export const getEntityRelationshipsTool = {
    name: "get_entity_relationships",
    description: "Map relationships between an entity, its repository, services that use it, and components that consume it. Helps understand data flow and dependencies.",
    inputSchema: {
        type: "object",
        properties: {
            entityName: {
                type: "string",
                description: "Entity name (e.g., 'CheckpointEntity', 'TriggerEntity', 'Checkpoint', 'Trigger')"
            }
        },
        required: ["entityName"]
    },
    handler: async (args) => {
        let { entityName } = args;
        if (!entityName.endsWith('Entity')) {
            entityName = `${entityName}Entity`;
        }
        const baseName = entityName.replace(/Entity$/, '');
        try {
            const relationships = {
                entity: entityName,
                services: [],
                usedBy: []
            };
            // 1. Find entity file (support subfolders: checkpoint/Checkpoint.ts)
            let entityFile = await runRg([
                '-l', `class ${entityName}`,
                'src/domain/entities',
                '-g', '*.ts'
            ]);
            if (!entityFile) {
                entityFile = await runRg([
                    '-l', `class ${baseName}`,
                    'src/domain/entities',
                    '-g', '*.ts'
                ]);
            }
            if (!entityFile) {
                return {
                    content: [{
                            type: "text",
                            text: `Entity "${entityName}" not found in src/domain/entities/`
                        }],
                    isError: true
                };
            }
            // 2. Find repository interface (I prefix)
            const repoName = entityName.replace('Entity', 'Repository');
            const repoInterface = await runRg([
                '-l', `interface I${repoName}`,
                'src/domain/repositories',
                '-g', '*.ts'
            ]);
            if (repoInterface) {
                relationships.repository = `I${repoName}`;
            }
            // 3. Find services using this entity
            const servicesUsing = await runRg([
                entityName,
                'src/domain/services',
                'src/editor/services',
                '--files-with-matches',
                '-g', '*.ts'
            ]);
            if (servicesUsing) {
                relationships.services = servicesUsing
                    .split('\n')
                    .filter(Boolean)
                    .map(file => file.split(/[/\\]/).pop()?.replace('.ts', '') || '');
            }
            // 4. Find components using this entity
            const componentsUsing = await runRg([
                `${entityName}|${repoName}`,
                'src/editor/components',
                'src/features',
                '--files-with-matches',
                '-g', '*.ts',
                '-g', '*.tsx'
            ]);
            if (componentsUsing) {
                relationships.usedBy = componentsUsing
                    .split('\n')
                    .filter(Boolean)
                    .map(file => file.split(/[/\\]/).pop()?.replace(/\.(ts|tsx)$/, '') || '');
            }
            // 5. Events emitted by services that use this entity
            const eventsEmitted = [];
            if (servicesUsing) {
                const serviceFiles = servicesUsing.split('\n').filter(Boolean).slice(0, 5);
                for (const sf of serviceFiles) {
                    const events = await runRg(['\\.Emit\\(', '--vimgrep', sf]);
                    if (events) {
                        events.split('\n').filter(Boolean).forEach(l => eventsEmitted.push(l));
                    }
                }
            }
            // Build output
            const lines = [];
            lines.push(`\n📊 Entity Relationship Map: ${entityName}`);
            lines.push('='.repeat(60));
            lines.push('');
            lines.push('🏛️  Domain Layer:');
            lines.push(`   └─ Entity: ${entityFile.split('\n')[0]}`);
            if (relationships.repository) {
                lines.push(`   └─ Repository Interface: ${relationships.repository}`);
            }
            lines.push('');
            if (relationships.services.length > 0) {
                lines.push('⚙️  Application Layer (Services):');
                relationships.services.forEach(s => lines.push(`   └─ ${s}`));
                lines.push('');
            }
            if (relationships.usedBy.length > 0) {
                lines.push('🎨 Presentation Layer (Components):');
                relationships.usedBy.slice(0, 10).forEach(c => lines.push(`   └─ ${c}`));
                if (relationships.usedBy.length > 10) {
                    lines.push(`   ... and ${relationships.usedBy.length - 10} more`);
                }
                lines.push('');
            }
            if (eventsEmitted.length > 0) {
                lines.push('📤 Events Emitted (by related services):');
                eventsEmitted.slice(0, 10).forEach(l => lines.push(`   └─ ${l}`));
                if (eventsEmitted.length > 10)
                    lines.push(`   ... and ${eventsEmitted.length - 10} more`);
                lines.push('');
            }
            lines.push('📈 Data Flow:');
            lines.push(`   ${entityName} (Domain)`);
            if (relationships.repository)
                lines.push(`   ↓ via ${relationships.repository}`);
            if (relationships.services.length > 0)
                lines.push(`   ↓ used by ${relationships.services.length} service(s)`);
            if (relationships.usedBy.length > 0)
                lines.push(`   ↓ consumed by ${relationships.usedBy.length} component(s)`);
            if (eventsEmitted.length > 0)
                lines.push(`   ↓ emits ${eventsEmitted.length} event(s) via EventManager`);
            return {
                content: [{ type: "text", text: lines.join('\n') }],
            };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error mapping relationships: ${error.message}` }],
                isError: true,
            };
        }
    }
};
//# sourceMappingURL=get_entity_relationships.js.map