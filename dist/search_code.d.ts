export declare const searchCodeTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            query: {
                type: string;
                description: string;
            };
            layer: {
                type: string;
                enum: string[];
                description: string;
            };
            fileType: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
    handler: (args: {
        query: string;
        layer?: string;
        fileType?: string;
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
//# sourceMappingURL=search_code.d.ts.map