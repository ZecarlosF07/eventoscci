export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createContentSlug(value: string, maxLength = 96): string {
  const slug = slugify(value);
  if (slug.length <= maxLength) return slug;
  const shortened = slug.slice(0, maxLength);
  const lastSeparator = shortened.lastIndexOf("-");
  return (lastSeparator >= Math.floor(maxLength * 0.6)
    ? shortened.slice(0, lastSeparator)
    : shortened).replace(/-+$/g, "");
}
