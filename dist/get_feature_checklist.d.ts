/**
 * Returns a feature development checklist for Clean Architecture.
 * Helps AI/developers follow the correct flow: Domain → Infra → App → UI.
 */
export declare const getFeatureChecklistTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            featureName: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler: (args: {
        featureName: string;
    }) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
//# sourceMappingURL=get_feature_checklist.d.ts.map