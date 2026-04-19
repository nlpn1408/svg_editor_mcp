import { runRg } from './utils/run-rg.js';
function toPascalCase(str) {
    return str
        .replace(/^use/, '')
        .replace(/Store$/, '')
        .split(/[-_\s]+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
}
function toKebabCase(pascal) {
    return pascal
        .replace(/([A-Z])/g, (m, l, i) => (i ? '-' : '') + l.toLowerCase())
        .replace(/^-/, '');
}
export const getStoreConsumersTool = {
    name: "get_store_consumers",
    description: "Find all components and hooks consuming a Zustand store. Shows store location, state field sample, and every consumer file with usage count.",
    inputSchema: {
        type: "object",
        properties: {
            storeName: {
                type: "string",
                description: "Store name in any format: 'AssetStore', 'asset-store', 'useAssetStore', 'PaymentStore'"
            }
        },
        required: ["storeName"]
    },
    handler: async (args) => {
        const pascal = toPascalCase(args.storeName);
        const kebab = toKebabCase(pascal);
        const hookName = `use${pascal}Store`;
        try {
            const lines = [];
            lines.push(`\n🏪 Store: ${pascal}Store  (hook: ${hookName})`);
            lines.push('='.repeat(60));
            // 1. Find store definition file (where create() or the hook is defined)
            const storeDefRaw = await runRg([
                `${hookName}\\s*=\\s*create|create<.*${pascal}`,
                'src/editor/stores',
                'src/editor/components',
                '--files-with-matches',
                '-g', '*.ts',
                '-g', '*.tsx',
            ]);
            const storeDefFile = storeDefRaw ? storeDefRaw.split('\n')[0] : null;
            if (storeDefFile) {
                lines.push(`\n📁 Store definition: ${storeDefFile}`);
                // Sample state fields from the definition file
                const stateFields = await runRg([
                    '\\w+[?]?:\\s+\\w',
                    '--vimgrep',
                    '-m', '12',
                    storeDefFile,
                ]);
                if (stateFields) {
                    lines.push('📦 State fields (sample):');
                    stateFields.split('\n').slice(0, 8).forEach(l => lines.push(`   ${l}`));
                }
            }
            else {
                lines.push(`\n⚠️  Store definition not found`);
                lines.push(`   Searched for: ${hookName} = create | create<.*${pascal}`);
                lines.push(`   Folders: src/editor/stores, src/editor/components`);
            }
            // 2. Find all consumers — any file calling the hook
            const consumersRaw = await runRg([
                hookName,
                'src',
                '--vimgrep',
                '-g', '*.ts',
                '-g', '*.tsx',
            ]);
            if (consumersRaw) {
                const allLines = consumersRaw.split('\n').filter(Boolean);
                // Group by file path (first segment before first colon on non-Windows, or drive+path on Windows)
                const fileMap = new Map();
                for (const line of allLines) {
                    // vimgrep format: path:line:col:content
                    const parts = line.match(/^(.+?):\d+:\d+:/);
                    const file = parts ? parts[1] : line.split(':')[0];
                    fileMap.set(file, (fileMap.get(file) || 0) + 1);
                }
                // Exclude the store definition itself
                if (storeDefFile)
                    fileMap.delete(storeDefFile);
                const consumers = Array.from(fileMap.entries());
                lines.push(`\n👥 Consumers — ${consumers.length} file${consumers.length !== 1 ? 's' : ''} use ${hookName}:`);
                if (consumers.length === 0) {
                    lines.push('   (none — store is defined but not used yet)');
                }
                else {
                    consumers.slice(0, 25).forEach(([file, count]) => {
                        lines.push(`   ${file}  (${count} call${count !== 1 ? 's' : ''})`);
                    });
                    if (consumers.length > 25)
                        lines.push(`   ... and ${consumers.length - 25} more`);
                }
            }
            else {
                lines.push(`\n👥 Consumers: (none — ${hookName} not called anywhere)`);
                lines.push(`   Tip: Hook may be named differently. Try variations like use${pascal}.`);
            }
            return { content: [{ type: "text", text: lines.join('\n') }] };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error tracing store consumers: ${error.message}` }],
                isError: true,
            };
        }
    }
};
//# sourceMappingURL=get_store_consumers.js.map