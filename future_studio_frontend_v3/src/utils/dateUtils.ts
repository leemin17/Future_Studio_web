/**
 * Safely parses a date string (format: "YYYY.MM.DD") and returns its timestamp.
 * Returns NaN for invalid dates (e.g. "THANK YOU", "CREATIVE").
 */
export function parseDateString(dateStr: string): number {
  return new Date(dateStr.replace(/\./g, '-')).getTime();
}

/**
 * Comparator for sorting items by date in descending order (newest first).
 * Items with invalid dates are pushed to the end of the list.
 */
export function compareDateDesc(dateA: string, dateB: string): number {
  const timeA = parseDateString(dateA);
  const timeB = parseDateString(dateB);

  const isAValid = !isNaN(timeA);
  const isBValid = !isNaN(timeB);

  if (isAValid && isBValid) {
    return timeB - timeA;
  }
  if (isAValid) return -1;
  if (isBValid) return 1;
  return 0;
}
