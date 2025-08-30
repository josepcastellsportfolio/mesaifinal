import { useCallback } from 'react';
import { useUIStore } from '@/store/ui.store';
import { NOTIFICATION_TYPES, NOTIFICATION_DURATION } from '@/types';

export const useNotifications = () => {
  const { addNotification, removeNotification, clearNotifications } = useUIStore();

  const showNotification = useCallback((
    type: keyof typeof NOTIFICATION_TYPES,
    title: string,
    message?: string,
    duration?: number
  ) => {
    addNotification({
      type: NOTIFICATION_TYPES[type],
      title,
      message,
      duration: duration ?? NOTIFICATION_DURATION.MEDIUM,
    });
  }, [addNotification]);

  const showSuccess = useCallback((title: string, message?: string) => {
    showNotification('SUCCESS', title, message);
  }, [showNotification]);

  const showError = useCallback((title: string, message?: string) => {
    showNotification('ERROR', title, message, NOTIFICATION_DURATION.LONG);
  }, [showNotification]);

  const showWarning = useCallback((title: string, message?: string) => {
    showNotification('WARNING', title, message);
  }, [showNotification]);

  const showInfo = useCallback((title: string, message?: string) => {
    showNotification('INFO', title, message);
  }, [showNotification]);

  const showPersistent = useCallback((title: string, message?: string) => {
    showNotification('INFO', title, message, NOTIFICATION_DURATION.PERSISTENT);
  }, [showNotification]);

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showPersistent,
    removeNotification,
    clearNotifications,
  };
};
