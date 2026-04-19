export declare const findDomainLogicTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            query: {
                type: string;
                description: string;
            };
            type: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
    handler: (args: {
        query: string;
        type?: string;
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
//# sourceMappingURL=find_domain_logic.d.ts.map