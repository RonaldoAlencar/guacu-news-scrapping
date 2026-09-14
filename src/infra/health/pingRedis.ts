import net from "net";
import { AppConfig } from "../config/env";

export function pingRedis(config: AppConfig["redis"], timeoutMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host: config.host, port: config.port });
    let settled = false;

    const finish = (ok: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      socket.destroy();
      resolve(ok);
    };

    socket.setTimeout(timeoutMs);
    socket.on("connect", () => {
      const commands: string[] = [];
      if (config.password) {
        commands.push(`AUTH ${config.password}`);
      }
      if (config.db) {
        commands.push(`SELECT ${config.db}`);
      }
      commands.push("PING");
      socket.write(`${commands.join("\r\n")}\r\n`);
    });
    socket.on("data", (buffer) => {
      finish(buffer.toString().includes("PONG"));
    });
    socket.on("timeout", () => finish(false));
    socket.on("error", () => finish(false));
  });
}
