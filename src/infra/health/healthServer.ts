import http from "http";
import LoggerAdapter from "../../domain/adapters/LoggerAdapter";

export type HealthCheck = {
  name: string;
  check: () => Promise<boolean>;
};

export type HealthSnapshot = {
  status: "ok" | "degraded";
  checks: Record<string, "ok" | "error">;
};

export async function collectHealth(checks: HealthCheck[]): Promise<HealthSnapshot> {
  const result: HealthSnapshot = { status: "ok", checks: {} };
  await Promise.all(
    checks.map(async (item) => {
      try {
        result.checks[item.name] = (await item.check()) ? "ok" : "error";
      } catch {
        result.checks[item.name] = "error";
      }
      if (result.checks[item.name] === "error") {
        result.status = "degraded";
      }
    }),
  );
  return result;
}

export function startHealthServer(
  port: number,
  logger: LoggerAdapter,
  checks: HealthCheck[] = [],
): http.Server {
  const server = http.createServer((request, response) => {
    if (request.url !== "/health") {
      response.writeHead(404);
      response.end();
      return;
    }

    collectHealth(checks)
      .then((snapshot) => {
        response.writeHead(snapshot.status === "ok" ? 200 : 503, {
          "Content-Type": "application/json",
        });
        response.end(JSON.stringify(snapshot));
      })
      .catch((error) => {
        logger.logError(error instanceof Error ? error.message : String(error));
        response.writeHead(503, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ status: "degraded", checks: {} }));
      });
  });

  server.listen(port, () => {
    logger.logInfo(`Health server listening on :${port}/health`);
  });

  return server;
}
