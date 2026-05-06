import Link from 'next/link';
import { getWhatsAppUrl } from '@/lib/utils/whatsapp';
import {
  BUSINESS_NAME,
  getBusinessAddress,
  getBusinessCoverage,
  getBusinessEmail,
  getBusinessPhoneLabel,
  getBusinessPhoneTel,
  getBusinessTagline,
  getWhatsAppDigits,
} from '@/lib/site/contact';
import FooterWhatsAppDefer from '@/components/FooterWhatsAppDefer';

const navClass =
  'text-white/90 hover:text-white transition-colors text-sm font-medium';

function PhoneRow() {
  const tel = getBusinessPhoneTel();
  const label = getBusinessPhoneLabel();
  if (!tel && !label) return null;
  if (tel) {
    return (
      <p>
        <a href={`tel:${tel}`} className="text-white/95 hover:text-white underline-offset-2 hover:underline">
          {label || tel}
        </a>
      </p>
    );
  }
  return <p className="text-white/90">{label}</p>;
}

export default function Footer() {
  const year = new Date().getFullYear();
  const address = getBusinessAddress();
  const email = getBusinessEmail();
  const waDigits = getWhatsAppDigits();
  const defaultWaMsg = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || 'Hola, quiero más información';
  const whatsappHref = waDigits ? getWhatsAppUrl(defaultWaMsg) : undefined;

  return (
    <footer className="bg-[#1E3A5F] text-white border-t border-white/10">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Marca + contexto local (NAP / cobertura) */}
          <div className="lg:col-span-1">
            <p className="text-lg font-bold uppercase tracking-wide text-white">{BUSINESS_NAME}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/85">{getBusinessTagline()}</p>
            <p className="mt-4 text-sm text-white/80">{getBusinessCoverage()}</p>
            {address ? (
              <address className="mt-4 text-sm not-italic leading-relaxed text-white/85 whitespace-pre-line">
                {address}
              </address>
            ) : null}
          </div>

          {/* Enlaces internos — rastreo y UX */}
          <nav aria-label="Secciones del sitio" className="flex flex-col gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#4A7C59]">Sitio</h2>
            <Link href="/comprar" className={navClass}>
              Comprar equipos
            </Link>
            <Link href="/vender" className={navClass}>
              Vender maquinaria
            </Link>
            <Link href="/nosotros" className={navClass}>
              Nosotros
            </Link>
            <Link href="/acceso" className={navClass}>
              Ingresar / Registrarse
            </Link>
          </nav>

          {/* Contacto */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#4A7C59]">Contacto</h2>
            {whatsappHref ? (
              <p>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#A8E6A8] transition-colors"
                >
                  <span className="sr-only">WhatsApp — </span>
                  WhatsApp
                </a>
              </p>
            ) : (
              <p className="text-sm text-white/70">Configurá NEXT_PUBLIC_WHATSAPP_NUMBER para el enlace a WhatsApp.</p>
            )}
            {email ? (
              <p>
                <a
                  href={`mailto:${email}`}
                  className="text-sm text-white/90 hover:text-white underline-offset-2 hover:underline break-all"
                >
                  {email}
                </a>
              </p>
            ) : null}
            <PhoneRow />
          </div>

          {/* CTA breve — refuerzo intención comercial + keywords naturales */}
          <div className="flex flex-col justify-between gap-6 rounded-lg border border-white/15 bg-white/5 p-5 lg:min-h-[180px]">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#4A7C59]">Asesoramiento</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/90">
                Consultanos por tractores, equipos usados y repuestos. Respondemos por WhatsApp y te ayudamos a elegir según tu proyecto en Argentina.
              </p>
            </div>
            <Link
              href="/comprar"
              className="inline-flex w-fit items-center justify-center rounded-lg bg-[#4A7C59] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#3D5F47]"
            >
              Ver catálogo
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-8 text-center text-sm text-white/75 md:flex-row md:text-left">
          <p>
            © {year} {BUSINESS_NAME.toUpperCase()}
          </p>
          <p className="max-w-xl md:text-right">
            Maquinaria vial y agrícola · Venta de equipos y repuestos
          </p>
        </div>
      </div>

      <FooterWhatsAppDefer />
    </footer>
  );
}
