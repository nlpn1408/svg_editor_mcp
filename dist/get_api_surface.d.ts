export declare const getApiSurfaceTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            serviceName: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler: (args: {
        serviceName: string;
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
//# sourceMappingURL=get_api_surface.d.ts.map