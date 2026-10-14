import Pusher, { type ChannelAuthorizationHandler, type Channel } from 'pusher-js';
import apiService from './api';

type EventHandler = (data: any) => void;

/** What the UI needs to know about the socket, without touching pusher-js. */
export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  /** Lost the socket and retrying — pusher-js reconnects on its own. */
  | 'unavailable'
  | 'disconnected'
  /** Gave up: no transport the browser can use. Retrying will not help. */
  | 'failed';

/**
 * One extra channel beyond the player's own, with the handlers registered for
 * it.
 *
 * The handlers live HERE rather than on the pusher-js Channel because the
 * Channel does not survive sign-out: disconnect() throws the whole Pusher
 * instance away, and the next connect() builds a new one with new Channel
 * objects. Keeping the registry on this side means a caller binds once and
 * stays bound across that, instead of every feature having to notice and
 * re-bind.
 */
interface JoinedChannel {
  /** The live pusher-js channel, or null while the socket is down. */
  channel: Channel | null;
  /** event name -> the handlers registered for it. */
  handlers: Map<string, Set<EventHandler>>;
  /** Called after every successful (re)subscription — see onChannelReady. */
  ready: Set<() => void>;
  /** True between subscription_succeeded and the next teardown. */
  subscribed: boolean;
}

class RealtimeService {
  private pusher: Pusher | null = null;
  private channel: Channel | null = null;
  private handlers: Map<string, EventHandler[]> = new Map();
  private connected = false;
  private subscriptionReady = false; // Track when subscription actually succeeds

  /** Shared channels (chat rooms), keyed by channel name. See joinChannel. */
  private joined: Map<string, JoinedChannel> = new Map();
  private connectionState: ConnectionState = 'idle';
  private connectionWatchers: Set<(state: ConnectionState) => void> = new Set();

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
      this.setConnectionState('connected');
    });

    this.pusher.connection.bind('connecting', () => {
      this.setConnectionState('connecting');
    });

    this.pusher.connection.bind('unavailable', () => {
      this.setConnectionState('unavailable');
    });

    this.pusher.connection.bind('disconnected', () => {
      console.warn(`[REALTIME-SOCKET-DISCONNECTED] WebSocket disconnected from Soketi`);
      this.setConnectionState('disconnected');
    });

    this.pusher.connection.bind('failed', () => {
      console.error(`[REALTIME-SOCKET-FAILED] WebSocket connection failed`);
      this.setConnectionState('failed');
    });

    this.setConnectionState('connecting');

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

    // Anything that joined while the socket was down — a chat panel opened
    // before sign-in finished, or still mounted across a sign-out — gets its
    // subscription back here, with its handlers already registered.
    for (const name of this.joined.keys()) {
      this.openJoinedChannel(name);
    }

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

    // The shared channels lose their live Channel but KEEP their handlers and
    // their place in the registry, so the next connect() restores them. A
    // caller that genuinely wants out calls leaveChannel().
    for (const entry of this.joined.values()) {
      entry.channel?.unbind_all();
      if (entry.channel) this.pusher?.unsubscribe(entry.channel.name);
      entry.channel = null;
      entry.subscribed = false;
    }

    this.pusher?.disconnect();
    this.pusher = null;
    this.channel = null;
    this.handlers.clear();
    this.connected = false;
    this.subscriptionReady = false; // Reset subscription state
    this.setConnectionState('idle');

    console.log('[Realtime] Disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  /* ------------------------------------------------------------------ *
   * Shared channels
   *
   * The API above is built around ONE channel, the signed-in player's own.
   * A chat room is the opposite: many people on one channel, and a given
   * client may be on a room and its own channel at once. These methods add
   * that without disturbing the single-channel path the wallet listeners
   * use — same socket, same authorizer, separate registry.
   * ------------------------------------------------------------------ */

  /** The socket's state right now, for a UI that renders it. */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Watch the socket's state. Returns an unsubscribe function, and calls the
   * handler once immediately so a component that mounts mid-connection
   * renders the state it is already in rather than waiting for a transition
   * that may never come.
   */
  onConnectionState(handler: (state: ConnectionState) => void): () => void {
    this.connectionWatchers.add(handler);
    handler(this.connectionState);
    return () => {
      this.connectionWatchers.delete(handler);
    };
  }

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState === state) return;
    this.connectionState = state;
    for (const watcher of this.connectionWatchers) {
      try {
        watcher(state);
      } catch (error) {
        console.error('[REALTIME-STATE-HANDLER-ERROR]', error);
      }
    }
  }

  /**
   * Join a shared channel, e.g. a chat room.
   *
   * Safe before the socket exists and safe to call repeatedly: joining is
   * reference-free bookkeeping, and the subscription is opened whenever a
   * connection is available. Pair it with leaveChannel.
   */
  joinChannel(name: string): void {
    if (!this.joined.has(name)) {
      this.joined.set(name, {
        channel: null,
        handlers: new Map(),
        ready: new Set(),
        subscribed: false,
      });
    }

    this.openJoinedChannel(name);
  }

  /** Stop listening to a shared channel and forget its handlers. */
  leaveChannel(name: string): void {
    const entry = this.joined.get(name);
    if (!entry) return;

    entry.channel?.unbind_all();
    if (entry.channel) this.pusher?.unsubscribe(name);
    this.joined.delete(name);
  }

  /**
   * Bind a handler to an event on a shared channel. Returns an unbind
   * function, so a React effect can clean up without having to keep hold of
   * the handler identity.
   *
   * Binding before the channel is subscribed is normal and needs no waiting:
   * the handler goes into the registry, and the dispatcher that reads it is
   * attached when the subscription opens. (The single-channel `on()` above
   * polls for readiness instead; this path does not need to, because the
   * registry is what the dispatcher reads, not the bind order.)
   */
  onChannelEvent(name: string, event: string, handler: EventHandler): () => void {
    this.joinChannel(name);
    const entry = this.joined.get(name);
    if (!entry) return () => undefined;

    let handlers = entry.handlers.get(event);

    if (!handlers) {
      handlers = new Set();
      entry.handlers.set(event, handlers);
      // One dispatcher per event, attached to whatever Channel is live. It
      // reads the Set each time it fires, so handlers added later are picked
      // up without re-binding, and re-subscribing re-attaches exactly one.
      this.bindDispatcher(name, event);
    }

    handlers.add(handler);

    return () => {
      handlers?.delete(handler);
    };
  }

  /**
   * Run a handler every time this channel's subscription succeeds — on the
   * first join and again after any reconnect.
   *
   * This is the hook for "I may have missed something": soketi has no replay,
   * so anything published while the socket was away is simply gone (see
   * soketi/README.md). A subscriber that cares refetches here.
   *
   * Fires immediately if the channel is already subscribed, so a late
   * listener still gets its snapshot.
   */
  onChannelReady(name: string, handler: () => void): () => void {
    this.joinChannel(name);
    const entry = this.joined.get(name);
    if (!entry) return () => undefined;

    entry.ready.add(handler);
    if (entry.subscribed) handler();

    return () => {
      entry.ready.delete(handler);
    };
  }

  /** Whether a shared channel's subscription is currently open. */
  isChannelSubscribed(name: string): boolean {
    return this.joined.get(name)?.subscribed === true;
  }

  /**
   * Open the subscription for a registered channel, if it is not open
   * already and there is a socket to open it on.
   */
  private openJoinedChannel(name: string): void {
    const entry = this.joined.get(name);
    if (!entry || !this.pusher || entry.channel) return;

    const channel = this.pusher.subscribe(name);
    entry.channel = channel;

    channel.bind('pusher:subscription_succeeded', () => {
      entry.subscribed = true;
      for (const handler of entry.ready) {
        try {
          handler();
        } catch (error) {
          console.error(`[REALTIME-READY-HANDLER-ERROR] ${name}:`, error);
        }
      }
    });

    channel.bind('pusher:subscription_error', (error: unknown) => {
      entry.subscribed = false;
      console.error(`[REALTIME-SUBSCRIBE-ERROR] ${name}:`, error);
    });

    // Re-attach a dispatcher for every event already registered: on a
    // reconnect the handlers survive but the Channel they were bound to does
    // not.
    for (const event of entry.handlers.keys()) {
      this.bindDispatcher(name, event);
    }
  }

  /** Attach the single dispatcher for one (channel, event) to the live Channel. */
  private bindDispatcher(name: string, event: string): void {
    const entry = this.joined.get(name);
    if (!entry?.channel) return;

    entry.channel.bind(event, (data: any) => {
      const handlers = entry.handlers.get(event);
      if (!handlers) return;

      // Iterated over a copy: a handler that unbinds itself while the event
      // is dispatching would otherwise mutate the Set mid-iteration.
      for (const handler of [...handlers]) {
        try {
          handler(data);
        } catch (error) {
          console.error(`[REALTIME-HANDLER-ERROR] ${event} on ${name}:`, error);
        }
      }
    });
  }
}

export const realtimeService = new RealtimeService();
