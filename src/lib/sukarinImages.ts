const modules = import.meta.glob<{ default: string }>(
  '../assets/sukarin/*.png',
  { eager: true },
);

export const sukarinImages: Record<string, string> = Object.fromEntries(
  Object.entries(modules)
    .map(([path, mod]) => {
      const match = path.match(/([A-Z]{5})\.png$/);
      return match ? [match[1], mod.default] : null;
    })
    .filter((entry): entry is [string, string] => entry !== null),
);

export function sukarinSrc(code: string): string | undefined {
  return sukarinImages[code];
}
