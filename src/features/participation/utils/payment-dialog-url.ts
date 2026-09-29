export function paymentDialogUrl(href: string, requestId?: string): string {
  const url = new URL(href, "http://local.invalid");
  if (requestId) url.searchParams.set("solicitud", requestId);
  else url.searchParams.delete("solicitud");
  return `${url.pathname}${url.search}${url.hash}`;
}
