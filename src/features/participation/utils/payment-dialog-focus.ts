export function restorePaymentDialogFocus(previousFocus: Element | null, requestId: string): void {
  requestAnimationFrame(() => {
    if (previousFocus instanceof HTMLElement && previousFocus.isConnected && previousFocus !== document.body && previousFocus.getClientRects().length > 0) {
      previousFocus.focus({ preventScroll: true });
      return;
    }
    const triggers = document.querySelectorAll<HTMLElement>(`[data-payment-trigger="${CSS.escape(requestId)}"]`);
    Array.from(triggers).find((trigger) => trigger.getClientRects().length > 0)?.focus({ preventScroll: true });
  });
}
