#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
const server = new Server({
    name: "project-architect-mcp",
    version: "3.0.0",
}, {
    capabilities: { tools: {} },
});
// Kept tools
import { getModuleMapTool } from "./get_module_map.js";
import { findArchitectureViolationsTool } from "./find_violations.js";
import { getEntityRelationshipsTool } from "./get_entity_relationships.js";
// New high-value tools
import { getEventFlowTool } from "./get_event_flow.js";
import { validateFeatureCompleteTool } from "./validate_feature_complete.js";
import { findMissingTestsTool } from "./find_missing_tests.js";
import { getCommandTraceTool } from "./get_command_trace.js";
import { getStoreConsumersTool } from "./get_store_consumers.js";
import { getApiSurfaceTool } from "./get_api_surface.js";
const ALL_TOOLS = [
    // Navigation & structure
    getModuleMapTool,
    getEntityRelationshipsTool,
    // Event-driven debugging
    getEventFlowTool,
    // Architecture validation
    findArchitectureViolationsTool,
    validateFeatureCompleteTool,
    findMissingTestsTool,
    // Tracing specific patterns
    getCommandTraceTool,
    getStoreConsumersTool,
    getApiSurfaceTool,
];
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: ALL_TOOLS.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
    })),
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = ALL_TOOLS.find(t => t.name === name);
    if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
    }
    try {
        return await tool.handler(args);
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: `Error executing tool "${name}": ${error.message}`
                }],
            isError: true,
        };
    }
});
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("✅ Project Architect MCP Server v3.0.0 running...");
console.error("📦 Tools (9 total):");
ALL_TOOLS.forEach(t => console.error(`  - ${t.name}`));
//# sourceMappingURL=mcp-server.js.map