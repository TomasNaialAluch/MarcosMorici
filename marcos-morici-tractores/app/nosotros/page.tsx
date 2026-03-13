import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

const valores = [
  {
    titulo: 'Familia',
    descripcion:
      'Seguimos siendo una empresa familiar, con la cercanía y el compromiso que nos caracterizan en cada atención.',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    titulo: 'Experiencia',
    descripcion:
      'Más de 30 años en el rubro nos permiten ofrecer soluciones confiables y asesoramiento experto.',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    titulo: 'Alcance nacional',
    descripcion:
      'Clientes en todo el país, con la misma calidad de atención y compromiso sin importar dónde estés.',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    titulo: 'Compromiso',
    descripcion:
      'Con las ganas de resolver la necesidad de cada cliente, ofreciendo soluciones a medida.',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="M22 4 12 14.01l-3-3" />
      </svg>
    ),
  },
  {
    titulo: 'Especialización',
    descripcion:
      'Gran experiencia en maquinaria y repuestos, con el conocimiento para asesorarte en cada decisión.',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
];

const servicios = [
  {
    titulo: 'Venta de maquinaria',
    descripcion: 'Equipos usados y nuevos, rigurosamente inspeccionados para garantizar su operatividad y fiabilidad.',
  },
  {
    titulo: 'Repuestos',
    descripcion: 'Amplio stock de repuestos para dar respuesta rápida a las necesidades de mantenimiento y reparación.',
  },
  {
    titulo: 'Asesoramiento',
    descripcion: 'Orientación personalizada para elegir el equipo adecuado según tu proyecto y presupuesto.',
  },
];

export default function Nosotros() {
  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Nosotros' }]} />

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
        {/* Quiénes Somos */}
        <section className="mb-16 md:mb-20">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] uppercase mb-6">
            Quiénes Somos
          </h1>
          <p className="text-lg text-[#5A6C7D] leading-relaxed">
            En <strong className="text-[#1E3A5F]">Marcos Morici Tractores</strong> somos una empresa familiar dedicada a la venta de maquinaria y repuestos. Con más de <strong className="text-[#1E3A5F]">30 años en el rubro</strong>, seguimos trabajando en familia con el mismo compromiso: resolver la necesidad de cada cliente. Atendemos clientes en todo el país y nos especializamos en maquinaria y repuestos, con la experiencia y la cercanía que nos caracterizan.
          </p>
        </section>

        {/* A Qué Nos Dedicamos */}
        <section className="mb-16 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] uppercase mb-8">
            A Qué Nos Dedicamos
          </h2>
          <div className="space-y-6">
            {servicios.map((s, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 rounded-lg border border-[#E0E5E9] hover:border-[#4A7C59] hover:bg-[#F0F3F6]/50 transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#4A7C59]/10 flex items-center justify-center text-[#4A7C59]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="M22 4 12 14.01l-3-3" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E3A5F] mb-1">{s.titulo}</h3>
                  <p className="text-[#5A6C7D]">{s.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Nuestros Valores */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] uppercase mb-8">
            Nuestros Valores
          </h2>
          <p className="text-[#5A6C7D] mb-10 max-w-2xl">
            En Marcos Morici Tractores, nuestros valores fundamentales son los pilares que guían cada aspecto de nuestra operación.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {valores.map((v, i) => (
              <div
                key={i}
                className="p-6 rounded-lg border border-[#E0E5E9] bg-white hover:border-[#4A7C59] hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#4A7C59]/10 flex items-center justify-center text-[#4A7C59] mb-4 group-hover:bg-[#4A7C59]/20 transition-colors">
                  {v.icono}
                </div>
                <h3 className="font-bold text-[#1E3A5F] uppercase text-lg mb-2">
                  {v.titulo}
                </h3>
                <p className="text-[#5A6C7D] text-sm leading-relaxed">
                  {v.descripcion}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="mt-16 md:mt-20 p-6 md:p-8 rounded-xl bg-[#1E3A5F] text-white text-center">
          <p className="text-lg md:text-xl font-semibold mb-2">
            ¿Necesitás asesoramiento para tu compra?
          </p>
          <p className="text-white/90 mb-4">
            Estamos acá para brindarte la mejor solución a tus necesidades.
          </p>
          <Link
            href="/comprar"
            className="inline-block px-6 py-3 bg-[#4A7C59] hover:bg-[#3D5F47] text-white font-semibold uppercase rounded-lg transition-colors"
          >
            Ver equipos
          </Link>
        </section>
      </div>
    </div>
  );
}
