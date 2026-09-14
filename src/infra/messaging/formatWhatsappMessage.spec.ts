import { formatWhatsappMessage } from "./formatWhatsappMessage";

describe("formatWhatsappMessage", () => {
  it("includes source, title, link and date", () => {
    expect(
      formatWhatsappMessage({
        source: "O Regional",
        title: "Feira na praça",
        link: "https://oregional.net/feira",
        postedAt: "11/09/2026",
      }),
    ).toBe("📰 [O Regional] Feira na praça\n\nhttps://oregional.net/feira\n11/09/2026");
  });

  it("formats RSS pubDate instead of showing the raw UTC string", () => {
    expect(
      formatWhatsappMessage({
        source: "Mogi Guaçu Acontece",
        title: "Equipe de ciclismo conquista ouro, prata e bronze no Campeonato Paulista de Montanha",
        link: "https://mogiguacuacontece.com.br/equipe-de-ciclismo-conquista-ouro-prata-e-bronze-no-campeonato-paulista-de-montanha",
        postedAt: "Tue, 08 Sep 2026 17:03:00 +0000",
      }),
    ).toBe(
      "📰 [Mogi Guaçu Acontece] Equipe de ciclismo conquista ouro, prata e bronze no Campeonato Paulista de Montanha\n\nhttps://mogiguacuacontece.com.br/equipe-de-ciclismo-conquista-ouro-prata-e-bronze-no-campeonato-paulista-de-montanha\n08/09/2026 14:03",
    );
  });
});
