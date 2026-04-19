export declare const validateFeatureCompleteTool: {
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
        isError?: undefined;
    } | {
        content: {
            type: string;
            text: string;
        }[];
        isError: boolean;
    }>;
};
//# sourceMappingURL=validate_feature_complete.d.ts.map