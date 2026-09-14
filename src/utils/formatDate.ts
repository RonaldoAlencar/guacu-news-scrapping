const TIME_ZONE = "America/Sao_Paulo";

const MONTHS: Record<string, number> = {
  janeiro: 1,
  fevereiro: 2,
  marco: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
};

type ParsedPostedAt = {
  day: number;
  month: number;
  year: number;
  hour?: number;
  minute?: number;
};

export default function formatDate(date: Date): string {
  return date.toLocaleString("pt-BR", {
    timeZone: TIME_ZONE,
    hour12: false,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

export function formatPostedAt(...values: string[]): string {
  let fallback = "";
  let best: ParsedPostedAt | undefined;

  for (const value of values) {
    const trimmed = value.replace(/\s+/g, " ").trim();
    if (!trimmed) {
      continue;
    }
    const parsed = parsePostedAt(trimmed);
    if (!parsed) {
      if (!fallback) {
        fallback = trimmed;
      }
      continue;
    }
    if (!best || (hasTime(parsed) && !hasTime(best))) {
      best = parsed;
    }
  }

  return best ? renderPostedAt(best) : fallback;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePostedAt(value: string): ParsedPostedAt | undefined {
  const normalized = value.replace(/^publicado em\s+/i, "").trim();
  return (
    parseSlashDate(normalized) ||
    parsePortugueseDate(normalized) ||
    parseIsoDateOnly(normalized) ||
    parseInstant(normalized)
  );
}

function parseSlashDate(value: string): ParsedPostedAt | undefined {
  const match = value.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(?:às\s+|as\s+)?(\d{1,2})[:h](\d{2})(?:min)?)?$/i,
  );
  if (!match) {
    return undefined;
  }
  return calendarDate(Number(match[1]), Number(match[2]), Number(match[3]), match[4], match[5]);
}

function parsePortugueseDate(value: string): ParsedPostedAt | undefined {
  const match = value.match(
    /^(\d{1,2})\s+de\s+([a-zçáéíóúãõ]+)\s+de\s+(\d{4})(?:\s+(?:às\s+|as\s+)(\d{1,2})[:h](\d{2})(?:min)?)?$/i,
  );
  if (!match) {
    return undefined;
  }
  const month = MONTHS[stripDiacritics(match[2])];
  if (!month) {
    return undefined;
  }
  return calendarDate(Number(match[1]), month, Number(match[3]), match[4], match[5]);
}

function parseIsoDateOnly(value: string): ParsedPostedAt | undefined {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return undefined;
  }
  return calendarDate(Number(match[3]), Number(match[2]), Number(match[1]));
}

function parseInstant(value: string): ParsedPostedAt | undefined {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value) && !/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),/i.test(value)) {
    return undefined;
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return undefined;
  }

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TIME_ZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(parsed))
      .map((part) => [part.type, part.value]),
  );

  return {
    day: Number(parts.day),
    month: Number(parts.month),
    year: Number(parts.year),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function calendarDate(
  day: number,
  month: number,
  year: number,
  hour?: string,
  minute?: string,
): ParsedPostedAt | undefined {
  if (year < 1990 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return undefined;
  }
  const parsed: ParsedPostedAt = { day, month, year };
  if (hour !== undefined && minute !== undefined) {
    const hourNumber = Number(hour);
    const minuteNumber = Number(minute);
    if (hourNumber > 23 || minuteNumber > 59) {
      return undefined;
    }
    parsed.hour = hourNumber;
    parsed.minute = minuteNumber;
  }
  return parsed;
}

function renderPostedAt(parsed: ParsedPostedAt): string {
  const date = `${pad(parsed.day)}/${pad(parsed.month)}/${parsed.year}`;
  if (!hasTime(parsed)) {
    return date;
  }
  return `${date} ${pad(parsed.hour)}:${pad(parsed.minute)}`;
}

function hasTime(parsed: ParsedPostedAt): boolean {
  return parsed.hour !== undefined && parsed.minute !== undefined;
}

function pad(value: number | undefined): string {
  return String(value ?? 0).padStart(2, "0");
}

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
