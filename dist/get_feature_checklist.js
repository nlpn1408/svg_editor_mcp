/**
 * Returns a feature development checklist for Clean Architecture.
 * Helps AI/developers follow the correct flow: Domain → Infra → App → UI.
 */
export const getFeatureChecklistTool = {
    name: "get_feature_checklist",
    description: "Get a feature development checklist for Clean Architecture. Use when adding new features to follow Domain → Infra → App → UI flow.",
    inputSchema: {
        type: "object",
        properties: {
            featureName: {
                type: "string",
                description: "Feature name (e.g., 'checkpoint', 'trigger', 'asset-upload')"
            }
        },
        required: ["featureName"]
    },
    handler: async (args) => {
        const { featureName } = args;
        const pascal = featureName
            .split(/[-_]/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join("");
        const checklist = `
📋 Feature Checklist: ${pascal}
${"=".repeat(50)}

## 1. Domain Layer (Priority 1 - TDD first)
□ Entity: src/domain/entities/${featureName}/${pascal}.ts
  - Extend BaseEntity<T>, use static create()
□ Interface: src/domain/repositories/I${pascal}Repository.ts
□ Domain Service (if needed): src/domain/services/${pascal}Service.ts

## 2. Infrastructure Layer
□ Repository: src/infrastructure/repositories/${pascal}Repository.ts
  - Implements I${pascal}Repository
□ Mapper: *_mappers.ts with fromDomainToExternal / fromExternalToDomain

## 3. Application Layer
□ API Service (if external): src/editor/services/${pascal}ApiService.ts
  - Extend APIBaseService, constructor DI
□ Domain Service: src/editor/services/domain/${featureName}/${pascal}Service.ts

## 4. Presentation Layer
□ Component folder: src/editor/components/${featureName}/
  - Container (logic, hooks, data)
  - Presenter (props only, no fetch)
□ Hook: use${pascal}.ts
□ Store (optional): src/editor/stores/${featureName}-store/

## 5. Integration
□ Register in EditorCoreEngine / DI
□ Add tests: *.test.ts next to each layer

## Rules
• Domain: Zero infra/UI deps, I prefix for interfaces
• Container: Logic, hooks; Presenter: Props only
• TDD: Write tests BEFORE implementation
• Undoable actions: Use History.execute(new *Command(...))

💡 See CLAUDE.md and .cursor/skills/tdd-workflow/
`;
        return {
            content: [{ type: "text", text: checklist.trim() }],
        };
    },
};
//# sourceMappingURL=get_feature_checklist.js.map