import "dotenv/config";

export type EnvSource = Record<string, string | undefined>;

function read(source: EnvSource, name: string, fallback?: string): string {
  return source[name] ?? fallback ?? "";
}

function required(source: EnvSource, name: string): string {
  const value = read(source, name).trim();
  if (!value) {
    throw new Error(`Missing required env ${name}`);
  }
  return value;
}

export type AppConfig = {
  mysql: {
    host: string;
    user: string;
    password: string;
    database: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  whatsapp: {
    groupId: string;
    instanceName: string;
    apiKey: string;
    apiUrl: string;
  };
  healthPort: number;
  sendDelayMs: number;
  dryRun: boolean;
  runOnce: boolean;
};

export function whatsappDestination(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes("@")) {
    return trimmed;
  }
  if (/^\d{15,}$/.test(trimmed)) {
    return `${trimmed}@g.us`;
  }
  return trimmed;
}

export function loadConfig(source: EnvSource = process.env): AppConfig {
  const dryRun = source.DRY_RUN === "true";
  const redisPassword = read(source, "REDIS_PASSWORD").trim();

  const config: AppConfig = {
    mysql: {
      host: read(source, "MYSQL_HOST", "127.0.0.1"),
      user: read(source, "MYSQL_USER", "root"),
      password: read(source, "MYSQL_PASSWORD", dryRun ? "root" : ""),
      database: read(source, "MYSQL_DATABASE", "news"),
    },
    redis: {
      host: read(source, "REDIS_HOST", "127.0.0.1"),
      port: Number(source.REDIS_PORT || 6379),
      password: redisPassword ? redisPassword : undefined,
      db: Number(source.REDIS_DB || 0),
    },
    whatsapp: {
      groupId: whatsappDestination(read(source, "WHATSAPP_GROUP_ID")),
      instanceName: read(source, "WHATSAPP_INSTANCE_NAME"),
      apiKey: read(source, "WHATSAPP_API_KEY"),
      apiUrl: read(source, "WHATSAPP_API_URL").replace(/\/$/, ""),
    },
    healthPort: Number(source.HEALTH_PORT || 3000),
    sendDelayMs: Number(source.SEND_DELAY_MS || 4000),
    dryRun,
    runOnce: source.RUN_ONCE === "true" || dryRun,
  };

  if (!dryRun) {
    config.whatsapp.groupId = whatsappDestination(required(source, "WHATSAPP_GROUP_ID"));
    config.whatsapp.instanceName = required(source, "WHATSAPP_INSTANCE_NAME");
    config.whatsapp.apiKey = required(source, "WHATSAPP_API_KEY");
    config.whatsapp.apiUrl = required(source, "WHATSAPP_API_URL").replace(/\/$/, "");
    config.mysql.host = required(source, "MYSQL_HOST");
    config.mysql.user = required(source, "MYSQL_USER");
    config.mysql.password = read(source, "MYSQL_PASSWORD");
    config.mysql.database = required(source, "MYSQL_DATABASE");
    config.redis.host = required(source, "REDIS_HOST");
  }

  return config;
}
