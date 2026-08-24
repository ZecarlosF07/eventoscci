import Link from "next/link";

import { BrandLogo } from "@/components/atoms/BrandLogo";
import { PUBLIC_NAVIGATION } from "@/config/navigation";
import { SITE_CONFIG } from "@/config/site";

export function PublicFooter() {
  return (
    <footer className="bg-cci-950 text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-1">
          <BrandLogo className="w-48" light />
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/70">
            Eventos, capacitaciones y formación para fortalecer el desarrollo empresarial de Ica.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Explora</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            {PUBLIC_NAVIGATION.slice(1).map((item) => (
              <li key={item.href}><Link className="hover:text-cci-lime" href={item.href}>{item.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold">Contáctanos</h2>
          <address className="mt-4 space-y-3 text-sm not-italic leading-6 text-white/70">
            <p>Urb. Sr. de Luren, C. Pedro Olaechea 285, Ica</p>
            <p><a className="hover:text-cci-lime" href="tel:+5156238070">056 238 070</a></p>
            <p><a className="hover:text-cci-lime" href="mailto:mesadepartes@camaraica.org.pe">mesadepartes@camaraica.org.pe</a></p>
          </address>
        </div>
        <div>
          <h2 className="font-semibold">Conoce la Cámara</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
            <a className="hover:text-cci-lime" href="https://camaraica.org.pe/" rel="noreferrer" target="_blank">Sitio institucional</a>
            <a className="hover:text-cci-lime" href="https://camaraica.org.pe/formulario-asociados/" rel="noreferrer" target="_blank">Quiero asociarme</a>
            <a className="hover:text-cci-lime" href="https://www.facebook.com/CamaradeComercioIca" rel="noreferrer" target="_blank">Facebook</a>
            <a className="hover:text-cci-lime" href="https://www.instagram.com/camaradecomercio_ica" rel="noreferrer" target="_blank">Instagram</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-5 text-xs text-white/55 sm:px-8">
          © {new Date().getFullYear()} {SITE_CONFIG.organization}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
