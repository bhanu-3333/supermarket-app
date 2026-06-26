import { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    description: '',
    type: 'success',
    duration: 3000,
  });

  const showToast = ({ message, description = '', type = 'success', duration = 3000 }) => {
    setToast({
      visible: true,
      message,
      description,
      type,
      duration,
    });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // Convenience methods
  const success = (message, description = '') => {
    showToast({ message, description, type: 'success' });
  };

  const error = (message, description = '') => {
    showToast({ message, description, type: 'error' });
  };

  const warning = (message, description = '') => {
    showToast({ message, description, type: 'warning' });
  };

  const info = (message, description = '') => {
    showToast({ message, description, type: 'info' });
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        description={toast.description}
        type={toast.type}
        duration={toast.duration}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
