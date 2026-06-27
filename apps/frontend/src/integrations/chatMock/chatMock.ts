import type { Plugin } from "vite";

import { buildMockReply } from "./utils/buildMockReply/buildMockReply";
import { readBody } from "./utils/readBody/readBody";

export const chatMock = (): Plugin => ({
  name: "chat-mock",
  apply: "serve",
  enforce: "pre",
  configureServer(server) {
    server.middlewares.use("/api/chat", async (req, res, next) => {
      if (req.method !== "POST") {
        next();
        return;
      }

      const raw = await readBody(req);
      const requestBody = raw === "" ? { messages: [] } : JSON.parse(raw);
      const result = buildMockReply(requestBody);
      const responseBody = JSON.stringify(result.body);
      res.statusCode = result.status;
      res.setHeader("content-type", "application/json");
      res.end(responseBody);
    });
  },
});
