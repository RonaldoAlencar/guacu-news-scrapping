import { readFileSync } from "fs";
import path from "path";
import RssNewsScraper from "./RssNewsScraper";
import { rssSources } from "./sources";
import ScrapingHttp from "../http/ScrapingHttp";

function fixture(name: string): string {
  return readFileSync(path.join(__dirname, "__fixtures__", name), "utf8");
}

function scraperFor(source: string): RssNewsScraper {
  const config = rssSources.find((item) => item.source === source);
  if (!config) {
    throw new Error(`Missing source ${source}`);
  }
  return new RssNewsScraper({} as ScrapingHttp, config);
}

describe("RssNewsScraper", () => {
  it("parses Mogi Guaçu Acontece feed", () => {
    const items = scraperFor("Mogi Guaçu Acontece").parse(fixture("acontece.xml"));
    expect(items).toHaveLength(2);
    expect(items[0].title).toContain("PAT divulga 85 vagas");
    expect(items[0].source).toBe("Mogi Guaçu Acontece");
    expect(items[0].city).toBe("Mogi Guaçu");
    expect(items[0].postedAt).toBe("12/09/2026 20:23");
  });

  it("keeps only G1 items about Mogi Guaçu or Mogi Mirim", () => {
    const items = scraperFor("G1 Campinas").parse(fixture("g1.xml"));
    expect(items).toHaveLength(2);
    expect(items.some((item) => item.title.includes("Campinas"))).toBe(false);
    expect(items[0].city).toBe("Mogi Guaçu");
    expect(items[1].city).toBe("Mogi Mirim");
  });

  it("keeps only CBN Campinas items about the Baixa Mogiana", () => {
    const items = scraperFor("CBN Campinas").parse(fixture("cbn.xml"));
    expect(items).toHaveLength(2);
    expect(items.some((item) => item.title.includes("Emdec"))).toBe(false);
    expect(items.map((item) => item.city).sort()).toEqual(["Mogi Guaçu", "Mogi Mirim"]);
  });
});
