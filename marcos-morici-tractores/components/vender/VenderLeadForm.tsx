'use client';

import { useVenderLeadForm } from '@/components/vender/hooks/useVenderLeadForm';
import VenderWizardShell from '@/components/vender/VenderWizardShell';
import VenderStepMachine from '@/components/vender/steps/VenderStepMachine';
import VenderStepContact from '@/components/vender/steps/VenderStepContact';

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

export default function VenderLeadForm() {
  const v = useVenderLeadForm();

  if (v.submitSuccess) {
    return (
      <div className="rounded-xl border border-[#4A7C59]/40 bg-[#F8FAFB] p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-[#1E3A5F] uppercase mb-2">Consulta enviada</h2>
        <p className="text-[#5A6C7D] mb-6 max-w-lg mx-auto">
          Gracias por los datos. Nos pondremos en contacto a la brevedad. Si querés, podés abrir WhatsApp con el
          mismo resumen para coordinar fotos o documentación.
        </p>
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
        </div>
      </div>
    );
  }

  return (
    <div>
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
