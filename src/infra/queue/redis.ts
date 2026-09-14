import { ConnectionOptions } from "bullmq";
import { AppConfig } from "../config/env";

export function redisConnection(config: AppConfig["redis"]): ConnectionOptions {
  return {
    host: config.host,
    port: config.port,
    password: config.password,
    db: config.db,
  };
}
