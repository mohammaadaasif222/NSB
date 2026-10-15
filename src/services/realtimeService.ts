import Pusher, { type ChannelAuthorizationHandler, type Channel } from 'pusher-js';
import apiService from './api';

type EventHandler = (data: any) => void;

export type ConnectionState =
  'idle' | 'connecting' | 'connected' | 'unavailable' | 'disconnected' | 'failed';

interface JoinedChannel {
  channel: Channel | null;
  handlers: Map<string, Set<EventHandler>>;
  ready: Set<() => void>;
  subscribed: boolean;
}

interface PendingBind {
  eventName: string;
  handler: EventHandler;
}

const DEBUG_KEY = 'rlk:realtime-debug';

const debugEnabled = (): boolean => {
  try {
    if (typeof window !== 'undefined') {
      const override = window.localStorage?.getItem(DEBUG_KEY);
      if (override === '1') return true;
      if (override === '0') return false;
    }
  } catch {
    /* storage unavailable */
  }

  return process.env.NEXT_PUBLIC_REALTIME_DEBUG !== 'false';
};

const log = (...args: unknown[]): void => {
  if (!debugEnabled()) return;
  // eslint-disable-next-line no-console
  console.log('%c[realtime]', 'color:#4a9eff;font-weight:bold', ...args);
};

const warn = (...args: unknown[]): void => console.warn('[realtime]', ...args);

const fail = (...args: unknown[]): void => console.error('[realtime]', ...args);

const fingerprint = (value: string | undefined): string => {
  if (!value) return '<missing>';
  const hex = /^[0-9a-f]+$/i.test(value);
  return `${value.slice(0, 6)}…${value.slice(-4)} (len ${value.length}${hex ? '' : ', NOT hex'})`;
};

class RealtimeService {
  private pusher: Pusher | null = null;
  private channel: Channel | null = null;
  private handlers: Map<string, EventHandler[]> = new Map();
  private connected = false;
  private subscriptionReady = false;

  private pendingBinds: PendingBind[] = [];
  private demoTimer: ReturnType<typeof setTimeout> | null = null;

  private joined: Map<string, JoinedChannel> = new Map();
  private connectionState: ConnectionState = 'idle';
  private connectionWatchers: Set<(state: ConnectionState) => void> = new Set();

  private createAuthorizer(): ChannelAuthorizationHandler {
    return ({ socketId, channelName }, callback) => {
      log('auth requested', { channel: channelName, socketId });

      apiService
        .post('/realtime/auth', { socket_id: socketId, channel_name: channelName })
        .then((res: any) => {
          const { auth } = res as unknown as { auth?: string };

          if (auth) {
            log('auth granted', channelName);
            callback(null, { auth });
            return;
          }

          fail(
            `auth response for ${channelName} carried no signature — the API answered 2xx but without { auth }`
          );
          callback(new Error('The API did not sign the subscription'), null);
        })
        .catch((error: { message?: string; status?: number }) => {
          fail(
            `auth refused for ${channelName}`,
            `status=${error?.status ?? 'n/a'}`,
            error?.message ?? ''
          );
          callback(new Error(error?.message || 'Could not authorise channel subscription'), null);
        });
    };
  }

  private resetJoinedChannels(): void {
    for (const entry of this.joined.values()) {
      entry.channel?.unbind_all();
      entry.channel = null;
      entry.subscribed = false;
    }
  }

  private teardownPusher(): void {
    if (!this.pusher) return;

    this.pusher.connection.unbind_all();
    this.pusher.disconnect();
    this.pusher = null;
    this.channel = null;
  }

  connect(userId: string, _token: string): void {
    if (this.pusher) {
      const state = this.pusher.connection.state;

      if (state === 'connecting' || state === 'connected') {
        log(`connect() ignored — socket is already ${state}`);
        return;
      }

      log(`replacing a stale socket in state "${state}"`);
      this.teardownPusher();
      this.resetJoinedChannels();
    }

    this.connected = false;
    this.subscriptionReady = false;

    const appKey = process.env.NEXT_PUBLIC_SOKETI_APP_KEY;
    const host = process.env.NEXT_PUBLIC_SOKETI_HOST;
    const port = Number(process.env.NEXT_PUBLIC_SOKETI_PORT || '6001');
    const useTLS = process.env.NEXT_PUBLIC_SOKETI_USE_TLS !== 'false';

    log('connecting', {
      appKey: fingerprint(appKey),
      host,
      port,
      useTLS,
      url: `${useTLS ? 'wss' : 'ws'}://${host}:${port}/app/${appKey?.slice(0, 6)}…`,
      userId,
    });

    if (!appKey || !host) {
      fail(
        'cannot connect — NEXT_PUBLIC_SOKETI_APP_KEY or NEXT_PUBLIC_SOKETI_HOST is missing from this build'
      );
      this.setConnectionState('failed');
      return;
    }

    if (!Number.isFinite(port) || port <= 0) {
      fail(
        `cannot connect — NEXT_PUBLIC_SOKETI_PORT is not a usable port: "${process.env.NEXT_PUBLIC_SOKETI_PORT}"`
      );
      this.setConnectionState('failed');
      return;
    }

    const pusher = new Pusher(appKey, {
      cluster: 'soketi',
      wsHost: host,
      wsPort: port,
      wssPort: port,
      forceTLS: useTLS,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      channelAuthorization: {
        customHandler: this.createAuthorizer(),
      },
    });

    this.pusher = pusher;

    const live = (): boolean => this.pusher === pusher;

    pusher.connection.bind('state_change', (states: { previous: string; current: string }) => {
      log(`socket ${states.previous} -> ${states.current}`);
    });

    pusher.connection.bind('error', (event: any) => {
      const code = event?.error?.data?.code ?? event?.data?.code;
      const message = event?.error?.data?.message ?? event?.data?.message ?? '';

      if (code === 4001 || code === 4000) {
        fail(
          `the relay rejected this app key (code ${code}): ${message}`,
          '\nThe key in this build does not match SOKETI_DEFAULT_APP_KEY on the soketi server.',
          `\nkey sent: ${fingerprint(appKey)}`
        );
      } else {
        fail(`socket error${code ? ` (code ${code})` : ''}`, message || event);
      }
    });

    pusher.connection.bind('connected', () => {
      if (!live()) return;
      log('connected', { socketId: pusher.connection.socket_id });
      this.connected = true;
      this.setConnectionState('connected');
    });

    pusher.connection.bind('connecting', () => {
      if (!live()) return;
      this.setConnectionState('connecting');
    });

    pusher.connection.bind('disconnected', () => {
      if (!live()) return;
      warn('socket disconnected');
      this.connected = false;
      this.subscriptionReady = false;
      this.setConnectionState('disconnected');
    });

    pusher.connection.bind('unavailable', () => {
      if (!live()) return;
      warn('socket unavailable — the relay could not be reached');
      this.connected = false;
      this.subscriptionReady = false;
      this.setConnectionState('unavailable');
    });

    pusher.connection.bind('failed', () => {
      if (!live()) return;
      fail('socket failed — no usable transport, retrying will not help');
      this.connected = false;
      this.subscriptionReady = false;
      this.setConnectionState('failed');
    });

    this.setConnectionState('connecting');

    const channelName = `private-user.${userId}`;
    log('subscribing', channelName);

    const channel = pusher.subscribe(channelName);
    this.channel = channel;

    channel.bind('pusher:subscription_succeeded', () => {
      if (!live()) return;

      log('subscribed', channelName, `flushing ${this.pendingBinds.length} queued handler(s)`);
      this.subscriptionReady = true;
      this.flushPendingBinds();
      this.scheduleDemoMessage(pusher);
    });

    channel.bind('pusher:subscription_error', (error: unknown) => {
      if (!live()) return;
      fail(`could not subscribe to ${channelName}`, error);
      this.subscriptionReady = false;
    });

    for (const name of this.joined.keys()) {
      this.openJoinedChannel(name);
    }

    log('initialised, waiting for socket events');
  }

  private scheduleDemoMessage(pusher: Pusher): void {
    if (this.demoTimer) clearTimeout(this.demoTimer);

    this.demoTimer = setTimeout(() => {
      this.demoTimer = null;

      if (this.pusher !== pusher || !this.subscriptionReady) {
        log('demo message skipped — the socket changed');
        return;
      }

      const startDemoTimeout = (window as any).__startDemoTimeout;
      if (typeof startDemoTimeout === 'function') startDemoTimeout();

      void apiService
        .get('/realtime/demo-message')
        .then(() => log('demo message requested'))
        .catch((error: { message?: string }) =>
          warn('demo message request failed', error?.message)
        );
    }, 2000);
  }

  private flushPendingBinds(): void {
    if (this.pendingBinds.length === 0) return;

    const queued = this.pendingBinds;
    this.pendingBinds = [];

    for (const { eventName, handler } of queued) {
      this.on(eventName, handler);
    }
  }

  on(eventName: string, handler: EventHandler): void {
    if (!this.subscriptionReady || !this.channel) {
      log(`queued "${eventName}" until the subscription is ready`);
      this.pendingBinds.push({ eventName, handler });
      return;
    }

    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);

      this.channel.bind(eventName, (data: any) => {
        const handlers = this.handlers.get(eventName);
        if (!handlers || handlers.length === 0) return;

        log(`event "${eventName}"`, data);

        for (const registered of [...handlers]) {
          try {
            registered(data);
          } catch (error) {
            fail(`a handler for "${eventName}" threw`, error);
          }
        }
      });
    }

    this.handlers.get(eventName)?.push(handler);
    log(`bound "${eventName}" (${this.handlers.get(eventName)?.length} handler(s))`);
  }

  off(eventName: string, handler: EventHandler): void {
    this.pendingBinds = this.pendingBinds.filter(
      (pending) => !(pending.eventName === eventName && pending.handler === handler)
    );

    const handlers = this.handlers.get(eventName);
    if (!handlers) return;

    const index = handlers.indexOf(handler);
    if (index > -1) handlers.splice(index, 1);
  }

  disconnect(): void {
    if (this.demoTimer) {
      clearTimeout(this.demoTimer);
      this.demoTimer = null;
    }

    this.pendingBinds = [];

    if (this.channel) {
      this.channel.unbind_all();
      this.pusher?.unsubscribe(this.channel.name);
    }

    for (const entry of this.joined.values()) {
      entry.channel?.unbind_all();
      if (entry.channel) this.pusher?.unsubscribe(entry.channel.name);
      entry.channel = null;
      entry.subscribed = false;
    }

    this.teardownPusher();
    this.handlers.clear();
    this.connected = false;
    this.subscriptionReady = false;
    this.setConnectionState('idle');

    log('disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  diagnostics(): Record<string, unknown> {
    return {
      state: this.connectionState,
      socketState: this.pusher?.connection.state ?? 'no socket',
      socketId: this.pusher?.connection.socket_id ?? null,
      userChannel: this.channel?.name ?? null,
      subscriptionReady: this.subscriptionReady,
      queuedBinds: this.pendingBinds.length,
      boundEvents: [...this.handlers.entries()].map(([event, list]) => `${event} x${list.length}`),
      rooms: [...this.joined.entries()].map(([name, entry]) => ({
        name,
        subscribed: entry.subscribed,
        open: entry.channel !== null,
        events: [...entry.handlers.keys()],
      })),
      config: {
        appKey: fingerprint(process.env.NEXT_PUBLIC_SOKETI_APP_KEY),
        host: process.env.NEXT_PUBLIC_SOKETI_HOST,
        port: process.env.NEXT_PUBLIC_SOKETI_PORT,
        useTLS: process.env.NEXT_PUBLIC_SOKETI_USE_TLS !== 'false',
      },
      debugLogging: debugEnabled(),
    };
  }

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
        fail('a connection-state watcher threw', error);
      }
    }
  }

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

  leaveChannel(name: string): void {
    const entry = this.joined.get(name);
    if (!entry) return;

    entry.channel?.unbind_all();
    if (entry.channel) this.pusher?.unsubscribe(name);
    entry.handlers.clear();
    entry.ready.clear();
    this.joined.delete(name);
    log('left', name);
  }

  onChannelEvent(name: string, event: string, handler: EventHandler): () => void {
    this.joinChannel(name);
    const entry = this.joined.get(name);
    if (!entry) return () => undefined;

    let handlers = entry.handlers.get(event);

    if (!handlers) {
      handlers = new Set();
      entry.handlers.set(event, handlers);
      this.bindDispatcher(name, event);
    }

    handlers.add(handler);

    return () => {
      handlers?.delete(handler);
    };
  }

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

  isChannelSubscribed(name: string): boolean {
    return this.joined.get(name)?.subscribed === true;
  }

  private openJoinedChannel(name: string): void {
    const entry = this.joined.get(name);
    if (!entry || !this.pusher || entry.channel) return;

    const pusher = this.pusher;
    const channel = pusher.subscribe(name);
    entry.channel = channel;

    log('subscribing', name);

    channel.bind('pusher:subscription_succeeded', () => {
      if (this.pusher !== pusher) return;

      entry.subscribed = true;
      log('subscribed', name);

      for (const handler of entry.ready) {
        try {
          handler();
        } catch (error) {
          fail(`a ready handler for ${name} threw`, error);
        }
      }
    });

    channel.bind('pusher:subscription_error', (error: unknown) => {
      if (this.pusher !== pusher) return;
      entry.subscribed = false;
      fail(`could not subscribe to ${name}`, error);
    });

    for (const event of entry.handlers.keys()) {
      this.bindDispatcher(name, event);
    }
  }

  private bindDispatcher(name: string, event: string): void {
    const entry = this.joined.get(name);
    if (!entry?.channel) return;

    entry.channel.bind(event, (data: any) => {
      const handlers = entry.handlers.get(event);
      if (!handlers || handlers.size === 0) return;

      log(`event "${event}" on ${name}`, data);

      for (const handler of [...handlers]) {
        try {
          handler(data);
        } catch (error) {
          fail(`a handler for "${event}" on ${name} threw`, error);
        }
      }
    });
  }
}

export const realtimeService = new RealtimeService();

if (typeof window !== 'undefined') {
  (window as any).realtime = realtimeService;
}
