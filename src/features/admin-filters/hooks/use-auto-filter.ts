"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";

import { useFilterWorkspace } from "@/features/admin-filters/components/FilterWorkspace";
import type { AutoFilterFormProps } from "@/features/admin-filters/types/admin-filter.types";
import { ADMIN_SEARCH_DELAY_MS, buildFilterUrl, filterDateError, formFilterValues } from "@/features/admin-filters/utils/filter-url";

export function useAutoFilter({ defaults = {}, resetPages = {} }: AutoFilterFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = params.toString();
  const form = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const target = useRef<string | undefined>(undefined);
  const composing = useRef(false);
  const [pending, startTransition] = useTransition();
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState("");
  const [edited, setEdited] = useState(false);
  const { setBusy } = useFilterWorkspace();
  const busy = pending || waiting;

  useEffect(() => { setBusy(busy || Boolean(error)); return () => setBusy(false); }, [busy, error, setBusy]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const cancelQueuedSearch = () => { clearTimeout(timer.current); target.current = undefined; setWaiting(false); };
    window.addEventListener("popstate", cancelQueuedSearch);
    return () => window.removeEventListener("popstate", cancelQueuedSearch);
  }, []);
  useEffect(() => {
    if (!form.current || waiting || (target.current && `${pathname}${query ? `?${query}` : ""}` !== target.current && pending)) return;
    for (const control of form.current.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input[name],select[name]")) {
      if (control.type === "hidden") continue;
      const value = params.get(control.name) ?? defaults[control.name] ?? "";
      if (control instanceof HTMLInputElement && control.type === "checkbox") control.checked = value === control.value;
      else control.value = value;
    }
    // Query changes, not keystrokes, synchronize uncontrolled server-rendered controls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, pathname]);

  function apply(changed?: string, overrides: Record<string, string> = {}) {
    clearTimeout(timer.current);
    setWaiting(false);
    if (!form.current) return;
    const values = { ...formFilterValues(form.current), ...overrides };
    const dateError = filterDateError(values);
    const invalid = Array.from(form.current.querySelectorAll<HTMLInputElement>("input")).find((control) => !control.validity.valid);
    for (const control of form.current.querySelectorAll<HTMLInputElement>("input[type=date]")) {
      control.setAttribute("aria-invalid", String(Boolean(dateError || !control.validity.valid)));
      control.setAttribute("aria-describedby", "admin-filter-date-error");
    }
    if (invalid || dateError) { setError(dateError || `Revisa ${invalid?.getAttribute("aria-label") ?? invalid?.name ?? "la fecha"}: completa un valor válido.`); return; }
    setError("");
    const href = buildFilterUrl(pathname, query, values, resetPages[changed ?? ""] ?? ["pagina"]);
    if (href === `${pathname}${query ? `?${query}` : ""}` || href === target.current && pending) return;
    target.current = href;
    startTransition(() => router.replace(href, { scroll: false }));
  }
  function change(event: FormEvent<HTMLFormElement>) {
    if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement)) return;
    setEdited(true);
    clearTimeout(timer.current);
    if (composing.current) return;
    const name = event.target.name;
    if (["text", "search", "email", "tel", "number"].includes(event.target.type)) {
      setWaiting(true);
      timer.current = setTimeout(() => apply(name), ADMIN_SEARCH_DELAY_MS);
    } else apply(name);
  }
  function clear() {
    if (!form.current) return;
    for (const control of form.current.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input[name],select[name]")) {
      if (control.type === "hidden") continue;
      if (control instanceof HTMLInputElement && control.type === "checkbox") control.checked = defaults[control.name] === control.value;
      else control.value = defaults[control.name] ?? (control instanceof HTMLSelectElement ? control.options[0]?.value ?? "" : "");
    }
    setEdited(true);
    apply();
  }
  function remove(name: string) {
    if (!form.current) return;
    const control = Array.from(form.current.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input[name],select[name]")).find((item) => item.name === name);
    if (!control) { setEdited(true); apply(name, { [name]: "" }); return; }
    if (control instanceof HTMLInputElement && control.type === "checkbox") control.checked = false;
    else control.value = defaults[name] ?? (control instanceof HTMLSelectElement ? control.options[0]?.value ?? "" : "");
    setEdited(true);
    apply(name);
  }
  function compositionStart() { composing.current = true; }
  function compositionEnd() { composing.current = false; apply("q"); }
  return { form, change, apply, clear, remove, busy, error, edited, compositionStart, compositionEnd };
}
