export function createId(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `${slug || 'item'}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
