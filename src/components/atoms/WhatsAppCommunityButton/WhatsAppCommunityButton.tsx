import { SITE_CONFIG } from "@/config/site";

export function WhatsAppCommunityButton() {
  return (
    <aside
      aria-label="Comunidad de WhatsApp"
      className="whatsapp-community-floating fixed z-30"
      data-whatsapp-community
    >
      <a
        aria-label="Unirse a nuestra comunidad de WhatsApp; se abre en una pestaña nueva"
        className="group flex items-center gap-2 rounded-full focus-visible:outline-none"
        href={SITE_CONFIG.whatsAppCommunityUrl}
        rel="noopener noreferrer"
        target="_blank"
        title="Únete a nuestra comunidad de WhatsApp"
      >
        <span className="whitespace-nowrap rounded-2xl border border-[#25d366]/35 bg-white px-3 py-2 text-xs font-bold leading-4 text-cci-950 shadow-lg shadow-cci-950/10 transition group-hover:-translate-x-0.5 group-hover:border-[#25d366]/70 group-focus-visible:border-[#128c7e] motion-reduce:transition-none lg:text-sm">
          ¡Únete a nuestra comunidad!
        </span>
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-cci-950/20 transition group-hover:scale-105 group-hover:bg-[#20bd5a] group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-[#128c7e] motion-reduce:transition-none">
          <svg aria-hidden="true" className="size-9" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 0 0-8.7 14.94L2 22l5.2-1.36A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.08-1.12l-.29-.17-3.08.81.82-3-.19-.31A8 8 0 1 1 12 20Zm4.38-5.56c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.31.98 2.47c.12.16 1.69 2.58 4.09 3.62.57.25 1.02.39 1.37.5.57.18 1.09.16 1.51.09.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
          </svg>
        </span>
      </a>
    </aside>
  );
}
