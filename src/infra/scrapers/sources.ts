import NewsScrapperAdapter from "../../domain/adapters/NewsScrapperAdapter";
import ScrapingHttp from "../http/ScrapingHttp";
import CheerioNewsScraper, { CheerioSourceConfig } from "./CheerioNewsScraper";
import RssNewsScraper, { RssSourceConfig } from "./RssNewsScraper";

export const cheerioSources: CheerioSourceConfig[] = [
  {
    source: "O Regional",
    city: "Mogi Guaçu",
    http: "axios",
    pages: 3,
    baseUrl: "https://oregional.net",
    listingUrls: (page) => {
      const suffix = page === 1 ? "" : `page/${page}/`;
      return [
        `https://oregional.net/topico/mogiguacu/${suffix}`,
        `https://oregional.net/topico/mogimirim/${suffix}`,
      ];
    },
    itemSelector: "#main-content li.item, #main-content li",
    titleSelector: "h4.title a, h4 a, .title a",
    linkSelector: "h4.title a, h4 a, .title a",
    dateSelector: ".post-date",
  },
  {
    source: "Portal da Cidade Mogi Mirim",
    city: "Mogi Mirim",
    http: "playwright",
    pages: 1,
    baseUrl: "https://mogimirim.portaldacidade.com",
    listingUrls: () => ["https://mogimirim.portaldacidade.com/noticias"],
    itemSelector: "section article .js-results .news-flex a",
    titleSelector: "h2",
    linkSelector: ".",
    dateSelector: ".news-item--post-date, time",
  },
  {
    source: "Guaçu Agora",
    city: "Mogi Guaçu",
    http: "playwright",
    pages: 3,
    baseUrl: "https://guacuagora.com.br",
    listingUrls: (page) =>
      page === 1 ? ["https://guacuagora.com.br/"] : [`https://guacuagora.com.br/page/${page}/`],
    itemSelector: ".td-module-container, article",
    titleSelector: ".entry-title a, .td-module-title a, h2 a, h3 a",
    linkSelector: ".entry-title a, .td-module-title a, h2 a, h3 a",
    dateSelector: ".entry-date, time",
  },
  {
    source: "Gazeta Guaçuana",
    city: "Mogi Guaçu",
    http: "playwright",
    pages: 1,
    baseUrl: "https://www.gazetaguacuana.com.br",
    listingUrls: () => ["https://www.gazetaguacuana.com.br/"],
    itemSelector: ".vw-post-box",
    titleSelector: "h3.vw-post-box-title a",
    linkSelector: "h3.vw-post-box-title a",
    dateSelector: ".vw-post-date, time, meta[itemprop='datePublished']",
  },
  {
    source: "Tribuna do Guaçu",
    city: "Mogi Guaçu",
    http: "axios",
    pages: 3,
    baseUrl: "https://portaltribunadoguacu.com.br",
    listingUrls: (page) => [`https://portaltribunadoguacu.com.br/noticias/page-${page}`],
    itemSelector: ".box-listar article",
    titleSelector: ".row_1 h2, .row_1",
    linkSelector: "a",
    dateSelector: ".row_4 time, .row_4",
    extraSelector: ".row_2, .row_3",
    cityFilter: true,
  },
  {
    source: "O Impacto",
    city: "Mogi Guaçu",
    http: "axios",
    pages: 2,
    baseUrl: "https://oimpactomogi.com.br",
    listingUrls: (page) => {
      const suffix = page > 1 ? `page/${page}/` : "";
      return [
        `https://oimpactomogi.com.br/tag/mogi-guacu/${suffix}`,
        `https://oimpactomogi.com.br/tag/mogi-mirim/${suffix}`,
      ];
    },
    itemSelector: ".archive-section-content, article",
    titleSelector: "h4.news-title a, .news-title a, h2 a, h3 a, .entry-title a",
    linkSelector: "h4.news-title a, .news-title a, h2 a, h3 a, .entry-title a",
    dateSelector: "time.entry-date.published, time.entry-date, time, .posted-on",
  },
];

export const rssSources: RssSourceConfig[] = [
  {
    source: "Mogi Guaçu Acontece",
    city: "Mogi Guaçu",
    url: "https://mogiguacuacontece.com.br/feed/",
  },
  {
    source: "G1 Campinas",
    city: "Campinas e Região",
    url: "https://g1.globo.com/rss/g1/sp/campinas-regiao/",
    cityFilter: true,
  },
  {
    source: "CBN Campinas",
    city: "Campinas e Região",
    url: "https://cbncampinas.com.br/feed/",
    cityFilter: true,
  },
];

export function createScrapers(http: ScrapingHttp): NewsScrapperAdapter[] {
  return [
    ...cheerioSources.map((config) => new CheerioNewsScraper(http, config)),
    ...rssSources.map((config) => new RssNewsScraper(http, config)),
  ];
}
