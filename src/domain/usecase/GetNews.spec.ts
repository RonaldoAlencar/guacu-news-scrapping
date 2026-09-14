import GetNews from "./GetNews";
import NewsRepository from "../repository/NewsRepository";
import Queue from "../adapters/Queue";
import NewsScrapperAdapter from "../adapters/NewsScrapperAdapter";
import News from "../entities/News";
import { NewsItem } from "../entities/NewsItem";

describe("GetNews", () => {
  const item: NewsItem = {
    title: "Feira em Mogi Guaçu",
    link: "https://oregional.net/feira?utm_source=home",
    postedAt: "11/09/2026",
    source: "O Regional",
    city: "Mogi Guaçu",
  };

  function setup(existing: News | null = null) {
    const store = new Map<string, News>();
    if (existing) {
      store.set(existing.link, existing);
    }
    const saved: News[] = [];
    const published: News[] = [];
    const marked: string[] = [];
    const repository: NewsRepository = {
      save: async (news) => {
        saved.push(news);
        store.set(news.link, news);
      },
      findByNewsLink: async (link) => store.get(link) ?? null,
      markPublished: async (link) => {
        marked.push(link);
        const current = store.get(link);
        if (current) {
          store.set(link, News.fromItem(current.toItem(), current.id, true));
        }
      },
    };
    const queue: Queue = {
      connect: async () => undefined,
      publish: async (news) => {
        published.push(news);
      },
      close: async () => undefined,
    };
    const scraper: NewsScrapperAdapter = {
      source: "O Regional",
      scrap: async () => [item, { ...item, title: " ", link: "" }],
    };
    return { repository, queue, scraper, saved, published, marked, store };
  }

  it("normalizes the link, skips empties and publishes new items", async () => {
    const { repository, queue, scraper, saved, published, marked } = setup();
    const savedCount = await new GetNews(repository, scraper, queue).execute();

    expect(savedCount).toBe(1);
    expect(saved[0].link).toBe("https://oregional.net/feira");
    expect(published).toHaveLength(1);
    expect(marked).toEqual([]);
  });

  it("skips news that were already published", async () => {
    const existing = News.fromItem({ ...item, link: "https://oregional.net/feira" }, "", true);
    const { repository, queue, scraper, saved, published } = setup(existing);
    const savedCount = await new GetNews(repository, scraper, queue).execute();

    expect(savedCount).toBe(0);
    expect(saved).toHaveLength(0);
    expect(published).toHaveLength(0);
  });

  it("retries publish when the row exists but was not queued", async () => {
    const existing = News.fromItem({ ...item, link: "https://oregional.net/feira" }, "1", false);
    const { repository, queue, scraper, saved, published, marked } = setup(existing);
    const savedCount = await new GetNews(repository, scraper, queue).execute();

    expect(savedCount).toBe(1);
    expect(saved).toHaveLength(0);
    expect(published).toHaveLength(1);
    expect(marked).toEqual([]);
  });

  it("does not mark published if the queue fails", async () => {
    const { repository, scraper, marked } = setup();
    const queue: Queue = {
      connect: async () => undefined,
      publish: async () => {
        throw new Error("redis down");
      },
      close: async () => undefined,
    };

    await expect(new GetNews(repository, scraper, queue).execute()).rejects.toThrow("redis down");
    expect(marked).toHaveLength(0);
  });

  it("can skip publishing", async () => {
    const { repository, queue, scraper, saved, published, marked } = setup();
    await new GetNews(repository, scraper, queue, false).execute();
    expect(saved).toHaveLength(1);
    expect(published).toHaveLength(0);
    expect(marked).toHaveLength(0);
  });
});
