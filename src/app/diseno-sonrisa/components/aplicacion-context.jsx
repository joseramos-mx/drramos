"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Aplicacion · contexto global.
 * Cualquier CTA de la landing usa useAplicacion().openModal() para abrir
 * el sidebar del formulario. Acción única, etiqueta única.
 */

const AplicacionContext = createContext({
  open: false,
  openModal: () => {},
  closeModal: () => {},
});

export function AplicacionProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, openModal, closeModal }),
    [open, openModal, closeModal]
  );

  return (
    <AplicacionContext.Provider value={value}>
      {children}
    </AplicacionContext.Provider>
  );
}

export function useAplicacion() {
  return useContext(AplicacionContext);
}

// Etiqueta única del CTA en toda la página.
export const CTA_LABEL = "Agendar valoración privada";
