'use client';

import { useCallback, useState, type ReactNode } from 'react';
import type { Equipo } from '@/lib/types/equipo';
import { getWhatsAppUrl, getEquipmentMessage } from '@/lib/utils/whatsapp';
import { formatPrecioLista } from '@/lib/catalog/catalogUtils';
import { persistEquipoContacto } from '@/lib/firebase/equipoContacto';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Tab = 'whatsapp' | 'consulta' | 'oferta' | 'chat';

interface EquipoDetalleContactoPanelProps {
  equipo: Equipo;
}

export default function EquipoDetalleContactoPanel({ equipo }: EquipoDetalleContactoPanelProps) {
  const titulo = (equipo.titulo || `${equipo.marca} ${equipo.modelo}`).trim();
  const waMsg = `${getEquipmentMessage(titulo)} — Ref: ${equipo.slug}`;
  const waHref = getWhatsAppUrl(waMsg);

  const [tab, setTab] = useState<Tab>('whatsapp');

  const [cNombre, setCNombre] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cMensaje, setCMensaje] = useState('');
  const [cStatus, setCStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [cBusy, setCBusy] = useState(false);

  const [oNombre, setONombre] = useState('');
  const [oEmail, setOEmail] = useState('');
  const [oTel, setOTel] = useState('');
  const [oMonto, setOMonto] = useState('');
  const [oMsg, setOMsg] = useState('');
  const [oStatus, setOStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [oBusy, setOBusy] = useState(false);

  const [chatLines, setChatLines] = useState<{ author: 'vos' | 'equipo'; text: string }[]>([
    {
      author: 'equipo',
      text: 'Hola — contanos qué necesitás sobre esta máquina. Podés escribir varios mensajes y al final pulsá «Enviar conversación» para que el equipo comercial lo reciba por la web.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatStatus, setChatStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [chatBusy, setChatBusy] = useState(false);

  const tituloSnapshot = titulo;

  const enviarConsulta = useCallback(async () => {
    setCStatus('idle');
    if (!cNombre.trim() || !cEmail.trim() || !cMensaje.trim() || !EMAIL_RE.test(cEmail.trim())) {
      setCStatus('err');
      return;
    }
    setCBusy(true);
    const r = await persistEquipoContacto({
      tipo: 'consulta',
      equipoId: equipo.id,
      slug: equipo.slug,
      tituloSnapshot,
      nombre: cNombre.trim(),
      email: cEmail.trim(),
      mensaje: cMensaje.trim(),
    });
    setCBusy(false);
    if (r.ok) {
      setCStatus('ok');
      setCMensaje('');
    } else setCStatus('err');
  }, [cNombre, cEmail, cMensaje, equipo.id, equipo.slug, tituloSnapshot]);

  const enviarOferta = useCallback(async () => {
    setOStatus('idle');
    if (!oNombre.trim() || !oEmail.trim() || !oTel.trim() || !oMonto.trim() || !EMAIL_RE.test(oEmail.trim())) {
      setOStatus('err');
      return;
    }
    const n = Number(oMonto.replace(/\./g, '').replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) {
      setOStatus('err');
      return;
    }
    setOBusy(true);
    const r = await persistEquipoContacto({
      tipo: 'oferta',
      equipoId: equipo.id,
      slug: equipo.slug,
      tituloSnapshot,
      nombre: oNombre.trim(),
      email: oEmail.trim(),
      telefono: oTel.trim(),
      montoOfertaUsd: n,
      mensaje: oMsg.trim() || undefined,
    });
    setOBusy(false);
    if (r.ok) {
      setOStatus('ok');
      setOMonto('');
      setOMsg('');
    } else setOStatus('err');
  }, [oNombre, oEmail, oTel, oMonto, oMsg, equipo.id, equipo.slug, tituloSnapshot]);

  const agregarLineaChat = useCallback(() => {
    const t = chatInput.trim();
    if (!t) return;
    setChatLines((prev) => [...prev, { author: 'vos', text: t }]);
    setChatInput('');
  }, [chatInput]);

  const enviarChatSesion = useCallback(async () => {
    const userLines = chatLines.filter((l) => l.author === 'vos');
    if (userLines.length === 0) {
      setChatStatus('err');
      return;
    }
    setChatBusy(true);
    setChatStatus('idle');
    const transcript = chatLines
      .map((l) => `${l.author === 'equipo' ? 'Marcos Morici' : 'Cliente'}: ${l.text}`)
      .join('\n');
    const r = await persistEquipoContacto({
      tipo: 'chat_sesion',
      equipoId: equipo.id,
      slug: equipo.slug,
      tituloSnapshot,
      transcript,
    });
    setChatBusy(false);
    if (r.ok) {
      setChatStatus('ok');
      setChatLines((prev) => [
        ...prev,
        {
          author: 'equipo',
          text: 'Listo — recibimos la conversación. También podés seguir por WhatsApp con la pestaña «WhatsApp».',
        },
      ]);
    } else setChatStatus('err');
  }, [chatLines, equipo.id, equipo.slug, tituloSnapshot]);

  const tabBtn = (id: Tab, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => {
        setTab(id);
        setCStatus('idle');
        setOStatus('idle');
        setChatStatus('idle');
      }}
      className={`px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-colors ${
        tab === id
          ? 'border-[#1E3A5F] bg-[#1E3A5F] text-white'
          : 'border-[#E0E5E9] bg-white text-[#1E3A5F] hover:border-[#4A7C59]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <section className="rounded-xl border border-[#E0E5E9] bg-white p-5 md:p-6 shadow-sm" aria-labelledby="contacto-equipo-heading">
      <h2 id="contacto-equipo-heading" className="text-lg font-bold text-[#1E3A5F] uppercase mb-2">
        Contacto y ofertas
      </h2>
      <p className="text-sm text-[#5A6C7D] mb-5">
        WhatsApp, consulta por escrito, oferta de compra o chat desde la página; los envíos web se guardan en Firestore
        (`equipoContactos`).
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabBtn('whatsapp', 'WhatsApp')}
        {tabBtn('consulta', 'Consulta')}
        {tabBtn('oferta', 'Oferta')}
        {tabBtn('chat', 'Chat')}
      </div>

      {tab === 'whatsapp' && (
        <div className="space-y-4">
          <p className="text-sm text-[#5A6C7D]">
            Precio listado:{' '}
            <strong className="text-[#1E3A5F]">
              {formatPrecioLista(equipo)}
            </strong>
          </p>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-3 rounded-lg font-semibold uppercase transition-colors"
          >
            <WhatsAppIcon />
            Abrir WhatsApp
          </a>
        </div>
      )}

      {tab === 'consulta' && (
        <div className="space-y-4 max-w-lg">
          {cStatus === 'ok' && (
            <p className="text-sm text-[#4A7C59] font-medium" role="status">
              Consulta enviada. Te responderemos a la brevedad.
            </p>
          )}
          {cStatus === 'err' && (
            <p className="text-sm text-red-600" role="alert">
              Revisá nombre, correo y mensaje.
            </p>
          )}
          <Field label="Nombre" htmlFor="c-nom" required>
            <input id="c-nom" value={cNombre} onChange={(e) => setCNombre(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Correo" htmlFor="c-mail" required>
            <input id="c-mail" type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Mensaje" htmlFor="c-msg" required>
            <textarea id="c-msg" rows={4} value={cMensaje} onChange={(e) => setCMensaje(e.target.value)} className={textareaClass} />
          </Field>
          <button type="button" disabled={cBusy} onClick={enviarConsulta} className={primaryBtn}>
            {cBusy ? 'Enviando…' : 'Enviar consulta'}
          </button>
        </div>
      )}

      {tab === 'oferta' && (
        <div className="space-y-4 max-w-lg">
          <p className="text-sm text-[#5A6C7D]">
            Proponé un monto en <strong>USD</strong>. El equipo comercial evaluará la oferta.
          </p>
          {oStatus === 'ok' && (
            <p className="text-sm text-[#4A7C59] font-medium" role="status">
              Oferta registrada. Nos pondremos en contacto.
            </p>
          )}
          {oStatus === 'err' && (
            <p className="text-sm text-red-600" role="alert">
              Completá todos los campos y un monto válido.
            </p>
          )}
          <Field label="Nombre" htmlFor="o-nom" required>
            <input id="o-nom" value={oNombre} onChange={(e) => setONombre(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Correo" htmlFor="o-mail" required>
            <input id="o-mail" type="email" value={oEmail} onChange={(e) => setOEmail(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Celular" htmlFor="o-tel" required>
            <input id="o-tel" type="tel" value={oTel} onChange={(e) => setOTel(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Oferta (USD)" htmlFor="o-usd" required>
            <input
              id="o-usd"
              inputMode="decimal"
              placeholder="Ej. 95000"
              value={oMonto}
              onChange={(e) => setOMonto(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Comentario (opcional)" htmlFor="o-msg">
            <textarea id="o-msg" rows={3} value={oMsg} onChange={(e) => setOMsg(e.target.value)} className={textareaClass} />
          </Field>
          <button type="button" disabled={oBusy} onClick={enviarOferta} className={primaryBtn}>
            {oBusy ? 'Enviando…' : 'Enviar oferta'}
          </button>
        </div>
      )}

      {tab === 'chat' && (
        <div className="flex flex-col gap-4 max-w-xl">
          <div
            className="rounded-lg border border-[#E0E5E9] bg-[#F8FAFB] p-4 max-h-[320px] overflow-y-auto space-y-3"
            role="log"
            aria-live="polite"
          >
            {chatLines.map((line, i) => (
              <div key={i} className={`flex ${line.author === 'vos' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    line.author === 'vos'
                      ? 'bg-[#1E3A5F] text-white rounded-br-sm'
                      : 'bg-white border border-[#E0E5E9] text-[#374151] rounded-bl-sm'
                  }`}
                >
                  {line.text}
                </div>
              </div>
            ))}
          </div>
          {chatStatus === 'err' && (
            <p className="text-sm text-red-600" role="alert">
              Añadí al menos un mensaje tuyo antes de enviar.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  agregarLineaChat();
                }
              }}
              placeholder="Escribí tu mensaje…"
              className={`${inputClass} flex-1`}
            />
            <button type="button" onClick={agregarLineaChat} className={secondaryBtn}>
              Añadir
            </button>
          </div>
          <button type="button" disabled={chatBusy} onClick={enviarChatSesion} className={primaryBtn}>
            {chatBusy ? 'Enviando…' : 'Enviar conversación al equipo'}
          </button>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-[#1E3A5F] mb-1">
        {label}
        {required ? <span className="text-[#D9773F]"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-[#E0E5E9] px-3 py-2.5 text-sm text-[#1E3A5F] focus:border-[#4A7C59] focus:outline-none focus:ring-1 focus:ring-[#4A7C59]';
const textareaClass = `${inputClass} resize-y min-h-[96px]`;
const primaryBtn =
  'inline-flex items-center justify-center rounded-lg bg-[#1E3A5F] px-6 py-3 text-sm font-semibold uppercase text-white border-2 border-[#1E3A5F] hover:bg-[#D9773F] hover:border-[#D9773F] transition-colors disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center rounded-lg border-2 border-[#E0E5E9] px-4 py-2.5 text-sm font-semibold text-[#1E3A5F] hover:border-[#1E3A5F] transition-colors';

function WhatsAppIcon() {
  return (
    <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}
