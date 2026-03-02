import { exec as execChildProcess } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const exec = promisify(execChildProcess);

interface EntityRelationships {
  entity: string;
  repository?: string;
  services: string[];
  usedBy: string[];
}

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
  handler: async (args: { entityName: string }) => {
    let { entityName } = args;
    
    // Normalize entity name
    if (!entityName.endsWith('Entity')) {
      entityName = `${entityName}Entity`;
    }

    try {
      const relationships: EntityRelationships = {
        entity: entityName,
        services: [],
        usedBy: []
      };

      // 1. Find entity file
      const entityFile = await exec(
        `rg -l "class ${entityName}" src/domain/entities -g "*.ts" || true`
      );

      if (!entityFile.stdout.trim()) {
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
      const repoInterface = await exec(
        `rg -l "interface I${repoName}" src/domain/repositories -g "*.ts" || true`
      );
      
      if (repoInterface.stdout.trim()) {
        relationships.repository = `I${repoName}`;
      }

      // 3. Find services using this entity
      const servicesUsing = await exec(
        `rg "${entityName}" src/domain/services src/editor/services --files-with-matches -g "*.ts" || true`
      );

      if (servicesUsing.stdout.trim()) {
        relationships.services = servicesUsing.stdout
          .split('\n')
          .filter(Boolean)
          .map(file => file.split('/').pop()?.replace('.ts', '') || '');
      }

      // 4. Find components/containers using this entity (through services/stores)
      const componentsUsing = await exec(
        `rg "${entityName}|${repoName}" src/editor/components src/features --files-with-matches -g "*.{ts,tsx}" || true`
      );

      if (componentsUsing.stdout.trim()) {
        relationships.usedBy = componentsUsing.stdout
          .split('\n')
          .filter(Boolean)
          .map(file => file.split('/').pop()?.replace(/\.(ts|tsx)$/, '') || '');
      }

      // Build relationship diagram
      const lines: string[] = [];
      lines.push(`\n📊 Entity Relationship Map: ${entityName}`);
      lines.push('='.repeat(60));
      lines.push('');
      lines.push('🏛️  Domain Layer:');
      lines.push(`   └─ Entity: ${entityFile.stdout.trim()}`);
      
      if (relationships.repository) {
        lines.push(`   └─ Repository Interface: ${relationships.repository}`);
      }
      lines.push('');

      if (relationships.services.length > 0) {
        lines.push('⚙️  Application Layer (Services):');
        relationships.services.forEach(service => {
          lines.push(`   └─ ${service}`);
        });
        lines.push('');
      }

      if (relationships.usedBy.length > 0) {
        lines.push('🎨 Presentation Layer (Components):');
        relationships.usedBy.slice(0, 10).forEach(component => {
          lines.push(`   └─ ${component}`);
        });
        if (relationships.usedBy.length > 10) {
          lines.push(`   ... and ${relationships.usedBy.length - 10} more`);
        }
        lines.push('');
      }

      lines.push('📈 Data Flow:');
      lines.push(`   ${entityName} (Domain)`);
      if (relationships.repository) {
        lines.push(`   ↓ via ${relationships.repository}`);
      }
      if (relationships.services.length > 0) {
        lines.push(`   ↓ used by ${relationships.services.length} service(s)`);
      }
      if (relationships.usedBy.length > 0) {
        lines.push(`   ↓ consumed by ${relationships.usedBy.length} component(s)`);
      }

      return {
        content: [{ type: "text", text: lines.join('\n') }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error mapping relationships: ${error.message}` }],
        isError: true,
      };
    }
  }
};
