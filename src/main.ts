import "dotenv/config";
import http from "http";
import cron from "node-cron";
import App from "./application/App";
import Queue from "./domain/adapters/Queue";
import NewsRepository from "./domain/repository/NewsRepository";
import { loadConfig } from "./infra/config/env";
import { HealthCheck, startHealthServer } from "./infra/health/healthServer";
import { pingEvolution } from "./infra/health/pingEvolution";
import { pingRedis } from "./infra/health/pingRedis";
import AxiosAdapter from "./infra/http/AxiosAdapter";
import PlaywrightAdapter from "./infra/http/PlaywrightAdapter";
import ScrapingHttp from "./infra/http/ScrapingHttp";
import ScrapeLock from "./infra/lock/ScrapeLock";
import Logger from "./infra/logger/Logger";
import SendWhatsappMessage from "./infra/messaging/SendWhatsappMessage";
import BullMQ from "./infra/queue/BullMQ";
import LoggingQueue from "./infra/queue/LoggingQueue";
import QueueController from "./infra/queue/QueueController";
import DatabaseConnection from "./infra/repository/DatabaseConnection";
import MemoryNewsRepository from "./infra/repository/MemoryNewsRepository";
import NewsRepositoryDatabase from "./infra/repository/NewsRepositoryDatabase";
import { createScrapers } from "./infra/scrapers/sources";

process.env.TZ = "America/Sao_Paulo";

const logger = new Logger();
const config = loadConfig();
const axiosAdapter = new AxiosAdapter();
const playwrightAdapter = new PlaywrightAdapter();
const scrapingHttp = new ScrapingHttp(axiosAdapter, playwrightAdapter, logger);
const database = new DatabaseConnection(config.mysql, logger);
const scrapeLock = new ScrapeLock(database, logger, config.dryRun);
const bullQueue = new BullMQ(config.redis, logger);
const queue: Queue = config.dryRun ? new LoggingQueue(logger) : bullQueue;
const queueController = new QueueController(
  config,
  new SendWhatsappMessage(axiosAdapter, logger, config.whatsapp),
  logger,
);

let healthServer: http.Server | undefined;
let newsRepository: NewsRepository | undefined;

function healthChecks(): HealthCheck[] {
  if (config.dryRun) {
    return [];
  }
  return [
    {
      name: "mysql",
      check: async () => {
        const pool = await database.getPool();
        await pool.query("SELECT 1");
        return true;
      },
    },
    {
      name: "redis",
      check: () => pingRedis(config.redis),
    },
    {
      name: "evolution",
      check: () => pingEvolution(config.whatsapp),
    },
  ];
}

async function getRepository(): Promise<NewsRepository> {
  if (newsRepository) {
    return newsRepository;
  }
  if (config.dryRun) {
    newsRepository = new MemoryNewsRepository();
    return newsRepository;
  }
  const pool = await database.getPool();
  newsRepository = new NewsRepositoryDatabase(pool);
  return newsRepository;
}

async function scrape(): Promise<void> {
  await scrapeLock.run(async () => {
    const app = new App(
      await getRepository(),
      queue,
      createScrapers(scrapingHttp),
      logger,
      true,
    );
    await app.execute();
    logger.logInfo("Application finished");
  });
}

async function shutdown(signal: string): Promise<void> {
  logger.logInfo(`Shutting down (${signal})`);
  await queueController.close();
  await bullQueue.close();
  await scrapingHttp.close();
  await database.close();
  healthServer?.close();
  process.exit(0);
}

async function bootstrap(): Promise<void> {
  healthServer = startHealthServer(config.healthPort, logger, healthChecks());
  await queue.connect();

  if (!config.dryRun) {
    queueController.setNewsRepository(await getRepository());
    queueController.start();
  } else {
    logger.logInfo("DRY_RUN enabled: skipping MySQL, Redis worker and WhatsApp");
  }

  if (!config.runOnce) {
    cron.schedule(
      "0 8,18 * * *",
      () => {
        logger.logInfo("Running cron job");
        scrape().catch((error) => logger.logError(String(error)));
      },
      { timezone: "America/Sao_Paulo" },
    );
  }

  logger.logInfo("Application started");
  await scrape();

  if (config.runOnce) {
    if (!config.dryRun) {
      await bullQueue.waitUntilEmpty();
    }
    await shutdown("RUN_ONCE");
  }
}

process.on("SIGINT", () => {
  shutdown("SIGINT").catch((error) => logger.logError(String(error)));
});
process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch((error) => logger.logError(String(error)));
});

bootstrap().catch((error) => {
  logger.logError(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
