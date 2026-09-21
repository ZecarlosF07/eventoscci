export function focusFirstInvalidField(form: HTMLFormElement): void {
  window.requestAnimationFrame(() => {
    const invalidField = form.querySelector<HTMLElement>("[aria-invalid='true']:not(:disabled)");
    invalidField?.focus();
  });
}
