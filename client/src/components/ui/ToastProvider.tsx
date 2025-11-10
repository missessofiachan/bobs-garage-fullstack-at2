import { createContext, useCallback, useContext, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

export type ToastMsg = {
  id: number;
  title?: string;
  body: string;
  variant?: string;
  requestId?: string;
};

type ToastCtx = { notify: (msg: Omit<ToastMsg, 'id'>) => void };

const Ctx = createContext<ToastCtx | null>(null);

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastMsg[]>([]);
  const notify = useCallback((msg: Omit<ToastMsg, 'id'>) => {
    setItems((arr) => [...arr, { id: Date.now() + Math.random(), ...msg }]);
  }, []);
  const onClose = (id: number) => setItems((arr) => arr.filter((t) => t.id !== id));
  return (
    <Ctx.Provider value={{ notify }}>
      {children}
      <ToastContainer position="bottom-end" className="p-3" aria-live="polite" aria-atomic="true">
        {items.map((t) => (
          <Toast
            key={t.id}
            bg={t.variant as any}
            onClose={() => onClose(t.id)}
            delay={3000}
            autohide
            role="alert"
            aria-live={t.variant === 'danger' ? 'assertive' : 'polite'}
          >
            {t.title && (
              <Toast.Header closeButton>
                <strong className="me-auto">{t.title}</strong>
              </Toast.Header>
            )}
            <Toast.Body>
              {t.body}
              {t.requestId && (
                <div className="mt-2">
                  <small className="text-muted d-flex align-items-center gap-2">
                    <span>
                      Request ID: <code className="small">{t.requestId.substring(0, 8)}...</code>
                    </span>
                    <button
                      className="btn btn-link btn-sm p-0 text-decoration-none"
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(t.requestId!);
                      }}
                      title="Copy full request ID"
                    >
                      📋
                    </button>
                  </small>
                </div>
              )}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('ToastProvider missing');
  return ctx;
}
