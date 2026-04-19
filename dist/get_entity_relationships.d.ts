export declare const getEntityRelationshipsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            entityName: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler: (args: {
        entityName: string;
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
//# sourceMappingURL=get_entity_relationships.d.ts.map