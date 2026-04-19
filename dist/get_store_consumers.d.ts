export declare const getStoreConsumersTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            storeName: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler: (args: {
        storeName: string;
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
//# sourceMappingURL=get_store_consumers.d.ts.map