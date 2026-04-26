"use client";

import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });

  function showToast(message, type = "success") {
    setToast({
      open: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 2500);
  }

  function closeToast() {
    setToast((prev) => ({ ...prev, open: false }));
  }

  const value = useMemo(
    () => ({
      showToast,
      closeToast,
    }),
    [],
  );

  const style =
    toast.type === "error"
      ? "bg-red-600/20 border-red-500/30 text-red-300"
      : "bg-green-600/20 border-green-500/30 text-green-300";

  return (
    <ToastContext.Provider value={value}>
      {children}

      {toast.open && (
        <div className="fixed top-5 right-5 z-[200] w-full max-w-sm px-4">
          <div className={`border rounded-2xl px-4 py-3 shadow-lg ${style}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm">{toast.message}</p>
              <button
                onClick={closeToast}
                className="text-xs px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
