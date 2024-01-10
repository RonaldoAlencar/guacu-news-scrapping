import dotenv from 'dotenv'; 
dotenv.config();
import QueueController from "./infra/adapter/Queue/QueueController";
import RabbitMQAdapter from "./infra/adapter/Queue/RabbitMQAdapter";
import CloudscrapperAdapter from "./infra/adapter/cloudscrapper/CloudscrapperAdapter";
import SendTelegramMessage from "./infra/adapter/message-sender/SendTelegramMessage";
import ORegionalNewsScrapperAdapter from "./infra/adapter/news-scrapper/cheerio/ORegionalNewsScrapperAdapter";
import PortalDaCidadeMogiMirimNewsScrapperAdapter from "./infra/adapter/news-scrapper/cheerio/PortalDaCidadeMogiMirimNewsScrapperAdapter";
import DatabaseConnection from "./infra/repository/DatabaseConnection";
import NewsRepositoryDatabase from "./infra/repository/NewsRepositoryDatabase";
import cron from 'node-cron';
import formatDate from "./utils/formatDate";
import AxiosAdapter from "./infra/adapter/axios/AxiosAdapter";
import App from "./application/app";
import GuacuAgoraAdapter from "./infra/adapter/news-scrapper/cheerio/GuacuAgoraAdapter";
import PortalTribunaDoGuacuScrapper from "./infra/adapter/news-scrapper/cheerio/PortalTribunaDoGuacuScrapperAdapter";
import NewsScrapperAdapter from './domain/adapters/NewsScrapperAdapter';

cron.schedule('0 * * * *', () => {
  console.log(`[${formatDate(new Date())}] running a task every hour`);
  main();
});

(async () => {
  const queue = new RabbitMQAdapter();
  await queue.connect('telegram-message-sender');
  new QueueController(queue, new SendTelegramMessage(new AxiosAdapter()));
})();

async function main() {
  const cloudscrapperAdapter = new CloudscrapperAdapter();
  const queue = new RabbitMQAdapter();
  await queue.connect('news-scrapper');

  const adapters: NewsScrapperAdapter[] = [
    new ORegionalNewsScrapperAdapter(cloudscrapperAdapter),
    new PortalDaCidadeMogiMirimNewsScrapperAdapter(cloudscrapperAdapter),
    new GuacuAgoraAdapter(cloudscrapperAdapter),
    new PortalTribunaDoGuacuScrapper(cloudscrapperAdapter)
  ];

  const app = new App(
    new NewsRepositoryDatabase(await new DatabaseConnection('localhost','root','root','news').getConnection()),
    queue,
    adapters
  );
  await app.execute();
}

console.log(`[${formatDate(new Date())}] application started`);
main();
