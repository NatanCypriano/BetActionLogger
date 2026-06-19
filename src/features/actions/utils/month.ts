export type MonthReference = {
  month: number;
  year: number;
};

export const SAO_PAULO_TIME_ZONE = "America/Sao_Paulo";

type ZonedDateTime = {
  day: number;
  hour?: number;
  millisecond?: number;
  minute?: number;
  month: number;
  second?: number;
  year: number;
};

export function addMonths(reference: MonthReference, amount: number): MonthReference {
  const date = new Date(Date.UTC(reference.year, reference.month - 1 + amount, 1));

  return {
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear()
  };
}

export function formatMonthLabel(reference: MonthReference): string {
  const date = new Date(Date.UTC(reference.year, reference.month - 1, 1, 12));

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: "UTC",
    year: "numeric"
  }).format(date);
}

export function getSaoPauloMonthBounds(year: number, month: number) {
  const start = zonedDateTimeToUtc({ day: 1, month, year }, SAO_PAULO_TIME_ZONE);
  const next = addMonths({ month, year }, 1);
  const end = zonedDateTimeToUtc(
    { day: 1, month: next.month, year: next.year },
    SAO_PAULO_TIME_ZONE
  );

  return {
    endIso: end.toISOString(),
    periodEndDate: formatDateOnly(end),
    periodStartDate: formatDateOnly(start),
    startIso: start.toISOString()
  };
}

export function formatSaoPauloDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: SAO_PAULO_TIME_ZONE
  }).format(new Date(iso));
}

function zonedDateTimeToUtc(value: ZonedDateTime, timeZone: string): Date {
  const utcGuess = new Date(
    Date.UTC(
      value.year,
      value.month - 1,
      value.day,
      value.hour ?? 0,
      value.minute ?? 0,
      value.second ?? 0,
      value.millisecond ?? 0
    )
  );
  const offset = getTimeZoneOffsetMs(utcGuess, timeZone);
  const firstPass = new Date(utcGuess.getTime() - offset);
  const adjustedOffset = getTimeZoneOffsetMs(firstPass, timeZone);

  return new Date(utcGuess.getTime() - adjustedOffset);
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric"
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)])
  ) as Record<"day" | "hour" | "minute" | "month" | "second" | "year", number>;

  const zonedAsUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second
  );

  return zonedAsUtc - date.getTime();
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}
