#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server({
  name: "project-architect-mcp",
  version: "2.1.0",
}, {
  capabilities: { tools: {} },
});

// Import all tools
import { getModuleMapTool } from "./get_module_map.js";
import { searchCodeTool } from "./search_code.js";
import { findDomainLogicTool } from "./find_domain_logic.js";
import { findArchitectureViolationsTool } from "./find_violations.js";
import { getEntityRelationshipsTool } from "./get_entity_relationships.js";
import { getFeatureChecklistTool } from "./get_feature_checklist.js";

// Define all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: searchCodeTool.name,
      description: searchCodeTool.description,
      inputSchema: searchCodeTool.inputSchema as any,
    },
    {
      name: getModuleMapTool.name,
      description: getModuleMapTool.description,
      inputSchema: getModuleMapTool.inputSchema as any,
    },
    {
      name: findDomainLogicTool.name,
      description: findDomainLogicTool.description,
      inputSchema: findDomainLogicTool.inputSchema as any,
    },
    {
      name: findArchitectureViolationsTool.name,
      description: findArchitectureViolationsTool.description,
      inputSchema: findArchitectureViolationsTool.inputSchema as any,
    },
    {
      name: getEntityRelationshipsTool.name,
      description: getEntityRelationshipsTool.description,
      inputSchema: getEntityRelationshipsTool.inputSchema as any,
    },
    {
      name: getFeatureChecklistTool.name,
      description: getFeatureChecklistTool.description,
      inputSchema: getFeatureChecklistTool.inputSchema as any,
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case searchCodeTool.name:
        return await searchCodeTool.handler(args as any);
      
      case getModuleMapTool.name:
        return await getModuleMapTool.handler(args as any);
      
      case findDomainLogicTool.name:
        return await findDomainLogicTool.handler(args as any);
      
      case findArchitectureViolationsTool.name:
        return await findArchitectureViolationsTool.handler(args as any);
      
      case getEntityRelationshipsTool.name:
        return await getEntityRelationshipsTool.handler(args as any);
      
      case getFeatureChecklistTool.name:
        return await getFeatureChecklistTool.handler(args as any);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{ 
        type: "text", 
        text: `Error executing tool "${name}": ${error.message}` 
      }],
      isError: true,
    };
  }
});

// Run server via stdio
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("✅ Project Architect MCP Server v2.1.0 running...");
console.error("📦 Available tools:");
console.error("  - search_code: Search by architecture layer");
console.error("  - get_module_map: Map architecture structure");
console.error("  - find_domain_logic: Find business logic");
console.error("  - find_architecture_violations: Detect rule violations");
console.error("  - get_entity_relationships: Map entity dependencies");
console.error("  - get_feature_checklist: Feature development checklist");
