/** Keep Tab inside a modal; callers restore focus to the original trigger on close. */
export function handleDialogKeyboard(event: KeyboardEvent, container: HTMLElement | null, onClose: () => void): void {
  if (event.key === "Escape") { onClose(); return; }
  if (event.key !== "Tab" || !container) return;
  const focusable = Array.from(container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex="0"]',
  ));
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
}
