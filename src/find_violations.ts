import { runRg } from './utils/run-rg.js';

export const findArchitectureViolationsTool = {
  name: "find_architecture_violations",
  description: "Detect violations of Clean Architecture rules (e.g., domain importing infrastructure, business logic in components, missing DI patterns).",
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
          "all"
        ],
        description: "Architecture rule to check"
      }
    },
    required: ["rule"]
  },
  handler: async (args: { rule: string }) => {
    const { rule } = args;
    const violations: string[] = [];

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
        const withoutConstructor: string[] = [];
        for (const f of files.slice(0, 20)) {
          const hasConstructor = await runRg(['constructor\\s*\\(', f]);
          if (!hasConstructor) withoutConstructor.push(f);
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
        const notExtending: string[] = [];
        for (const f of files.slice(0, 15)) {
          const extendsCheck = await runRg(['extends APIBaseService', f]);
          if (!extendsCheck) notExtending.push(f);
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
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error checking violations: ${error.message}` }],
        isError: true,
      };
    }
  }
};
