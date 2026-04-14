import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

// ── Single Toast item ─────────────────────────────────────────────────────────

const ICONS = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
    </svg>
  ),
};

const TYPE_STYLES = {
  success: "bg-green-50 border-green-200 text-green-800",
  error:   "bg-red-50   border-red-200   text-red-800",
  info:    "bg-blue-50  border-blue-200  text-blue-800",
};

const ICON_STYLES = {
  success: "text-green-500",
  error:   "text-red-500",
  info:    "text-blue-500",
};

function ToastItem({ id, message, type, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Slight delay so the element is mounted before the CSS transition fires.
    const enterTimer = setTimeout(() => setVisible(true), 10);
    timerRef.current = setTimeout(() => handleDismiss(), 4000);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(id), 300); // wait for exit animation
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-md text-sm
        transition-all duration-300 ease-out cursor-pointer max-w-sm w-full
        ${TYPE_STYLES[type]}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
      onClick={handleDismiss}
      role="alert"
    >
      <span className={ICON_STYLES[type]}>{ICONS[type]}</span>
      <span className="flex-1 leading-snug">{message}</span>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────

let _toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "info") => {
    const id = ++_toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Convenience shortcuts used throughout the app.
  toast.success = (msg) => toast(msg, "success");
  toast.error   = (msg) => toast(msg, "error");
  toast.info    = (msg) => toast(msg, "info");

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container — fixed top-centre, above everything */}
      <div
        aria-live="polite"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none"
        style={{ width: "min(calc(100vw - 2rem), 24rem)" }}
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full">
            <ToastItem {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
