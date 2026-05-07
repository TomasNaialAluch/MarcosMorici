'use client';

import { useCallback, useState } from 'react';
import type { VenderFormErrors, VenderFormState } from '@/lib/types/venderLead';
import { createInitialVenderFormState } from '@/lib/vender/initialState';
import { validateFullForm, validateVenderFiles } from '@/lib/vender/validators';
import { persistVenderLead } from '@/lib/firebase/venderLeads';
import { markSolicitudPublished } from '@/lib/firebase/venderSolicitudes';
import { buildLeadWhatsappMessage } from '@/lib/vender/buildLeadWhatsappMessage';
import { openWhatsApp } from '@/lib/utils/whatsapp';

export interface UseVenderLeadFormOptions {
  /** Si venís desde el panel de solicitudes, al guardar el lead se marca la solicitud como publicada. */
  linkedSolicitudId?: string | null;
}

export interface UseVenderLeadFormReturn {
  state: VenderFormState;
  errors: VenderFormErrors;
  bannerError: string | null;
  /** Aviso si el lead se guardó pero falló la subida a Storage (o bucket ausente). */
  storageWarning: string | null;
  submitting: boolean;
  submitSuccess: boolean;
  lastLeadId: string | null;
  setField: <K extends keyof VenderFormState>(key: K, value: VenderFormState[K]) => void;
  setFolleto: (file: File | null) => void;
  setImagenes: (files: File[]) => void;
  goNext: () => void;
  goBack: () => void;
  submit: () => Promise<void>;
  openLeadWhatsApp: () => void;
  reset: () => void;
  mergeFromPartial: (partial: Partial<VenderFormState>) => void;
}

export function useVenderLeadForm(options?: UseVenderLeadFormOptions): UseVenderLeadFormReturn {
  const linkedSolicitudId = options?.linkedSolicitudId ?? null;
  const [state, setState] = useState<VenderFormState>(createInitialVenderFormState);
  const [errors, setErrors] = useState<VenderFormErrors>({});
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastLeadId, setLastLeadId] = useState<string | null>(null);

  const setField = useCallback(<K extends keyof VenderFormState>(key: K, value: VenderFormState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const setFolleto = useCallback((file: File | null) => {
    setState((s) => ({ ...s, folleto: file }));
  }, []);

  const setImagenes = useCallback((files: File[]) => {
    setState((s) => ({ ...s, imagenes: files }));
  }, []);

  const goNext = useCallback(() => {
    setBannerError(null);
    setStorageWarning(null);
    setErrors({});
    setState((s) => ({ ...s, step: 1 }));
  }, []);

  const goBack = useCallback(() => {
    setState((s) => ({ ...s, step: 0 }));
    setErrors({});
    setBannerError(null);
    setStorageWarning(null);
  }, []);

  const openLeadWhatsApp = useCallback(() => {
    openWhatsApp(buildLeadWhatsappMessage(state));
  }, [state]);

  const submit = useCallback(async () => {
    setBannerError(null);
    setStorageWarning(null);
    const fileErr = validateVenderFiles(state.folleto, state.imagenes);
    if (fileErr) {
      setErrors({});
      setBannerError(fileErr);
      return;
    }
    const e = validateFullForm(state);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      setState((s) => ({ ...s, step: 1 }));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const result = await persistVenderLead(state);
      if (result.ok) {
        setSubmitSuccess(true);
        setLastLeadId(result.leadId ?? null);
        setBannerError(null);
        setStorageWarning(result.storageWarning ?? null);
        if (linkedSolicitudId && result.leadId) {
          const marked = await markSolicitudPublished(linkedSolicitudId, result.leadId);
          if (!marked.ok && marked.error) {
            setStorageWarning((prev) =>
              [prev, ` La solicitud no se pudo marcar como publicada: ${marked.error}`].filter(Boolean).join('')
            );
          }
        }
      } else {
        setSubmitSuccess(false);
        setLastLeadId(null);
        setStorageWarning(null);
        setBannerError(
          result.error ??
            'No pudimos registrar la consulta. Podés enviar los mismos datos por WhatsApp.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  }, [state, linkedSolicitudId]);

  const reset = useCallback(() => {
    setState(createInitialVenderFormState());
    setErrors({});
    setBannerError(null);
    setStorageWarning(null);
    setSubmitSuccess(false);
    setLastLeadId(null);
  }, []);

  const mergeFromPartial = useCallback((partial: Partial<VenderFormState>) => {
    setState((s) => ({ ...s, ...partial }));
  }, []);

  return {
    state,
    errors,
    bannerError,
    storageWarning,
    submitting,
    submitSuccess,
    lastLeadId,
    setField,
    setFolleto,
    setImagenes,
    goNext,
    goBack,
    submit,
    openLeadWhatsApp,
    reset,
    mergeFromPartial,
  };
}
