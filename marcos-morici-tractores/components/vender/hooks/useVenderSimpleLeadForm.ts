'use client';

import { useCallback, useState } from 'react';
import type { VenderSimpleFormErrors, VenderSimpleFormState } from '@/lib/types/venderSolicitud';
import { createInitialSimpleFormState } from '@/lib/vender/simpleInitialState';
import { validateSimpleSolicitud, validateVenderFiles } from '@/lib/vender/validators';
import { persistVenderSolicitud } from '@/lib/firebase/venderSolicitudes';

export function useVenderSimpleLeadForm() {
  const [state, setState] = useState<VenderSimpleFormState>(createInitialSimpleFormState);
  const [errors, setErrors] = useState<VenderSimpleFormErrors>({});
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);

  const setField = useCallback(<K extends keyof VenderSimpleFormState>(key: K, value: VenderSimpleFormState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const setFolleto = useCallback((file: File | null) => {
    setState((s) => ({ ...s, folleto: file }));
  }, []);

  const setImagenes = useCallback((files: File[]) => {
    setState((s) => ({ ...s, imagenes: files }));
  }, []);

  const submit = useCallback(async () => {
    setBannerError(null);
    setStorageWarning(null);
    const fileErr = validateVenderFiles(state.folleto, state.imagenes);
    if (fileErr) {
      setErrors({});
      setBannerError(fileErr);
      return;
    }
    const e = validateSimpleSolicitud(state);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const result = await persistVenderSolicitud(state);
      if (result.ok) {
        setSubmitSuccess(true);
        setLastId(result.solicitudId ?? null);
        setStorageWarning(result.storageWarning ?? null);
      } else {
        setSubmitSuccess(false);
        setBannerError(result.error ?? 'No se pudo enviar.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [state]);

  const reset = useCallback(() => {
    setState(createInitialSimpleFormState());
    setErrors({});
    setBannerError(null);
    setStorageWarning(null);
    setSubmitSuccess(false);
    setLastId(null);
  }, []);

  return {
    state,
    errors,
    bannerError,
    storageWarning,
    submitting,
    submitSuccess,
    lastId,
    setField,
    setFolleto,
    setImagenes,
    submit,
    reset,
  };
}
