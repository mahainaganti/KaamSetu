"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type PendingConfirm = ConfirmOptions & { resolve: (result: boolean) => void };

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  function respond(result: boolean) {
    pending?.resolve(result);
    setPending(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div className="modal-overlay" onClick={() => respond(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <div className="modal-title">{pending.title}</div>
            <div className="modal-message">{pending.message}</div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => respond(false)}>
                {pending.cancelLabel ?? "Cancel"}
              </button>
              <button type="button" className="btn-danger" onClick={() => respond(true)}>
                {pending.confirmLabel ?? "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used within a ConfirmProvider");
  return context;
}
