import dotenv from 'dotenv'; 
dotenv.config();
import QueueController from "./infra/adapter/Queue/QueueController";
import CloudscrapperAdapter from "./infra/adapter/cloudscrapper/CloudscrapperAdapter";
import ORegionalNewsScrapperAdapter from "./infra/adapter/news-scrapper/cheerio/ORegionalNewsScrapperAdapter";
import PortalDaCidadeMogiMirimNewsScrapperAdapter from "./infra/adapter/news-scrapper/cheerio/PortalDaCidadeMogiMirimNewsScrapperAdapter";
import DatabaseConnection from "./infra/repository/DatabaseConnection";
import NewsRepositoryDatabase from "./infra/repository/NewsRepositoryDatabase";
import cron from 'node-cron';
import AxiosAdapter from "./infra/adapter/axios/AxiosAdapter";
import GuacuAgoraAdapter from "./infra/adapter/news-scrapper/cheerio/GuacuAgoraAdapter";
import PortalTribunaDoGuacuScrapper from "./infra/adapter/news-scrapper/cheerio/PortalTribunaDoGuacuScrapperAdapter";
import NewsScrapperAdapter from './domain/adapters/NewsScrapperAdapter';
import Logger from './infra/adapter/Logger/Logger';
import App from './application/App';
import SendWhatsappMessage from './infra/adapter/message-sender/SendWhatsappMessage';
import BullMQ from './infra/adapter/Queue/BullMQ';
const logger = new Logger();

cron.schedule('0 8,18 * * *', () => {
  logger.logInfo('Running cron job');
  main();
});

(async () => {  
  const queue2 = new BullMQ(logger);
  await queue2.connect('news');
  new QueueController(queue2, new SendWhatsappMessage(new AxiosAdapter(), logger));
})();


async function main() {
  const cloudscrapperAdapter = new CloudscrapperAdapter();
  const queue = new BullMQ(logger);
  queue.connect('news');

  const adapters: NewsScrapperAdapter[] = [
    new ORegionalNewsScrapperAdapter(cloudscrapperAdapter),
    new PortalDaCidadeMogiMirimNewsScrapperAdapter(cloudscrapperAdapter),
    new GuacuAgoraAdapter(cloudscrapperAdapter),
    new PortalTribunaDoGuacuScrapper(cloudscrapperAdapter)
  ];

  const app = new App(
    new NewsRepositoryDatabase(
      await new DatabaseConnection(
        process.env.MYSQL_HOST || 'localhost',
        process.env.MYSQL_USER || 'root',
        process.env.MYSQL_PASSWORD || 'root',
        process.env.MYSQL_DATABASE || 'news',
        logger
      ).getConnection()
    ),
    queue,
    adapters,
    logger
  );
  await app.execute();
  logger.logInfo(`Application finished`);
}

logger.logInfo(`Application started`);
main();
