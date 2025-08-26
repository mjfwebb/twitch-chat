import React, { createContext, useEffect, useRef, useState } from 'react';
import { Toast } from './Toast';

export interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setMessage(msg);

    // Clear any existing timer
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    // Hide toast after 3 seconds
    toastTimerRef.current = window.setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && <Toast message={message} />}
    </ToastContext.Provider>
  );
};

export { ToastContext };
