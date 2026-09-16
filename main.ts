import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import express from "express";
import type { Request, Response } from "express";
import { createServer } from "./server.js";

async function startHttpServer(serverFactory: () => Promise<McpServer>): Promise<void> {
  const port = Number.parseInt(process.env.PORT ?? "3000", 10);
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.all("/mcp", async (request: Request, response: Response) => {
    const server = await serverFactory();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

    response.on("close", () => {
      transport.close().catch(() => undefined);
      server.close().catch(() => undefined);
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(request, response, request.body);
    } catch (error) {
      console.error("MCP request failed", error);
      if (!response.headersSent) {
        response.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null
        });
      }
    }
  });

  app.listen(port, "0.0.0.0", () => {
    console.log(`Compass Now MCP server listening on http://localhost:${port}/mcp`);
  });
}

if (process.argv.includes("--stdio")) {
  const server = await createServer();
  await server.connect(new StdioServerTransport());
} else {
  await startHttpServer(createServer);
}