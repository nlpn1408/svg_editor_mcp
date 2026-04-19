export declare const getCommandTraceTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            commandName: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler: (args: {
        commandName: string;
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
//# sourceMappingURL=get_command_trace.d.ts.map