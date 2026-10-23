import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useRealtimeEvents } from '@/hooks/useRealtimeEvents';
import { useWallet } from '@/context/WalletContext';
import { currentLocale, translate } from '@/i18n/translate';

type DepositStatus = 'DEPOSIT_DETECTED' | 'DEPOSIT_CONFIRMED' | 'DEPOSIT_FAILED';
type WithdrawalStatus = 'WITHDRAW_PENDING_RISK' | 'WITHDRAW_RISK_APPROVED' | 'WITHDRAW_APPROVED' | 'WITHDRAW_PROCESSING' | 'WITHDRAW_COMPLETED' | 'WITHDRAW_REJECTED' | 'WITHDRAW_FAILED';

interface DepositStatusUpdate {
  id: string;
  currencyCode: string;
  networkCode: string;
  amount: string;
  status: DepositStatus;
  message: string;
  confirmations: number;
  requiredConfirmations: number;
  timestamp: string;
}

interface WithdrawalStatusUpdate {
  id: string;
  currencyCode: string;
  networkCode: string;
  amount: string;
  status: WithdrawalStatus;
  message: string;
  timestamp: string;
}

/**
 * Central event listener for all real-time events.
 * Handles: deposits, withdrawals, wagers, etc.
 *
 * Add once in app layout:
 *   <EventListeners />
 */
export function EventListeners() {
  const realtime = useRealtimeEvents();
  const { refresh: refreshWallet } = useWallet();
  const toastIdRef = useRef<string | number | null>(null);
  const withdrawalToastIdRef = useRef<string | number | null>(null);

  // Deposit Events
  useEffect(() => {
    const handleDepositUpdate = (update: DepositStatusUpdate) => {
      console.log('[DEPOSIT-EVENT-RECEIVED] Event received:', {
        id: update.id,
        status: update.status,
        currencyCode: update.currencyCode,
        networkCode: update.networkCode,
        message: update.message,
        confirmations: update.confirmations,
        requiredConfirmations: update.requiredConfirmations,
        timestamp: update.timestamp,
      });

      switch (update.status) {
        case 'DEPOSIT_DETECTED':
          console.log('[DEPOSIT-TOAST-DETECTED] Creating/updating INFO toast for DEPOSIT_DETECTED');
          if (toastIdRef.current) {
            console.log(`[DEPOSIT-TOAST-UPDATE] Updating existing toast ${toastIdRef.current}`);
            toast.update(toastIdRef.current, {
              render: (
                <div>
                  <div className="font-semibold">{update.message}</div>
                  <div className="text-xs mt-1 opacity-75">
                    {update.currencyCode} • {update.networkCode}
                  </div>
                </div>
              ),
              type: 'info',
              autoClose: false,
            });
          } else {
            console.log('[DEPOSIT-TOAST-CREATE] Creating new INFO toast for DEPOSIT_DETECTED');
            toastIdRef.current = toast.info(
              <div>
                <div className="font-semibold">{update.message}</div>
                <div className="text-xs mt-1 opacity-75">
                  {update.currencyCode} • {update.networkCode}
                </div>
              </div>,
              { autoClose: false, position: 'bottom-right' },
            );
            console.log(`[DEPOSIT-TOAST-CREATED] Toast created with ID: ${toastIdRef.current}`);
          }
          break;

        case 'DEPOSIT_CONFIRMED':
          console.log('[DEPOSIT-TOAST-CONFIRMED] Creating/updating SUCCESS toast for DEPOSIT_CONFIRMED');
          if (toastIdRef.current) {
            console.log(`[DEPOSIT-TOAST-UPDATE] Updating existing toast ${toastIdRef.current} to success`);
            toast.update(toastIdRef.current, {
              render: (
                <div>
                  <div className="font-semibold">{update.message}</div>
                  <div className="text-sm mt-1">
                    +{update.amount} {update.currencyCode}
                  </div>
                </div>
              ),
              type: 'success',
              autoClose: 5000,
            });
          } else {
            console.log('[DEPOSIT-TOAST-CREATE] Creating new SUCCESS toast for DEPOSIT_CONFIRMED');
            toastIdRef.current = toast.success(
              <div>
                <div className="font-semibold">{update.message}</div>
                <div className="text-sm mt-1">
                  +{update.amount} {update.currencyCode}
                </div>
              </div>,
              { position: 'bottom-right', autoClose: 5000 },
            );
            console.log(`[DEPOSIT-TOAST-CREATED] Success toast created with ID: ${toastIdRef.current}`);
          }

          // Refresh wallet balance after deposit confirmation
          console.log('[DEPOSIT-CONFIRMED-REFRESH-BALANCE] Refreshing wallet balance after deposit confirmation');
          refreshWallet()
            .then((summary) => {
              console.log('[DEPOSIT-CONFIRMED-BALANCE-UPDATED] Wallet balance refreshed:', summary?.balance?.total_amount);
            })
            .catch((err) => {
              console.error('[DEPOSIT-CONFIRMED-REFRESH-ERROR] Failed to refresh wallet balance:', err instanceof Error ? err.message : String(err));
            });

          toastIdRef.current = null;
          break;

        case 'DEPOSIT_FAILED':
          console.log('[DEPOSIT-TOAST-FAILED] Creating/updating ERROR toast for DEPOSIT_FAILED');
          if (toastIdRef.current) {
            console.log(`[DEPOSIT-TOAST-UPDATE] Updating existing toast ${toastIdRef.current} to error`);
            toast.update(toastIdRef.current, {
              render: update.message,
              type: 'error',
              autoClose: 5000,
            });
          } else {
            console.log('[DEPOSIT-TOAST-CREATE] Creating new ERROR toast for DEPOSIT_FAILED');
            toastIdRef.current = toast.error(update.message, {
              position: 'bottom-right',
              autoClose: 5000,
            });
            console.log(`[DEPOSIT-TOAST-CREATED] Error toast created with ID: ${toastIdRef.current}`);
          }
          toastIdRef.current = null;
          break;

        default:
          console.warn('[DEPOSIT-TOAST-UNKNOWN] Unknown deposit status:', update.status);
      }
    };

    console.log('[DEPOSIT-LISTENER-REGISTER] Registering deposit.update event listener');
    realtime.on('deposit.update', handleDepositUpdate);

    return () => {
      console.log('[DEPOSIT-LISTENER-UNREGISTER] Unregistering deposit.update event listener');
      realtime.off('deposit.update', handleDepositUpdate);
    };
  }, [realtime]);

  // Withdrawal Events
  useEffect(() => {
    const handleWithdrawalUpdate = (update: WithdrawalStatusUpdate) => {
      console.log('[WITHDRAWAL-EVENT-RECEIVED] Event received:', {
        id: update.id,
        status: update.status,
        currencyCode: update.currencyCode,
        networkCode: update.networkCode,
        amount: update.amount,
        message: update.message,
        timestamp: update.timestamp,
      });

      switch (update.status) {
        case 'WITHDRAW_PENDING_RISK':
          console.log('[WITHDRAWAL-TOAST-PENDING] Creating/updating INFO toast for WITHDRAW_PENDING_RISK');
          if (withdrawalToastIdRef.current) {
            console.log(`[WITHDRAWAL-TOAST-UPDATE] Updating existing toast ${withdrawalToastIdRef.current}`);
            toast.update(withdrawalToastIdRef.current, {
              render: (
                <div>
                  <div className="font-semibold">{update.message}</div>
                  <div className="text-xs mt-1 opacity-75">
                    -{update.amount} {update.currencyCode}
                  </div>
                </div>
              ),
              type: 'info',
              autoClose: false,
            });
          } else {
            console.log('[WITHDRAWAL-TOAST-CREATE] Creating new INFO toast for WITHDRAW_PENDING_RISK');
            withdrawalToastIdRef.current = toast.info(
              <div>
                <div className="font-semibold">{update.message}</div>
                <div className="text-xs mt-1 opacity-75">
                  -{update.amount} {update.currencyCode}
                </div>
              </div>,
              { autoClose: false, position: 'bottom-right' },
            );
            console.log(`[WITHDRAWAL-TOAST-CREATED] Toast created with ID: ${withdrawalToastIdRef.current}`);
          }
          break;

        case 'WITHDRAW_RISK_APPROVED':
          console.log('[WITHDRAWAL-TOAST-RISK-APPROVED] Creating/updating INFO toast for WITHDRAW_RISK_APPROVED');
          if (withdrawalToastIdRef.current) {
            console.log(`[WITHDRAWAL-TOAST-UPDATE] Updating existing toast ${withdrawalToastIdRef.current}`);
            toast.update(withdrawalToastIdRef.current, {
              render: (
                <div>
                  <div className="font-semibold">{update.message}</div>
                  <div className="text-xs mt-1 opacity-75">
                    {update.currencyCode} • {update.networkCode}
                  </div>
                </div>
              ),
              type: 'info',
              autoClose: false,
            });
          } else {
            console.log('[WITHDRAWAL-TOAST-CREATE] Creating new INFO toast for WITHDRAW_RISK_APPROVED');
            withdrawalToastIdRef.current = toast.info(
              <div>
                <div className="font-semibold">{update.message}</div>
                <div className="text-xs mt-1 opacity-75">
                  {update.currencyCode} • {update.networkCode}
                </div>
              </div>,
              { autoClose: false, position: 'bottom-right' },
            );
            console.log(`[WITHDRAWAL-TOAST-CREATED] Toast created with ID: ${withdrawalToastIdRef.current}`);
          }
          break;

        case 'WITHDRAW_APPROVED':
          console.log('[WITHDRAWAL-TOAST-APPROVED] Creating/updating INFO toast for WITHDRAW_APPROVED');
          if (withdrawalToastIdRef.current) {
            console.log(`[WITHDRAWAL-TOAST-UPDATE] Updating existing toast ${withdrawalToastIdRef.current}`);
            toast.update(withdrawalToastIdRef.current, {
              render: (
                <div>
                  <div className="font-semibold">{update.message}</div>
                  <div className="text-xs mt-1 opacity-75">
                    {update.currencyCode} • {update.networkCode}
                  </div>
                </div>
              ),
              type: 'info',
              autoClose: false,
            });
          } else {
            console.log('[WITHDRAWAL-TOAST-CREATE] Creating new INFO toast for WITHDRAW_APPROVED');
            withdrawalToastIdRef.current = toast.info(
              <div>
                <div className="font-semibold">{update.message}</div>
                <div className="text-xs mt-1 opacity-75">
                  {update.currencyCode} • {update.networkCode}
                </div>
              </div>,
              { autoClose: false, position: 'bottom-right' },
            );
            console.log(`[WITHDRAWAL-TOAST-CREATED] Toast created with ID: ${withdrawalToastIdRef.current}`);
          }
          break;

        case 'WITHDRAW_PROCESSING':
          console.log('[WITHDRAWAL-TOAST-PROCESSING] Creating/updating INFO toast for WITHDRAW_PROCESSING');
          if (withdrawalToastIdRef.current) {
            console.log(`[WITHDRAWAL-TOAST-UPDATE] Updating existing toast ${withdrawalToastIdRef.current}`);
            toast.update(withdrawalToastIdRef.current, {
              render: (
                <div>
                  <div className="font-semibold">{update.message}</div>
                  <div className="text-xs mt-1 opacity-75">
                    {update.currencyCode} • {update.networkCode}
                  </div>
                </div>
              ),
              type: 'info',
              autoClose: false,
            });
          } else {
            console.log('[WITHDRAWAL-TOAST-CREATE] Creating new INFO toast for WITHDRAW_PROCESSING');
            withdrawalToastIdRef.current = toast.info(
              <div>
                <div className="font-semibold">{update.message}</div>
                <div className="text-xs mt-1 opacity-75">
                  {update.currencyCode} • {update.networkCode}
                </div>
              </div>,
              { autoClose: false, position: 'bottom-right' },
            );
            console.log(`[WITHDRAWAL-TOAST-CREATED] Toast created with ID: ${withdrawalToastIdRef.current}`);
          }
          break;

        case 'WITHDRAW_COMPLETED':
          console.log('[WITHDRAWAL-TOAST-COMPLETED] Creating/updating SUCCESS toast for WITHDRAW_COMPLETED');
          if (withdrawalToastIdRef.current) {
            console.log(`[WITHDRAWAL-TOAST-UPDATE] Updating existing toast ${withdrawalToastIdRef.current} to success`);
            toast.update(withdrawalToastIdRef.current, {
              render: (
                <div>
                  <div className="font-semibold">{update.message}</div>
                  <div className="text-sm mt-1">
                    -{update.amount} {update.currencyCode}
                  </div>
                </div>
              ),
              type: 'success',
              autoClose: 5000,
            });
          } else {
            console.log('[WITHDRAWAL-TOAST-CREATE] Creating new SUCCESS toast for WITHDRAW_COMPLETED');
            withdrawalToastIdRef.current = toast.success(
              <div>
                <div className="font-semibold">{update.message}</div>
                <div className="text-sm mt-1">
                  -{update.amount} {update.currencyCode}
                </div>
              </div>,
              { position: 'bottom-right', autoClose: 5000 },
            );
            console.log(`[WITHDRAWAL-TOAST-CREATED] Success toast created with ID: ${withdrawalToastIdRef.current}`);
          }

          // Refresh wallet balance after withdrawal completion
          console.log('[WITHDRAWAL-COMPLETED-REFRESH-BALANCE] Refreshing wallet balance after withdrawal completion');
          refreshWallet()
            .then((summary) => {
              console.log('[WITHDRAWAL-COMPLETED-BALANCE-UPDATED] Wallet balance refreshed:', summary?.balance?.total_amount);
            })
            .catch((err) => {
              console.error('[WITHDRAWAL-COMPLETED-REFRESH-ERROR] Failed to refresh wallet balance:', err instanceof Error ? err.message : String(err));
            });

          withdrawalToastIdRef.current = null;
          break;

        case 'WITHDRAW_REJECTED':
          console.log('[WITHDRAWAL-TOAST-REJECTED] Creating/updating ERROR toast for WITHDRAW_REJECTED');
          if (withdrawalToastIdRef.current) {
            console.log(`[WITHDRAWAL-TOAST-UPDATE] Updating existing toast ${withdrawalToastIdRef.current} to error`);
            toast.update(withdrawalToastIdRef.current, {
              render: update.message,
              type: 'error',
              autoClose: 5000,
            });
          } else {
            console.log('[WITHDRAWAL-TOAST-CREATE] Creating new ERROR toast for WITHDRAW_REJECTED');
            withdrawalToastIdRef.current = toast.error(update.message, {
              position: 'bottom-right',
              autoClose: 5000,
            });
            console.log(`[WITHDRAWAL-TOAST-CREATED] Error toast created with ID: ${withdrawalToastIdRef.current}`);
          }
          withdrawalToastIdRef.current = null;
          break;

        case 'WITHDRAW_FAILED':
          console.log('[WITHDRAWAL-TOAST-FAILED] Creating/updating ERROR toast for WITHDRAW_FAILED');
          if (withdrawalToastIdRef.current) {
            console.log(`[WITHDRAWAL-TOAST-UPDATE] Updating existing toast ${withdrawalToastIdRef.current} to error`);
            toast.update(withdrawalToastIdRef.current, {
              render: update.message,
              type: 'error',
              autoClose: 5000,
            });
          } else {
            console.log('[WITHDRAWAL-TOAST-CREATE] Creating new ERROR toast for WITHDRAW_FAILED');
            withdrawalToastIdRef.current = toast.error(update.message, {
              position: 'bottom-right',
              autoClose: 5000,
            });
            console.log(`[WITHDRAWAL-TOAST-CREATED] Error toast created with ID: ${withdrawalToastIdRef.current}`);
          }
          withdrawalToastIdRef.current = null;
          break;

        default:
          console.warn('[WITHDRAWAL-TOAST-UNKNOWN] Unknown withdrawal status:', update.status);
      }
    };

    console.log('[WITHDRAWAL-LISTENER-REGISTER] Registering withdrawal.update event listener');
    realtime.on('withdrawal.update', handleWithdrawalUpdate);

    return () => {
      console.log('[WITHDRAWAL-LISTENER-UNREGISTER] Unregistering withdrawal.update event listener');
      realtime.off('withdrawal.update', handleWithdrawalUpdate);
    };
  }, [realtime]);

  // Demo message event (for testing real-time connection)
  const demoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleDemoMessage = (data: any) => {
      console.log('[DEMO-MESSAGE-RECEIVED] Demo message received:', data);

      // Clear timeout since message arrived
      if (demoTimeoutRef.current) {
        clearTimeout(demoTimeoutRef.current);
        demoTimeoutRef.current = null;
      }

      toast.success(
        <div>
          {/* <div className="font-semibold">✅ {translate('misc.realtime.okTitle')}</div> */}
          <div className="font-semibold">{data.message}</div>
          {/* <div className="text-sm mt-2">{data.message}</div> */}
          <div className="text-xs mt-1 opacity-75">
            {translate('misc.realtime.random', { value: data.randomNumber })} •{' '}
            {new Date(data.timestamp).toLocaleTimeString(currentLocale())}
          </div>
        </div>,
        { position: 'bottom-right', autoClose: 5000 }
      );
    };

    // Store timeout function for demo request
    const startDemoTimeout = () => {
      demoTimeoutRef.current = setTimeout(() => {
        console.error('[DEMO-MESSAGE-TIMEOUT] Demo message not received within 5 seconds');
        toast.error(
          <div>
            <div className="font-semibold">⚠️ {translate('misc.realtime.issueTitle')}</div>
            <div className="text-sm mt-2">{translate('misc.realtime.issueBody')}</div>
            <div className="text-xs mt-1 opacity-75">{translate('misc.realtime.issueHint')}</div>
          </div>,
          { position: 'bottom-right', autoClose: 7000 }
        );
      }, 5000);
    };

    // Expose timeout function globally for demo request
    (window as any).__startDemoTimeout = startDemoTimeout;

    console.log('[DEMO-LISTENER-REGISTER] Registering demo.message event listener');
    realtime.on('demo.message', handleDemoMessage);

    return () => {
      console.log('[DEMO-LISTENER-UNREGISTER] Unregistering demo.message event listener');
      realtime.off('demo.message', handleDemoMessage);
      if (demoTimeoutRef.current) {
        clearTimeout(demoTimeoutRef.current);
      }
    };
  }, [realtime]);

  // Add more event listeners here for withdrawals, wagers, etc.

  return null;
}
