'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVenderLeadForm } from '@/components/vender/hooks/useVenderLeadForm';
import VenderWizardShell from '@/components/vender/VenderWizardShell';
import VenderFormProgress from '@/components/vender/VenderFormProgress';
import VenderStepMachine from '@/components/vender/steps/VenderStepMachine';
import VenderStepContact from '@/components/vender/steps/VenderStepContact';
import { useAuth } from '@/components/account/providers/AuthProvider';
import { fetchVenderSolicitudById, solicitudToVenderPrefill } from '@/lib/firebase/venderSolicitudes';

function primaryButtonClass(disabled?: boolean) {
  return [
    'inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold uppercase tracking-wide transition-colors',
    'bg-[#1E3A5F] text-white border-2 border-[#1E3A5F]',
    'hover:bg-[#D9773F] hover:border-[#D9773F] hover:text-white',
    disabled ? 'opacity-50 pointer-events-none' : '',
  ].join(' ');
}

function secondaryButtonClass() {
  return 'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-[#1E3A5F] border-2 border-[#E0E5E9] hover:border-[#1E3A5F] transition-colors';
}

interface VenderLeadFormProps {
  solicitudId?: string | null;
}

export default function VenderLeadForm({ solicitudId }: VenderLeadFormProps) {
  const v = useVenderLeadForm({ linkedSolicitudId: solicitudId ?? null });
  const { isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prefillAssets, setPrefillAssets] = useState<{
    imagenesUrls: string[];
    folletoUrl: string | null;
    solicitudLabel: string;
  } | null>(null);
  const [prefillError, setPrefillError] = useState<string | null>(null);

  useEffect(() => {
    if (!solicitudId || !isAdmin) {
      if (solicitudId && !isAdmin) {
        setPrefillError('Solo un administrador puede abrir una solicitud desde el panel.');
      }
      return;
    }
    let cancelled = false;
    setPrefillError(null);
    (async () => {
      const docRow = await fetchVenderSolicitudById(solicitudId);
      if (cancelled || !docRow) {
        if (!cancelled) setPrefillError('No se encontró la solicitud o no tenés permiso para verla.');
        return;
      }
      if (docRow.status !== 'pending') {
        setPrefillError('Esta solicitud ya fue procesada.');
        return;
      }
      v.mergeFromPartial(solicitudToVenderPrefill(docRow));
      setPrefillAssets({
        imagenesUrls: docRow.imagenesUrls,
        folletoUrl: docRow.folletoUrl,
        solicitudLabel: solicitudId,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [solicitudId, isAdmin, v.mergeFromPartial]);

  const dismissSolicitudQuery = () => {
    const next = new URLSearchParams(searchParams?.toString());
    next.delete('solicitud');
    const q = next.toString();
    router.replace(q ? `/vender?${q}` : '/vender');
  };

  if (v.submitSuccess) {
    return (
      <div className="rounded-xl border border-[#4A7C59]/40 bg-[#F8FAFB] p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-[#1E3A5F] uppercase mb-2">Consulta enviada</h2>
        <p className="text-[#5A6C7D] mb-6 max-w-lg mx-auto">
          {solicitudId
            ? 'El lead quedó registrado y la solicitud del usuario fue marcada como publicada en el panel.'
            : 'Gracias por los datos. Nos pondremos en contacto a la brevedad. Si querés, podés abrir WhatsApp con el mismo resumen para coordinar fotos o documentación.'}
        </p>
        {v.storageWarning ? (
          <div
            className="mb-6 mx-auto max-w-lg rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950"
            role="status"
          >
            <strong className="font-semibold">Archivos:</strong> {v.storageWarning} Los datos del formulario sí quedaron registrados.
          </div>
        ) : null}
        {v.lastLeadId ? (
          <p className="text-xs text-[#5A6C7D] mb-6 font-mono">Ref. interna: {v.lastLeadId}</p>
        ) : null}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button type="button" className={primaryButtonClass()} onClick={v.openLeadWhatsApp}>
            Abrir WhatsApp
          </button>
          <button type="button" className={secondaryButtonClass()} onClick={v.reset}>
            Enviar otra consulta
          </button>
          {solicitudId ? (
            <button type="button" className={secondaryButtonClass()} onClick={dismissSolicitudQuery}>
              Volver al formulario sin solicitud
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div>
      {prefillError ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="alert">
          {prefillError}
        </div>
      ) : null}

      {prefillAssets && !prefillError ? (
        <div className="mb-6 rounded-xl border border-[#4A7C59]/35 bg-white px-4 py-4 text-sm text-[#1E3A5F] shadow-sm">
          <p className="font-semibold mb-2">Archivos de la solicitud {prefillAssets.solicitudLabel}</p>
          <p className="text-[#5A6C7D] mb-3">
            El usuario ya subió fotos/PDF; podés completar la ficha abajo y usar estos enlaces como referencia.
          </p>
          {prefillAssets.folletoUrl ? (
            <p className="mb-2">
              <span className="font-medium">PDF: </span>
              <a href={prefillAssets.folletoUrl} className="text-[#4A7C59] underline break-all" target="_blank" rel="noopener noreferrer">
                {prefillAssets.folletoUrl}
              </a>
            </p>
          ) : null}
          {prefillAssets.imagenesUrls.length ? (
            <ul className="list-disc pl-5 space-y-1 text-[#5A6C7D]">
              {prefillAssets.imagenesUrls.map((url) => (
                <li key={url}>
                  <a href={url} className="text-[#4A7C59] underline break-all" target="_blank" rel="noopener noreferrer">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#8A9BA8]">Sin fotos en la solicitud.</p>
          )}
        </div>
      ) : null}

      {v.bannerError ? (
        <div
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          role="alert"
        >
          <span>{v.bannerError}</span>
          <button type="button" className={secondaryButtonClass()} onClick={v.openLeadWhatsApp}>
            Enviar por WhatsApp
          </button>
        </div>
      ) : null}

      <VenderFormProgress state={v.state} />

      <VenderWizardShell currentStep={v.state.step}>
        {v.state.step === 0 ? (
          <VenderStepMachine
            state={v.state}
            errors={v.errors}
            setField={v.setField}
            setFolleto={v.setFolleto}
            setImagenes={v.setImagenes}
          />
        ) : (
          <VenderStepContact state={v.state} errors={v.errors} setField={v.setField} />
        )}
      </VenderWizardShell>

      <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {v.state.step === 1 ? (
            <button type="button" className={secondaryButtonClass()} onClick={v.goBack}>
              Atrás
            </button>
          ) : (
            <span className="text-sm text-[#5A6C7D]">Paso 1 de 2 — datos de la máquina</span>
          )}
        </div>
        <div>
          {v.state.step === 0 ? (
            <button type="button" className={primaryButtonClass()} onClick={v.goNext}>
              Continuar
            </button>
          ) : (
            <button type="button" className={primaryButtonClass(v.submitting)} onClick={v.submit} disabled={v.submitting}>
              {v.submitting ? 'Enviando…' : 'Enviar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
