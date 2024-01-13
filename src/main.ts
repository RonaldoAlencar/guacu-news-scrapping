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
import KafkaAdapter from './infra/adapter/Queue/KafkaAdapter';
const logger = new Logger();

cron.schedule('0 * * * *', () => {
  logger.logInfo('Running cron job');
  main();
});

(async () => {  
  const queue2 = new KafkaAdapter(logger);
  await queue2.connect('consumer-2');
  new QueueController(queue2, new SendWhatsappMessage(new AxiosAdapter(), logger));
})();


async function main() {
  const cloudscrapperAdapter = new CloudscrapperAdapter();
  const queue = new KafkaAdapter(logger);
  await queue.connect('publisher');

  const adapters: NewsScrapperAdapter[] = [
    new ORegionalNewsScrapperAdapter(cloudscrapperAdapter),
    new PortalDaCidadeMogiMirimNewsScrapperAdapter(cloudscrapperAdapter),
    new GuacuAgoraAdapter(cloudscrapperAdapter),
    new PortalTribunaDoGuacuScrapper(cloudscrapperAdapter)
  ];

  const app = new App(
    new NewsRepositoryDatabase(await new DatabaseConnection('localhost','root','root','news', logger).getConnection()),
    queue,
    adapters,
    logger
  );
  await app.execute();
  logger.logInfo(`Application finished`);
}

logger.logInfo(`Application started`);
main();
