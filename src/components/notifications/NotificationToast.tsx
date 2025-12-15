import React, { memo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import type { GameNotification } from '../../types';

const NotificationIcon = memo<{ type: GameNotification['type'] }>(function NotificationIcon({ type }) {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    default:
      return <Info className="w-5 h-5 text-blue-400" />;
  }
});

interface NotificationItemProps {
  notification: GameNotification;
  onDismiss: (id: string) => void;
}

const NotificationItem = memo<NotificationItemProps>(function NotificationItem({
  notification,
  onDismiss
}) {
  const bgColors = {
    success: 'from-green-900/90 to-green-800/90 border-green-500/30',
    warning: 'from-yellow-900/90 to-amber-800/90 border-yellow-500/30',
    error: 'from-red-900/90 to-red-800/90 border-red-500/30',
    info: 'from-blue-900/90 to-blue-800/90 border-blue-500/30'
  };

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg bg-gradient-to-r ${bgColors[notification.type]}`}
    >
      <NotificationIcon type={notification.type} />

      <div className="flex-1 min-w-0 pr-6">
        <h4 className="font-semibold text-white text-sm">{notification.title}</h4>
        <p className="text-slate-300 text-sm mt-0.5 line-clamp-2">{notification.message}</p>
      </div>

      <button
        onClick={() => onDismiss(notification.id)}
        className="absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="닫기"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar for auto-dismiss */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }}
      />
    </motion.div>
  );
});

export const NotificationToast = memo(function NotificationToast() {
  const { notifications, markNotificationRead } = useGameStore();

  const handleDismiss = useCallback((id: string) => {
    markNotificationRead(id);
  }, [markNotificationRead]);

  // Show only unread notifications (max 5)
  const visibleNotifications = notifications
    .filter(n => !n.read)
    .slice(0, 5);

  return (
    <div
      className="fixed top-20 right-4 z-50 w-80 space-y-2"
      role="region"
      aria-label="알림"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={handleDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
});
