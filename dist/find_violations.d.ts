export declare const findArchitectureViolationsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            rule: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
    handler: (args: {
        rule: string;
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
//# sourceMappingURL=find_violations.d.ts.map