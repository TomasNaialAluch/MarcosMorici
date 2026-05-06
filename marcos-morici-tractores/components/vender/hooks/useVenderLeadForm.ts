'use client';

import { useCallback, useState } from 'react';
import type { VenderFormErrors, VenderFormState } from '@/lib/types/venderLead';
import { createInitialVenderFormState } from '@/lib/vender/initialState';
import {
  validateFullForm,
  validateStepMachine,
  validateVenderFiles,
} from '@/lib/vender/validators';
import { persistVenderLead } from '@/lib/firebase/venderLeads';
import { buildLeadWhatsappMessage } from '@/lib/vender/buildLeadWhatsappMessage';
import { openWhatsApp } from '@/lib/utils/whatsapp';

export interface UseVenderLeadFormReturn {
  state: VenderFormState;
  errors: VenderFormErrors;
  bannerError: string | null;
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
}

export function useVenderLeadForm(): UseVenderLeadFormReturn {
  const [state, setState] = useState<VenderFormState>(createInitialVenderFormState);
  const [errors, setErrors] = useState<VenderFormErrors>({});
  const [bannerError, setBannerError] = useState<string | null>(null);
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
    const e = validateStepMachine(state);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setState((s) => ({ ...s, step: 1 }));
    setErrors({});
  }, [state]);

  const goBack = useCallback(() => {
    setState((s) => ({ ...s, step: 0 }));
    setErrors({});
    setBannerError(null);
  }, []);

  const openLeadWhatsApp = useCallback(() => {
    openWhatsApp(buildLeadWhatsappMessage(state));
  }, [state]);

  const submit = useCallback(async () => {
    setBannerError(null);
    const fileErr = validateVenderFiles(state.folleto, state.imagenes);
    if (fileErr) {
      setErrors({});
      setBannerError(fileErr);
      return;
    }
    const e = validateFullForm(state);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      const machineErr = validateStepMachine(state);
      if (Object.keys(machineErr).length > 0) {
        setState((s) => ({ ...s, step: 0 }));
      }
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
      } else {
        setSubmitSuccess(false);
        setLastLeadId(null);
        setBannerError(
          result.error ??
            'No pudimos registrar la consulta. Podés enviar los mismos datos por WhatsApp.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  }, [state]);

  const reset = useCallback(() => {
    setState(createInitialVenderFormState());
    setErrors({});
    setBannerError(null);
    setSubmitSuccess(false);
    setLastLeadId(null);
  }, []);

  return {
    state,
    errors,
    bannerError,
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
  };
}
