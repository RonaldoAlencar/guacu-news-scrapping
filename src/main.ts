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
import AxiosAdapter from "./infra/adapter/axios/AxiosAdapter";
import PortalTribunaDoGuacuScrapperAdapter from "./infra/adapter/news-scrapper/cheerio/PortalTribunaDoGuacuScrapperAdapter";
import GuacuAgoraAdapter from "./infra/adapter/news-scrapper/cheerio/GuacuAgoraAdapter";

cron.schedule('0 * * * *', () => {
  console.log(`[${formatDate(new Date())}] running a task every hour`);
  main();
});

async function main() {
  const cloudscrapperAdapter = new CloudscrapperAdapter();
  const databaseConnection = new DatabaseConnection('localhost','root','root','news');
  const newsRepository = new NewsRepositoryDatabase(await databaseConnection.getConnection());
  const queue = new RabbitMQAdapter();
  await queue.connect();
  const sendTelegramMessage = new SendTelegramMessage(new AxiosAdapter());
  new QueueController(queue, sendTelegramMessage);

  const oRegionalNewsScrapperAdapter = new ORegionalNewsScrapperAdapter(cloudscrapperAdapter);
  const portalDaCidadeMogiMirimAdapter = new PortalDaCidadeMogiMirimNewsScrapperAdapter(cloudscrapperAdapter);
  const guacuAgoraAdapter = new GuacuAgoraAdapter(cloudscrapperAdapter);
  const portalTribunaDoGuacuAdapter = new PortalTribunaDoGuacuScrapperAdapter(cloudscrapperAdapter);

  const oRegionalNews = new GetNews(newsRepository, oRegionalNewsScrapperAdapter, queue);
  const portalDaCidadeMogiMirimNews = new GetNews(newsRepository, portalDaCidadeMogiMirimAdapter, queue);
  const guacuAgoraNews = new GetNews(newsRepository, guacuAgoraAdapter, queue);
  const portalTribunaDoGuacuNews = new GetNews(newsRepository, portalTribunaDoGuacuAdapter, queue);

  const useCasesPromises = Promise.all([ 
    oRegionalNews.execute(), 
    portalDaCidadeMogiMirimNews.execute(), 
    guacuAgoraNews.execute(),
    portalTribunaDoGuacuNews.execute(),
  ]).catch((err) => {
    console.log(err);
  });
  await useCasesPromises;
}

console.log(`[${formatDate(new Date())}] application started`);
main();
