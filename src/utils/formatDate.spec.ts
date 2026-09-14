import { formatPostedAt } from "./formatDate";

describe("formatPostedAt", () => {
  it("formats RSS pubDate with São Paulo time", () => {
    expect(formatPostedAt("Tue, 08 Sep 2026 17:03:00 +0000")).toBe("08/09/2026 14:03");
  });

  it("formats ISO timestamps with time", () => {
    expect(formatPostedAt("2026-09-08T10:00:00-03:00")).toBe("08/09/2026 10:00");
  });

  it("keeps ISO calendar dates without inventing midnight", () => {
    expect(formatPostedAt("2026-09-02")).toBe("02/09/2026");
  });

  it("normalizes slash dates and Portuguese dates", () => {
    expect(formatPostedAt("11/09/2026")).toBe("11/09/2026");
    expect(formatPostedAt("8 de setembro de 2026")).toBe("08/09/2026");
  });

  it("keeps time from listing formats", () => {
    expect(formatPostedAt("Publicado em 12/09/2026 às 18:37")).toBe("12/09/2026 18:37");
    expect(formatPostedAt("11/09/2026 às 20h56")).toBe("11/09/2026 20:56");
    expect(formatPostedAt("16/09/2024 às 19h07min")).toBe("16/09/2024 19:07");
  });

  it("prefers the candidate that includes time", () => {
    expect(formatPostedAt("8 de setembro de 2026", "2026-09-08T11:00:27-03:00")).toBe(
      "08/09/2026 11:00",
    );
  });

  it("is idempotent for the canonical format", () => {
    expect(formatPostedAt("08/09/2026 14:03")).toBe("08/09/2026 14:03");
  });

  it("returns empty and unknown values as-is", () => {
    expect(formatPostedAt("")).toBe("");
    expect(formatPostedAt("há 2 horas")).toBe("há 2 horas");
  });
});
