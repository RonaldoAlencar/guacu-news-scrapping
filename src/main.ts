import GetNews from "./domain/usecase/GetNews";
import RabbitMQAdapter from "./infra/adapter/Queue/RabbitMQAdapter";
import CloudscrapperAdapter from "./infra/adapter/cloudscrapper/CloudscrapperAdapter";
import ORegionalNewsScrapperAdapter from "./infra/adapter/news-scrapper/cheerio/ORegionalNewsScrapperAdapter";
import PortalDaCidadeMogiMirimNewsScrapperAdapter from "./infra/adapter/news-scrapper/cheerio/PortalDaCidadeMogiMirimNewsScrapperAdapter";
import DatabaseConnection from "./infra/repository/DatabaseConnection";
import NewsRepositoryDatabase from "./infra/repository/NewsRepositoryDatabase";

async function main() {
  const cloudscrapperAdapter = new CloudscrapperAdapter();
  const databaseConnection = new DatabaseConnection('localhost','root','root','news');
  const newsRepository = new NewsRepositoryDatabase(await databaseConnection.getConnection());

  const queue = new RabbitMQAdapter();
  await queue.connect();
  const oRegionalNewsScrapperAdapter = new ORegionalNewsScrapperAdapter(cloudscrapperAdapter);
  const PortalDaCidadeMogiMirimAdapter = new PortalDaCidadeMogiMirimNewsScrapperAdapter(cloudscrapperAdapter);

  const oRegionalNews = new GetNews(newsRepository, oRegionalNewsScrapperAdapter, queue);
  const portalDaCidadeMogiMirimNews = new GetNews(newsRepository, PortalDaCidadeMogiMirimAdapter, queue);

  const useCasesPromises = Promise.all([ oRegionalNews.execute(), portalDaCidadeMogiMirimNews.execute() ]);
  await useCasesPromises;
}

main();
