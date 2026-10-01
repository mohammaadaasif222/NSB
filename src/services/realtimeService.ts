import Pusher, { type ChannelAuthorizationHandler, type Channel } from 'pusher-js';
import apiService from './api';

type EventHandler = (data: any) => void;

class RealtimeService {
  private pusher: Pusher | null = null;
  private channel: Channel | null = null;
  private handlers: Map<string, EventHandler[]> = new Map();
  private connected = false;
  private subscriptionReady = false; // Track when subscription actually succeeds

  /**
   * Authorize a private channel subscription through the API.
   * Uses apiService so auth tokens are automatically included
   * and session-expired errors go through proper handling.
   */
  private createAuthorizer(): ChannelAuthorizationHandler {
    return ({ socketId, channelName }, callback) => {
      console.log(`[REALTIME-AUTH-START] Authorizing channel: ${channelName}`);
      apiService
        .post('/realtime/auth', { socket_id: socketId, channel_name: channelName })
        .then((res: any) => {
          const { auth } = res as unknown as { auth?: string };
          console.log(`[REALTIME-AUTH-SUCCESS] Channel ${channelName} authorized`);
          if (auth) {
            callback(null, { auth });
          } else {
            console.error(`[REALTIME-AUTH-ERROR] No auth signature in response`);
            callback(new Error('The API did not sign the subscription'), null);
          }
        })
        .catch((error: { message?: string }) => {
          console.error(
            `[REALTIME-AUTH-ERROR] Failed to authorize channel ${channelName}: ${error?.message}`
          );
          callback(new Error(error?.message || 'Could not authorise channel subscription'), null);
        });
    };
  }

  connect(userId: string, _token: string): void {
    if (this.connected) {
      console.log(`[REALTIME-CONNECT-SKIP] Already connected to Soketi`);
      return;
    }

    console.log(`[REALTIME-CONNECT-START] Connecting to Soketi...`);
    console.log(
      `[REALTIME-CONFIG] App Key: ${process.env.NEXT_PUBLIC_SOKETI_APP_KEY || 'default'}, Host: ${process.env.NEXT_PUBLIC_SOKETI_HOST || 'localhost'}, Port: ${process.env.NEXT_PUBLIC_SOKETI_PORT || '6001'}`
    );

    this.pusher = new Pusher(process.env.NEXT_PUBLIC_SOKETI_APP_KEY || 'app-key', {
      cluster: 'soketi',
      wsHost: process.env.NEXT_PUBLIC_SOKETI_HOST || 'localhost',
      wsPort: parseInt(process.env.NEXT_PUBLIC_SOKETI_PORT || '6001'),
      wssPort: parseInt(process.env.NEXT_PUBLIC_SOKETI_PORT || '6001'),
      forceTLS: process.env.NEXT_PUBLIC_SOKETI_USE_TLS !== 'false',
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      // Use custom channel authorizer that posts to backend /realtime/auth
      channelAuthorization: {
        customHandler: this.createAuthorizer(),
      },
    });

    // Add Pusher connection event listeners for debugging
    this.pusher.connection.bind('connected', () => {
      console.log(`[REALTIME-SOCKET-CONNECTED] WebSocket connected to Soketi`);
    });

    this.pusher.connection.bind('disconnected', () => {
      console.warn(`[REALTIME-SOCKET-DISCONNECTED] WebSocket disconnected from Soketi`);
    });

    this.pusher.connection.bind('failed', () => {
      console.error(`[REALTIME-SOCKET-FAILED] WebSocket connection failed`);
    });

    const channelName = `private-user.${userId}`;
    console.log(`[REALTIME-SUBSCRIBE-START] Subscribing to channel: ${channelName}`);

    this.channel = this.pusher.subscribe(channelName);

    // Add channel subscription event listeners
    this.channel.bind('pusher:subscription_succeeded', () => {
      console.log(`[REALTIME-SUBSCRIBE-SUCCESS] Successfully subscribed to channel ${channelName}`);
      this.subscriptionReady = true; // Mark subscription as ready for handler binding

      // Delay demo message request to give EventListeners component time to mount and register handlers.
      // EventListeners calls realtime.on() in useEffect, which must complete before demo message arrives.
      // 2000ms is needed to handle both fast hot-reloads AND slower fresh page loads.
      // Timeline: page load (~50-200ms) + React mount (~50-150ms) + useEffect (~20-100ms) + safety = ~2000ms total
      setTimeout(() => {
        console.log(`[REALTIME-DEMO-REQUEST] Requesting demo message from backend...`);
        import('./api').then(({ default: apiService }) => {
          // Start 5-second timeout (will be cleared if message arrives)
          if ((window as any).__startDemoTimeout) {
            (window as any).__startDemoTimeout();
          }
          apiService
            .get('/realtime/demo-message')
            .then(() => console.log(`[REALTIME-DEMO-REQUEST-SENT] Demo request sent successfully`))
            .catch((err) => console.log(`[REALTIME-DEMO-REQUEST-ERROR] ${err.message}`));
        });
      }, 2000);
    });

    this.channel.bind('pusher:subscription_error', (error: any) => {
      console.error(
        `[REALTIME-SUBSCRIBE-ERROR] Failed to subscribe to channel ${channelName}:`,
        error
      );
    });

    this.connected = true;

    console.log(`[REALTIME-CONNECTED] Connected to Soketi channel ${channelName}`);
  }

  on(eventName: string, handler: EventHandler): void {
    // If subscription isn't ready yet, wait for it before binding.
    // This prevents the "[REALTIME-BIND-FAIL]" error when EventListeners mounts before subscription completes.
    if (!this.subscriptionReady) {
      console.log(`[REALTIME-BIND-WAIT] Subscription not ready yet for ${eventName}, waiting...`);
      // Poll until subscription is ready, then bind
      const checkReady = setInterval(() => {
        if (this.subscriptionReady) {
          clearInterval(checkReady);
          console.log(`[REALTIME-BIND-RETRY] Subscription ready, retrying bind for ${eventName}`);
          this.on(eventName, handler); // Retry binding now that subscription is ready
        }
      }, 100);
      return;
    }

    if (!this.channel) {
      console.warn(`[REALTIME-BIND-FAIL] Channel not connected, cannot bind ${eventName}`);
      return;
    }

    if (!this.handlers.has(eventName)) {
      console.log(
        `[REALTIME-FIRST-HANDLER] First handler for ${eventName}, binding to channel ${this.channel.name}`
      );
      this.handlers.set(eventName, []);
      this.channel.bind(eventName, (data: any) => {
        console.log(`[REALTIME-EVENT-FIRED] Event ${eventName} fired with data:`, data);
        const handlers = this.handlers.get(eventName);
        if (handlers) {
          console.log(
            `[REALTIME-DISPATCH] Dispatching to ${handlers.length} handlers for ${eventName}`
          );
          handlers.forEach((h, index) => {
            console.log(
              `[REALTIME-HANDLER-CALL] Calling handler ${index + 1}/${handlers.length} for ${eventName}`
            );
            try {
              h(data);
              console.log(
                `[REALTIME-HANDLER-SUCCESS] Handler ${index + 1} completed for ${eventName}`
              );
            } catch (err) {
              console.error(
                `[REALTIME-HANDLER-ERROR] Handler ${index + 1} threw error for ${eventName}:`,
                err
              );
            }
          });
        } else {
          console.warn(`[REALTIME-NO-HANDLERS] No handlers found for ${eventName}`);
        }
      });
      console.log(`[REALTIME-BIND-SUCCESS] Bound ${eventName} to channel ${this.channel.name}`);
    }

    this.handlers.get(eventName)?.push(handler);
    console.log(
      `[REALTIME-HANDLER-REGISTERED] Handler registered for ${eventName}, total handlers: ${this.handlers.get(eventName)?.length || 0}`
    );
  }

  off(eventName: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    }
  }

  disconnect(): void {
    if (this.channel) {
      this.channel.unbind_all();
      this.pusher?.unsubscribe(this.channel.name);
    }
    this.pusher?.disconnect();
    this.pusher = null;
    this.channel = null;
    this.handlers.clear();
    this.connected = false;
    this.subscriptionReady = false; // Reset subscription state

    console.log('[Realtime] Disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const realtimeService = new RealtimeService();
