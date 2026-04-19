export declare const getModuleMapTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            target: {
                type: string;
                description: string;
            };
            detailed: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler: (args: {
        target: string;
        detailed?: boolean;
    }) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
        isError: boolean;
    } | {
        content: {
            type: string;
            text: string;
        }[];
        isError?: undefined;
    }>;
};
//# sourceMappingURL=get_module_map.d.ts.map