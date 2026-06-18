export function uuid(): string {
  return crypto.randomUUID();
}

export function pluralize(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}

/** Tiny `classnames`-style helper: keeps the keys whose value is truthy. */
export function classNames(classes: Record<string, boolean>): string {
  return Object.keys(classes)
    .filter((name) => classes[name])
    .join(" ");
}
