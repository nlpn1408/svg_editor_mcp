export declare const getEventFlowTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            eventName: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler: (args: {
        eventName: string;
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
//# sourceMappingURL=get_event_flow.d.ts.map