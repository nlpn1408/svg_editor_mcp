import { runRg } from './utils/run-rg.js';
export const findArchitectureViolationsTool = {
    name: "find_architecture_violations",
    description: "Detect violations of Clean Architecture rules (e.g., domain importing infrastructure, business logic in components, missing DI patterns, direct service instantiation).",
    inputSchema: {
        type: "object",
        properties: {
            rule: {
                type: "string",
                enum: [
                    "domain-purity",
                    "container-presenter",
                    "di-pattern",
                    "naming-convention",
                    "api-base-service",
                    "import-sdk",
                    "command-location",
                    "store-devtools",
                    "direct-instantiation",
                    "all"
                ],
                description: "Architecture rule to check. New: 'command-location', 'store-devtools', 'direct-instantiation'"
            }
        },
        required: ["rule"]
    },
    handler: async (args) => {
        const { rule } = args;
        const violations = [];
        try {
            if (rule === 'domain-purity' || rule === 'all') {
                const domainImportsInfra = await runRg([
                    'from [\'"]@/(infrastructure|editor)',
                    'src/domain',
                    '--files-with-matches',
                    '-g', '*.ts'
                ]);
                if (domainImportsInfra) {
                    violations.push('❌ Domain Purity Violation:');
                    violations.push('Domain layer imports infrastructure/editor:');
                    violations.push(domainImportsInfra);
                    violations.push('');
                }
                const domainImportsExternalRaw = await runRg([
                    '^import .* from [\'"][^@./]',
                    'src/domain',
                    '--vimgrep',
                    '-g', '*.ts'
                ]);
                const domainImportsExternal = domainImportsExternalRaw
                    .split('\n')
                    .filter(line => !line.includes('BaseEntity') && !line.includes('/types'))
                    .join('\n');
                if (domainImportsExternal) {
                    violations.push('⚠️  Domain importing external libraries:');
                    violations.push(domainImportsExternal);
                    violations.push('');
                }
            }
            if (rule === 'container-presenter' || rule === 'all') {
                const fetchInPresenters = await runRg([
                    '(fetch\\(|axios\\.|useQuery)',
                    'src/editor/components',
                    '--vimgrep',
                    '-g', '*Presenter*.tsx',
                    '-g', '*Presenter.tsx'
                ]);
                if (fetchInPresenters) {
                    violations.push('❌ Container/Presenter Violation:');
                    violations.push('Presenters contain data fetching logic:');
                    violations.push(fetchInPresenters);
                    violations.push('');
                }
            }
            if (rule === 'di-pattern' || rule === 'all') {
                const serviceFiles = await runRg([
                    'class \\w+Service',
                    'src/domain/services',
                    'src/editor/services',
                    '--files-with-matches',
                    '-g', '*.ts'
                ]);
                const files = serviceFiles.split('\n').filter(Boolean);
                const withoutConstructor = [];
                for (const f of files.slice(0, 20)) {
                    const hasConstructor = await runRg(['constructor\\s*\\(', f]);
                    if (!hasConstructor)
                        withoutConstructor.push(f);
                }
                if (withoutConstructor.length > 0) {
                    violations.push('⚠️  Services possibly missing constructor DI:');
                    violations.push(withoutConstructor.join('\n'));
                    violations.push('');
                }
            }
            if (rule === 'naming-convention' || rule === 'all') {
                const interfacesRaw = await runRg([
                    'interface \\w+Repository',
                    'src/domain/repositories',
                    '-g', '*.ts'
                ]);
                const interfacesWithoutI = interfacesRaw
                    .split('\n')
                    .filter(line => !line.includes('interface I'));
                if (interfacesWithoutI.length > 0) {
                    violations.push('⚠️  Domain interfaces without I prefix:');
                    violations.push(interfacesWithoutI.join('\n'));
                    violations.push('');
                }
            }
            if (rule === 'api-base-service' || rule === 'all') {
                const apiServiceFiles = await runRg([
                    'class API\\w+Service',
                    'src/editor/services',
                    '--files-with-matches',
                    '-g', '*.ts'
                ]);
                const files = apiServiceFiles.split('\n').filter(Boolean);
                const notExtending = [];
                for (const f of files.slice(0, 15)) {
                    const extendsCheck = await runRg(['extends APIBaseService', f]);
                    if (!extendsCheck)
                        notExtending.push(f);
                }
                if (notExtending.length > 0) {
                    violations.push('⚠️  API services should extend APIBaseService:');
                    violations.push(notExtending.join('\n'));
                    violations.push('');
                }
            }
            if (rule === 'import-sdk' || rule === 'all') {
                const sdkImports = await runRg([
                    'from [\'"].*game-settings-sdk[\'"]',
                    'src',
                    '--vimgrep',
                    '-g', '*.ts',
                    '-g', '*.tsx'
                ]);
                const badMatches = sdkImports.split('\n').filter(line => {
                    const match = line.match(/from\s+['"]([^'"]+)['"]/);
                    return match && match[1] !== 'game-settings-sdk';
                });
                if (badMatches.length > 0) {
                    violations.push('⚠️  SDK should be: import { X } from "game-settings-sdk"');
                    violations.push(badMatches.slice(0, 10).join('\n'));
                    violations.push('');
                }
            }
            if (rule === 'command-location' || rule === 'all') {
                // Commands extending Command base should live in src/utils/commanders/
                const allCommandFiles = await runRg([
                    'extends Command\\b',
                    'src',
                    '--vimgrep',
                    '-g', '*.ts',
                ]);
                const misplacedCommands = allCommandFiles
                    .split('\n')
                    .filter(line => line && !line.includes('utils/commanders') && !line.includes('utils\\commanders'));
                if (misplacedCommands.length > 0) {
                    violations.push('❌ Command Location Violation:');
                    violations.push('Command subclasses found outside src/utils/commanders/:');
                    violations.push(misplacedCommands.join('\n'));
                    violations.push('');
                }
            }
            if (rule === 'store-devtools' || rule === 'all') {
                // Zustand stores should always wrap with devtools()
                const storeFiles = await runRg([
                    'create<',
                    'src/editor/stores',
                    'src/editor/components',
                    '--files-with-matches',
                    '-g', '*.ts',
                    '-g', '*.tsx',
                ]);
                const files = storeFiles.split('\n').filter(Boolean);
                const missingDevtools = [];
                for (const f of files.slice(0, 20)) {
                    const hasDevtools = await runRg(['devtools\\(', f]);
                    if (!hasDevtools)
                        missingDevtools.push(f);
                }
                if (missingDevtools.length > 0) {
                    violations.push('⚠️  Stores missing devtools() middleware:');
                    violations.push('Pattern: create<T>()(devtools((set) => ({ ... }), { name }))');
                    violations.push(missingDevtools.join('\n'));
                    violations.push('');
                }
            }
            if (rule === 'direct-instantiation' || rule === 'all') {
                // Services should be singletons — direct `new SomeService()` in UI/hooks is a violation
                const directNew = await runRg([
                    'new \\w+Service\\(',
                    'src/editor/components',
                    'src/features',
                    '--vimgrep',
                    '-g', '*.ts',
                    '-g', '*.tsx',
                ]);
                if (directNew) {
                    const filtered = directNew.split('\n').filter(l => 
                    // Allow test files and DI setup files
                    l && !l.includes('.test.') && !l.includes('.spec.') && !l.includes('CoreEngine'));
                    if (filtered.length > 0) {
                        violations.push('❌ Direct Instantiation Violation:');
                        violations.push('Services instantiated directly in UI — use DI via constructor or singleton:');
                        violations.push(filtered.slice(0, 15).join('\n'));
                        violations.push('');
                    }
                }
            }
            if (violations.length === 0) {
                return {
                    content: [{
                            type: "text",
                            text: `✅ No violations found for rule: ${rule}\n\nArchitecture compliance verified.`
                        }],
                };
            }
            const response = `\n🔍 Architecture Violations (${rule}):\n${'='.repeat(50)}\n\n${violations.join('\n')}\n💡 Refer to CLAUDE.md "Strict Rules" section for guidelines.`;
            return {
                content: [{ type: "text", text: response }],
            };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error checking violations: ${error.message}` }],
                isError: true,
            };
        }
    }
};
//# sourceMappingURL=find_violations.js.map