import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { realtimeService } from '@/services/realtimeService';

/**
 * Initialize real-time event listener for the current user.
 * Call once in your app layout to establish the WebSocket connection.
 *
 * Usage:
 *   // In _app.tsx or layout
 *   export function RealtimeListener() {
 *     useRealtimeEvents();
 *     return null;
 *   }
 *
 * Then listen for events anywhere:
 *   import { realtimeService } from '@/services/realtimeService';
 *
 *   useEffect(() => {
 *     realtimeService.on('deposit.update', (data) => {
 *       console.log('Deposit:', data);
 *     });
 *   }, []);
 */
export const useRealtimeEvents = () => {
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token || !user?.id) {
      realtimeService.disconnect();
      return;
    }

    realtimeService.connect(user.id, token);

    return () => {
      realtimeService.disconnect();
    };
  }, [token, user?.id]);

  return realtimeService;
};
