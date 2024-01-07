import GetNews from "./domain/usecase/GetNews";
import QueueController from "./infra/adapter/Queue/QueueController";
import RabbitMQAdapter from "./infra/adapter/Queue/RabbitMQAdapter";
import CloudscrapperAdapter from "./infra/adapter/cloudscrapper/CloudscrapperAdapter";
import SendTelegramMessage from "./infra/adapter/message-sender/SendTelegramMessage";
import ORegionalNewsScrapperAdapter from "./infra/adapter/news-scrapper/cheerio/ORegionalNewsScrapperAdapter";
import PortalDaCidadeMogiMirimNewsScrapperAdapter from "./infra/adapter/news-scrapper/cheerio/PortalDaCidadeMogiMirimNewsScrapperAdapter";
import dotenv from 'dotenv'; 
dotenv.config();
import DatabaseConnection from "./infra/repository/DatabaseConnection";
import NewsRepositoryDatabase from "./infra/repository/NewsRepositoryDatabase";
import cron from 'node-cron';
import formatDate from "./utils/formatDate";

cron.schedule('* 1 * * *', () => {
  console.log(`[${formatDate(new Date())}] running a task every hour`);
  main();
});

async function main() {
  const cloudscrapperAdapter = new CloudscrapperAdapter();
  const databaseConnection = new DatabaseConnection('localhost','root','root','news');
  const newsRepository = new NewsRepositoryDatabase(await databaseConnection.getConnection());
  const queue = new RabbitMQAdapter();
  await queue.connect();
  const sendTelegramMessage = new SendTelegramMessage();
  new QueueController(queue, sendTelegramMessage);
  const oRegionalNewsScrapperAdapter = new ORegionalNewsScrapperAdapter(cloudscrapperAdapter);
  const PortalDaCidadeMogiMirimAdapter = new PortalDaCidadeMogiMirimNewsScrapperAdapter(cloudscrapperAdapter);

  const oRegionalNews = new GetNews(newsRepository, oRegionalNewsScrapperAdapter, queue);
  const portalDaCidadeMogiMirimNews = new GetNews(newsRepository, PortalDaCidadeMogiMirimAdapter, queue);

  const useCasesPromises = Promise.all([ oRegionalNews.execute(), portalDaCidadeMogiMirimNews.execute() ]);
  await useCasesPromises;
}

console.log(`[${formatDate(new Date())}] application started`);