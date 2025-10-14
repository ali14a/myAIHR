import React, { createContext, useContext, useState } from 'react';
import type { NotificationContextType, Notification } from '../types/index';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration: number = 5000) => {
    const id = Date.now() + Math.random();
    const notification: Notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const success = (message: string, duration?: number) => addNotification(message, 'success', duration);
  const error = (message: string, duration?: number) => addNotification(message, 'error', duration);
  const warning = (message: string, duration?: number) => addNotification(message, 'warning', duration);
  const info = (message: string, duration?: number) => addNotification(message, 'info', duration);
  const clear = () => setNotifications([]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
    clear
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
