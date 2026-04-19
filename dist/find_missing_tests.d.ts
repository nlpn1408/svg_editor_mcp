export declare const findMissingTestsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            scope: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
    handler: (args: {
        scope: string;
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
//# sourceMappingURL=find_missing_tests.d.ts.map