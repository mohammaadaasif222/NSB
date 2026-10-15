import { useEffect } from 'react';
import { realtimeService } from '@/services/realtimeService';

export interface DepositNotification {
  id: string;
  currencyCode: string;
  networkCode: string;
  amount: string;
  status: string;
  message: string;
  error?: string;
  confirmations: number;
  timestamp: string;
}

interface UseDepositNotificationsOptions {
  onDepositUpdate?: (notification: DepositNotification) => void;
}

/**
 * Hook to listen for real-time deposit notifications via Pusher/Soketi
 * Automatically listens to 'deposit.update' events on the user's private channel
 *
 * Usage:
 * ```tsx
 * useDepositNotifications({
 *   onDepositUpdate: (notif) => {
 *     if (notif.status === 'DEPOSIT_FAILED') {
 *       showToast(`Deposit failed: ${notif.error}`);
 *     } else if (notif.status === 'DEPOSIT_CONFIRMED') {
 *       showToast(`Deposit confirmed! +${notif.amount} ${notif.currencyCode}`);
 *     }
 *   }
 * });
 * ```
 */
export const useDepositNotifications = ({
  onDepositUpdate,
}: UseDepositNotificationsOptions) => {
  useEffect(() => {
    if (!onDepositUpdate) return;

    const handleDepositUpdate = (data: DepositNotification) => {
      console.log('[DEPOSIT-NOTIFICATION] Received:', data);
      onDepositUpdate(data);
    };

    // Listen for deposit.update events on the user's private channel
    realtimeService.on('deposit.update', handleDepositUpdate);

    // Cleanup: remove the listener when component unmounts
    return () => {
      realtimeService.off('deposit.update', handleDepositUpdate);
    };
  }, [onDepositUpdate]);
};
