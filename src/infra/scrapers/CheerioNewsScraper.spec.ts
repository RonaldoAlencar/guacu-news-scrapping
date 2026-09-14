import { readFileSync } from "fs";
import path from "path";
import CheerioNewsScraper from "./CheerioNewsScraper";
import { cheerioSources } from "./sources";
import ScrapingHttp from "../http/ScrapingHttp";

function fixture(name: string): string {
  return readFileSync(path.join(__dirname, "__fixtures__", name), "utf8");
}

function scraperFor(source: string): CheerioNewsScraper {
  const config = cheerioSources.find((item) => item.source === source);
  if (!config) {
    throw new Error(`Missing source ${source}`);
  }
  return new CheerioNewsScraper({} as ScrapingHttp, config);
}

describe("CheerioNewsScraper", () => {
  it("parses O Regional listing and strips tracking params", () => {
    const items = scraperFor("O Regional").parse(fixture("oregional.html"));
    expect(items).toHaveLength(2);
    expect(items[0].title).toContain("Semana do Meio Ambiente");
    expect(items[0].source).toBe("O Regional");
    expect(items[1].link).toBe("https://oregional.net/pm-prende-dois-homens-em-mogi-guacu");
    expect(items[1].link).not.toContain("utm_source");
  });

  it("lists O Regional pages for Mogi Guaçu and Mogi Mirim", () => {
    const config = cheerioSources.find((item) => item.source === "O Regional");
    expect(config?.listingUrls(1)).toEqual([
      "https://oregional.net/topico/mogiguacu/",
      "https://oregional.net/topico/mogimirim/",
    ]);
    expect(config?.listingUrls(2)).toEqual([
      "https://oregional.net/topico/mogiguacu/page/2/",
      "https://oregional.net/topico/mogimirim/page/2/",
    ]);
  });

  it("parses Portal da Cidade Mogi Mirim", () => {
    const items = scraperFor("Portal da Cidade Mogi Mirim").parse(fixture("portaldacidade.html"));
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items[0].city).toBe("Mogi Mirim");
    expect(items[0].link).toContain("portaldacidade.com");
    expect(items[0].postedAt).toContain("12/09/2026 18:37");
  });

  it("parses Guaçu Agora Newspaper cards", () => {
    const items = scraperFor("Guaçu Agora").parse(fixture("guacuagora.html"));
    expect(items).toHaveLength(2);
    expect(items[0].title).toContain("Fatec Mogi Mirim");
    expect(items[0].city).toBe("Mogi Mirim");
    expect(items[1].link).toContain("iml-guacuano");
  });

  it("parses Gazeta Guaçuana cards and skips printed editions", () => {
    const items = scraperFor("Gazeta Guaçuana").parse(fixture("gazetaguacuana.html"));
    expect(items).toHaveLength(2);
    expect(items[0].source).toBe("Gazeta Guaçuana");
    expect(items[0].city).toBe("Mogi Guaçu");
    expect(items[0].title).toContain("IML retoma necropsias");
    expect(items[0].link).toBe("https://www.gazetaguacuana.com.br/iml-retoma-necropsias");
    expect(items[0].postedAt).toBe("08/09/2026 11:00");
    expect(items[1].postedAt).toBe("08/09/2026 10:00");
    expect(items.some((item) => item.title.includes("GAZETA GUAÇUANA"))).toBe(false);
  });

  it("keeps only local stories from Tribuna do Guaçu", () => {
    const items = scraperFor("Tribuna do Guaçu").parse(fixture("tribuna.html"));
    expect(items.map((item) => item.title).join(" ")).toContain("FIMI");
    expect(items.map((item) => item.title).join(" ")).toContain("TCESP");
    expect(items[0].title).not.toContain("Evento em Mogi Guaçu espera");
    expect(items.some((item) => item.title.includes("Petrobras"))).toBe(false);
  });

  it("parses O Impacto articles from city tags", () => {
    const items = scraperFor("O Impacto").parse(fixture("impacto.html"));
    expect(items).toHaveLength(2);
    expect(items[0].city).toBe("Mogi Guaçu");
    expect(items[1].city).toBe("Mogi Mirim");
  });
});
