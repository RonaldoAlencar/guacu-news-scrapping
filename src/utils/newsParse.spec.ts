import {
  inferCity,
  looksLikeCloudflare,
  matchesLocalCity,
  normalizeLink,
  readableHtmlText,
} from "./newsParse";

describe("newsParse", () => {
  it("removes tracking query params", () => {
    expect(
      normalizeLink("https://oregional.net/noticia?utm_source=home&utm_medium=cpc#topo"),
    ).toBe("https://oregional.net/noticia");
  });

  it("resolves relative links", () => {
    expect(normalizeLink("/noticia-local", "https://oregional.net")).toBe(
      "https://oregional.net/noticia-local",
    );
  });

  it("detects local cities in title or path", () => {
    expect(matchesLocalCity("Feira em Mogi Guaçu", "https://example.com/x")).toBe(true);
    expect(matchesLocalCity("Tiroteio na SP-340", "https://g1.globo.com/x", "em Mogi Guaçu (SP)")).toBe(true);
    expect(matchesLocalCity("Alta da gasolina", "https://portaltribunadoguacu.com.br/noticia/1")).toBe(false);
  });

  it("infers city with Mogi Mirim taking precedence over generic guaçuano", () => {
    expect(inferCity("Fatec Mogi Mirim amplia vagas", "https://guacuagora.com.br/x", "Mogi Guaçu")).toBe(
      "Mogi Mirim",
    );
  });

  it("inserts spaces when titles glue adjacent tags", () => {
    expect(readableHtmlText("Sete dias <span>após</span><span>sair</span> da prisão")).toBe(
      "Sete dias após sair da prisão",
    );
  });

  it("detects cloudflare challenge pages", () => {
    expect(looksLikeCloudflare("<html>Ray ID: abc Cloudflare</html>")).toBe(true);
    expect(looksLikeCloudflare("<html><title>Notícias</title></html>")).toBe(false);
  });
});
