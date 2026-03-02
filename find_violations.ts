import { exec as execChildProcess } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execChildProcess);

export const findArchitectureViolationsTool = {
  name: "find_architecture_violations",
  description: "Detect violations of Clean Architecture rules (e.g., domain importing infrastructure, business logic in components, missing DI patterns).",
  inputSchema: {
    type: "object",
    properties: {
      rule: {
        type: "string",
        enum: ["domain-purity", "container-presenter", "di-pattern", "naming-convention", "all"],
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
        // Check: Domain importing infrastructure or editor
        const domainImportsInfra = await exec(
          `rg "from ['\"]@/(infrastructure|editor)" src/domain --files-with-matches -g "*.ts" || true`
        );
        
        if (domainImportsInfra.stdout.trim()) {
          violations.push('❌ Domain Purity Violation:');
          violations.push('Domain layer imports infrastructure/editor:');
          violations.push(domainImportsInfra.stdout);
          violations.push('');
        }

        // Check: Domain importing external libs (except base types)
        const domainImportsExternal = await exec(
          `rg "^import .* from ['\"][^@./]" src/domain --files-with-matches -g "*.ts" | grep -v "BaseEntity\\|types" || true`
        );
        
        if (domainImportsExternal.stdout.trim()) {
          violations.push('⚠️  Domain importing external libraries:');
          violations.push(domainImportsExternal.stdout);
          violations.push('');
        }
      }

      if (rule === 'container-presenter' || rule === 'all') {
        // Check: fetch/axios in Presenter components
        const fetchInPresenters = await exec(
          `rg "(fetch\\(|axios\\.|useQuery)" src/editor/components --vimgrep -g "*Presenter*.tsx" -g "*Presenter.tsx" || true`
        );
        
        if (fetchInPresenters.stdout.trim()) {
          violations.push('❌ Container/Presenter Violation:');
          violations.push('Presenters contain data fetching logic:');
          violations.push(fetchInPresenters.stdout);
          violations.push('');
        }
      }

      if (rule === 'di-pattern' || rule === 'all') {
        // Check: Services without constructor DI
        const servicesWithoutDI = await exec(
          `rg "class \\w+Service" src/domain/services src/editor/services -A 5 -g "*.ts" | rg -v "constructor\\(" || true`
        );
        
        if (servicesWithoutDI.stdout.trim()) {
          violations.push('⚠️  Services possibly missing constructor DI:');
          violations.push(servicesWithoutDI.stdout);
          violations.push('');
        }
      }

      if (rule === 'naming-convention' || rule === 'all') {
        // Check: Domain interfaces without I prefix
        const interfacesWithoutI = await exec(
          `rg "interface \\w+Repository" src/domain/repositories -g "*.ts" | grep -v "interface I" || true`
        );
        
        if (interfacesWithoutI.stdout.trim()) {
          violations.push('⚠️  Domain interfaces without I prefix:');
          violations.push(interfacesWithoutI.stdout);
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
