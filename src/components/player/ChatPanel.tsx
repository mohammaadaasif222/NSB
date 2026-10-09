import { useLayoutEffect, useMemo, useRef, useState, type FC, type FormEvent } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { useMe } from '@/context/UserContext';
import { useGroupChat } from '@/hooks/useGroupChat';
import { PanelHeader, PanelIconButton } from '@/components/player/HeaderPopover';
import { CloseIcon, SendIcon, ChatIcon } from '@/components/icons';
import type { ChatMessage } from '@/services/chat';
import type { ConnectionState } from '@/services/realtimeService';
/**
 * The lobby's group chat.
 *
 * Everyone signed in is in one room. Messages arrive over the Soketi socket
 * and go out over REST — the browser cannot broadcast on the channel it
 * listens to, by design, so there is no path into the room that skips the
 * API's checks (see services/chat.ts).
 *
 * The panel mounts and unmounts with the header popover, and useGroupChat is
 * tied to that: closing it drops the subscription rather than holding one
 * open behind a shut tray.
 */
/** A deterministic tint per author, so the same person keeps the same colour. */
const AVATAR_TONES = [
  'bg-amber-500',
  'bg-blue-600',
  'bg-emerald-600',
  'bg-fuchsia-600',
  'bg-rose-500',
  'bg-cyan-600',
  'bg-violet-600',
  'bg-lime-600',
];
/**
 * Pick a tone from the author's id.
 *
 * Keyed on the ACCOUNT id, not the display name: a name can change, and an
 * avatar that changes colour when somebody renames themselves makes a room
 * harder to read than one with no colour at all.
 */
const toneFor = (userId: string): string => {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
};
const initialOf = (name: string): string => name.trim().charAt(0).toUpperCase() || '?';
/** Wall-clock time, in the viewer's own locale and zone. */
const timeOf = (iso: string): string => {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return '';
  return at.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};
const Avatar: FC<{ message: ChatMessage }> = ({ message }) =>
  message.avatar_url ? (
    // Not next/image: the URL is whatever a player set, so it is not a
    // configured remote pattern and next/image would refuse it at runtime.
    // The header's own glyphs are plain <img> for the same reason.
    <img
      src={message.avatar_url}
      alt=""
      className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
    />
  ) : (
    <span
      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${toneFor(
        message.user_id
      )}`}
      aria-hidden="true"
    >
      {initialOf(message.name)}
    </span>
  );
interface RowProps {
  message: ChatMessage;
  /** The viewer's own line — highlighted so a room is skimmable. */
  mine: boolean;
  /** Same author as the line above, within a couple of minutes. */
  grouped: boolean;
}
const MessageRow: FC<RowProps> = ({ message, mine, grouped }) => (
  <li className={`flex gap-2 ${grouped ? 'mt-0.5' : 'mt-3'}`}>
    {/* The gutter is held open on a grouped line rather than removed, so the
        text of consecutive messages stays on one left edge. */}
    {grouped ? (
      <span className="h-7 w-7 flex-shrink-0" aria-hidden="true" />
    ) : (
      <Avatar message={message} />
    )}
    <div className="min-w-0 flex-1">
      {!grouped && (
        <div className="flex items-baseline gap-2">
          <span
            className={`truncate text-[11px] font-bold ${mine ? 'text-blue-400' : 'text-slate-300'}`}
          >
            {message.name}
          </span>
          <time dateTime={message.at} className="flex-shrink-0 text-[10px] text-slate-500">
            {timeOf(message.at)}
          </time>
        </div>
      )}
      {/* `break-words` and `whitespace-pre-wrap`: the body keeps the newlines
          the sender typed, and an unbroken 300-character string must wrap
          instead of widening the panel. Rendered as a text node — React
          escapes it, which is why the API stores it unescaped. */}
      <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-200">
        {message.body}
      </p>
    </div>
  </li>
);
/** How close consecutive messages must be to be grouped under one heading. */
const GROUPING_WINDOW_MS = 120_000;
const Empty: FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-slate-600">
      <ChatIcon size={22} />
    </span>
    <p className="text-xs text-slate-500">{message}</p>
  </div>
);
/**
 * The socket's state, shown only when it is not `connected`.
 *
 * A green "connected" badge is noise — working is the expected case. What a
 * player needs to know is the opposite: that the room has gone quiet because
 * the socket dropped, not because nobody is talking.
 */
const ConnectionNote: FC<{ state: ConnectionState; label: string }> = ({ state, label }) => {
  if (state === 'connected') return null;
  return (
    <p className="border-t border-slate-700 bg-slate-900/60 px-4 py-1.5 text-center text-[10px] text-amber-400/90">
      {label}
    </p>
  );
};
const ChatPanel: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  const { me } = useMe();
  const { messages, loading, error, connection, limits, sending, cooldownMs, send } =
    useGroupChat();
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  /**
   * Whether the player is following the bottom of the room.
   *
   * Updated from the SCROLL handler, not from an effect that measures after a
   * render. Appending a message grows `scrollHeight` without moving
   * `scrollTop`, so a measurement taken after that render always reads as
   * "scrolled up" and auto-follow would switch itself off on the first
   * message. A scroll event only fires when something actually scrolls, so
   * this holds whatever the player last did — which is the question being
   * asked.
   */
  const pinned = useRef(true);
  const trackPinned = (): void => {
    const list = listRef.current;
    if (!list) return;
    // 48px of slack: a player who has nudged up a line or two is still
    // following the room, and an exact-zero test would fight them.
    pinned.current = list.scrollHeight - list.scrollTop - list.clientHeight < 48;
  };
  /**
   * Follow the room, but only for someone who was already at the bottom.
   * Scrolling up to read something is a deliberate act, and the next message
   * must not undo it.
   *
   * A layout effect so the jump happens before the browser paints: as a
   * passive effect the new message is visible at the old scroll position for
   * a frame first, which reads as a flicker.
   */
  useLayoutEffect(() => {
    if (pinned.current) {
      endRef.current?.scrollIntoView({ block: 'end' });
    }
  }, [messages]);
  const cooling = cooldownMs > 0;
  const tooLong = draft.trim().length > limits.max_length;
  const canSend = draft.trim().length > 0 && !tooLong && !sending && !cooling;
  /**
   * Group consecutive lines from one author.
   *
   * Recomputed only when the list changes, not on every keystroke in the
   * composer — which is most of this component's renders.
   */
  const rows = useMemo(
    () =>
      messages.map((message, i) => {
        const previous = messages[i - 1];
        return {
          message,
          grouped:
            previous !== undefined &&
            previous.user_id === message.user_id &&
            Date.parse(message.at) - Date.parse(previous.at) < GROUPING_WINDOW_MS,
        };
      }),
    [messages]
  );
  const submit = (e: FormEvent): void => {
    e.preventDefault();
    if (!canSend) return;
    const body = draft;
    // Cleared optimistically so typing the next message is never blocked on
    // the round trip; restored below if the send is refused, so nothing a
    // player typed is lost to a failure.
    setDraft('');
    void send(body).then((accepted) => {
      if (!accepted) setDraft((current) => (current.length === 0 ? body : current));
    });
  };
  const remaining = limits.max_length - draft.trim().length;
  return (
    <div className="flex h-[30rem] flex-col">
      <PanelHeader
        title={t('chat.title')}
        action={
          <PanelIconButton label={t('nav.closeMenu')} onClick={onClose}>
            <CloseIcon size={17} />
          </PanelIconButton>
        }
      />
      {loading && messages.length === 0 ? (
        <Empty message={t('chat.loading')} />
      ) : messages.length === 0 ? (
        <Empty message={t('chat.empty')} />
      ) : (
        <div
          ref={listRef}
          onScroll={trackPinned}
          className="thin-scrollbar flex-1 overflow-y-auto px-4 pb-2"
        >
          <ul>
            {rows.map(({ message, grouped }) => (
              <MessageRow
                key={message.id}
                message={message}
                mine={message.user_id === me?.id}
                grouped={grouped}
              />
            ))}
          </ul>
          {/* Scroll target. A ref on the last <li> would move every time a
              message arrives, and the effect above would chase it. */}
          <div ref={endRef} />
        </div>
      )}
      {error && (
        <p role="alert" className="px-4 pb-1 text-[10px] text-rose-400">
          {error}
        </p>
      )}
      <ConnectionNote state={connection} label={t('chat.reconnecting')} />
      <form onSubmit={submit} className="flex items-center gap-2 border-t border-slate-700 p-3">
        <div className="relative min-w-0 flex-1">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            // A generous ceiling rather than the exact cap: typing should stop
            // at a counter the player can see, not at a field that silently
            // swallows keystrokes. The real limit is the counter and the
            // disabled button, and the API enforces it regardless.
            maxLength={limits.max_length * 2}
            placeholder={cooling ? t('chat.slowMode') : t('chat.placeholder')}
            aria-label={t('chat.placeholder')}
            aria-invalid={tooLong}
            className={`w-full rounded-xl border bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 ${
              tooLong ? 'border-rose-500/60' : 'border-slate-700'
            }`}
          />
          {/* Shown only once it is nearly relevant — a counter sitting at 300
              from the first keystroke is just clutter. */}
          {remaining <= 60 && (
            <span
              className={`pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-[10px] ${
                remaining < 0 ? 'text-rose-400' : 'text-slate-500'
              }`}
            >
              {remaining}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={!canSend}
          aria-label={t('chat.send')}
          title={cooling ? t('chat.slowMode') : t('chat.send')}
          className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400"
        >
          <SendIcon size={16} />
        </button>
      </form>
    </div>
  );
};
export default ChatPanel;
