const displayDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function parseLocalDate(value: string) {
  if (!value) return null;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

export function toDateInputValue(value: string | Date | null | undefined) {
  if (!value) return "";

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const tSeparatorIndex = value.indexOf("T");

  if (tSeparatorIndex > 0) {
    return value.slice(0, tSeparatorIndex);
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toISOString().slice(0, 10);
}

export function countCalendarDays(startValue: string, endValue: string) {
  const start = parseLocalDate(startValue);
  const end = parseLocalDate(endValue);

  if (!start || !end || start > end) return 0;

  const msPerDay = 1000 * 60 * 60 * 24;
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();

  return Math.floor((endTime - startTime) / msPerDay) + 1;
}

export function getNextDay(value: string) {
  const date = parseLocalDate(value);

  if (!date) return null;

  const cursor = new Date(date);
  cursor.setDate(cursor.getDate() + 1);

  return cursor;
}

export function formatDisplayDate(value: string) {
  const date = parseLocalDate(value);

  if (!date) return "Not selected";

  return displayDateFormatter.format(date);
}

export function formatDisplayDateFromDate(value: Date) {
  return displayDateFormatter.format(value);
}

export function formatDays(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
