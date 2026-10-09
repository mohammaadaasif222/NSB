import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type FormEvent,
  type ReactNode,
} from 'react';
import { useTranslation } from '@/context/I18nContext';
import { useMe } from '@/context/UserContext';
import { useGroupChat } from '@/hooks/useGroupChat';
import EmojiPopover from '@/components/player/EmojiPopover';
import {
  ArrowUpIcon,
  ChatIcon,
  CloseIcon,
  SmileIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from '@/components/icons';
import { NO_REACTIONS, type ChatMessage, type ReactionKind } from '@/services/chat';
import type { ConnectionState } from '@/services/realtimeService';

/**
 * The lobby's group chat.
 *
 * Everyone signed in is in one room. Messages arrive over the Soketi socket
 * and go out over REST — the browser cannot broadcast on the channel it
 * listens to, by design, so there is no path into the room that skips the
 * API's checks (see services/chat.ts).
 *
 * This is the panel's contents only; ChatDrawer is the sliding shell around
 * it. The split matters for the subscription: the drawer unmounts this after
 * the closing slide, and useGroupChat is tied to that mount, so a shut drawer
 * holds no socket.
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
  return at.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};

const Avatar: FC<{ message: ChatMessage }> = ({ message }) =>
  message.avatar_url ? (
    // Not next/image: the URL is whatever a player set, so it is not a
    // configured remote pattern and next/image would refuse it at runtime.
    // The header's own glyphs are plain <img> for the same reason.
    <img
      src={message.avatar_url}
      alt=""
      className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
    />
  ) : (
    <span
      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${toneFor(
        message.user_id
      )}`}
      aria-hidden="true"
    >
      {initialOf(message.name)}
    </span>
  );

/**
 * Thumbs up / down, on somebody else's message.
 *
 * Never drawn on your own line — the server refuses a self-reaction too, so
 * this is presentation of a rule rather than the rule itself.
 *
 * A count is shown only once it is non-zero. A row of permanent "0"s beside
 * every message is visual noise that makes the room harder to read, and the
 * button is just as clickable without one.
 */
const ReactionBar: FC<{
  message: ChatMessage;
  onReact: (messageId: string, reaction: ReactionKind) => void;
}> = ({ message, onReact }) => {
  const { t } = useTranslation();
  const reactions = message.reactions ?? NO_REACTIONS;

  const button = (kind: ReactionKind, label: string, count: number, icon: ReactNode) => {
    const active = reactions.mine === kind;

    return (
      <button
        type="button"
        onClick={() => onReact(message.id, kind)}
        aria-label={label}
        title={label}
        // Announces the toggle state, so a screen reader says "pressed"
        // rather than leaving the fill as the only signal.
        aria-pressed={active}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors ${
          active
            ? 'bg-[#4a9eff]/15 text-[#4a9eff]'
            : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
        }`}
      >
        {/* Filled once reacted: at this size a fill is far easier to spot
            than a tint. */}
        <span className={active ? 'fill-current' : undefined}>{icon}</span>
        {count > 0 && <span className="tabular-nums">{count}</span>}
      </button>
    );
  };

  return (
    // -ms-1.5 pulls the first button's padding back so the icons line up with
    // the message text above rather than sitting indented from it.
    <div className="-ms-1.5 mt-1 flex items-center gap-0.5">
      {button('up', t('chat.like'), reactions.up, <ThumbsUpIcon size={13} />)}
      {button('down', t('chat.dislike'), reactions.down, <ThumbsDownIcon size={13} />)}
    </div>
  );
};

interface RowProps {
  message: ChatMessage;
  /** The viewer's own line. Drawn as a bubble on the end edge. */
  mine: boolean;
  /** Same author as the line above, within a couple of minutes. */
  grouped: boolean;
  /** Only ever called for somebody else's message. */
  onReact: (messageId: string, reaction: ReactionKind) => void;
}

/**
 * One line.
 *
 * The two sides are deliberately NOT symmetrical. Someone else's message
 * needs an avatar and a name, because the question it answers is "who said
 * this?". Your own needs neither — you know — so it is a bubble pushed to the
 * end edge with the time underneath, which is the shape every messaging app
 * has trained people to read as "mine".
 */
const MessageRow: FC<RowProps> = ({ message, mine, grouped, onReact }) =>
  mine ? (
    <li className={`flex flex-col items-end ${grouped ? 'mt-1' : 'mt-3'}`}>
      {/* 85%, not a fixed width: a two-word message should be a two-word
          bubble, and a long one still has to leave the left edge visible so
          the alignment still reads as "mine". */}
      <div className="max-w-[85%] rounded-2xl rounded-ee-md bg-[#2b3141] px-3.5 py-2">
        <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-slate-100">
          {message.body}
        </p>
      </div>
      {/* Under the bubble rather than beside the name, because there is no
          name on this side to put it beside. */}
      <time dateTime={message.at} className="mt-1 pe-1 text-[10px] text-slate-500">
        {timeOf(message.at)}
      </time>
    </li>
  ) : (
    <li className={`flex gap-2.5 ${grouped ? 'mt-1' : 'mt-3'}`}>
      {/* The gutter is held open on a grouped line rather than removed, so the
          text of consecutive messages stays on one left edge. */}
      {grouped ? (
        <span className="h-8 w-8 flex-shrink-0" aria-hidden="true" />
      ) : (
        <Avatar message={message} />
      )}

      <div className="min-w-0 flex-1">
        {!grouped && (
          <div className="flex items-baseline gap-2">
            <span className="truncate text-[13px] font-semibold text-[#4a9eff]">
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
        <p className="mt-0.5 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-slate-200">
          {message.body}
        </p>

        <ReactionBar message={message} onReact={onReact} />
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
    <p className="border-t border-slate-800 bg-slate-900/60 px-4 py-1.5 text-center text-[10px] text-amber-400/90">
      {label}
    </p>
  );
};

const ChatPanel: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  const { me } = useMe();
  const { messages, loading, error, connection, limits, sending, cooldownMs, send, react } =
    useGroupChat();

  const [draft, setDraft] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  /**
   * Drop an emoji in at the caret, not at the end.
   *
   * Someone who clicks back into the middle of a sentence to add a face means
   * it to go there. Appending would quietly move it, and is the thing that
   * makes a picker feel bolted on.
   */
  const insertEmoji = (emoji: string): void => {
    const input = inputRef.current;

    if (!input) {
      setDraft((current) => current + emoji);
      return;
    }

    const start = input.selectionStart ?? draft.length;
    const end = input.selectionEnd ?? start;

    setDraft(draft.slice(0, start) + emoji + draft.slice(end));

    // After React has written the new value back, or the caret would be set
    // against the old one and jump as soon as it re-renders.
    requestAnimationFrame(() => {
      input.focus();
      const caret = start + emoji.length;
      input.setSelectionRange(caret, caret);
    });
  };

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    if (!canSend) return;

    const body = draft;
    // Cleared optimistically so typing the next message is never blocked on
    // the round trip; restored below if the send is refused, so nothing a
    // player typed is lost to a failure.
    setDraft('');
    setEmojiOpen(false);

    void send(body).then((accepted) => {
      if (!accepted) setDraft((current) => (current.length === 0 ? body : current));
    });
  };

  const remaining = limits.max_length - draft.trim().length;

  return (
    <>
      <header className="flex items-center justify-between gap-2 border-b border-slate-800 px-4 py-3.5">
        <h2 className="text-base font-bold text-white">{t('chat.title')}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('nav.closeMenu')}
          title={t('nav.closeMenu')}
          className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <CloseIcon size={18} />
        </button>
      </header>

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
                onReact={react}
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

      {/* `relative` so the emoji popover can anchor to the composer. */}
      <form onSubmit={submit} className="relative border-t border-slate-800 p-3">
        <EmojiPopover
          open={emojiOpen}
          onClose={() => setEmojiOpen(false)}
          onPick={insertEmoji}
          label={t('chat.emoji')}
        />

        <div className="flex items-center gap-2">
          <div className="relative flex min-w-0 flex-1 items-center rounded-full border border-slate-700 bg-slate-900 ps-4 pe-1 transition-colors focus-within:border-blue-500/60">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              // A generous ceiling rather than the exact cap: typing should
              // stop at a counter the player can see, not at a field that
              // silently swallows keystrokes. The real limit is the counter
              // and the disabled button, and the API enforces it regardless.
              maxLength={limits.max_length * 2}
              placeholder={cooling ? t('chat.slowMode') : t('chat.placeholder')}
              aria-label={t('chat.placeholder')}
              aria-invalid={tooLong}
              className="min-w-0 flex-1 bg-transparent py-2.5 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none"
            />

            {/* Shown only once it is nearly relevant — a counter sitting at
                300 from the first keystroke is just clutter. */}
            {remaining <= 60 && (
              <span
                className={`pointer-events-none px-1 text-[10px] ${
                  remaining < 0 ? 'text-rose-400' : 'text-slate-500'
                }`}
              >
                {remaining}
              </span>
            )}

            <button
              type="button"
              data-emoji-toggle
              onClick={() => setEmojiOpen((v) => !v)}
              aria-label={t('chat.emoji')}
              title={t('chat.emoji')}
              aria-expanded={emojiOpen}
              aria-haspopup="dialog"
              className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10 ${
                emojiOpen ? 'text-[#4a9eff]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <SmileIcon size={18} />
            </button>
          </div>

          <button
            type="submit"
            disabled={!canSend}
            aria-label={t('chat.send')}
            title={cooling ? t('chat.slowMode') : t('chat.send')}
            className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2b3141] text-white transition-colors hover:bg-[#363d50] disabled:text-slate-500 disabled:hover:bg-[#2b3141]"
          >
            <ArrowUpIcon size={18} />
          </button>
        </div>
      </form>
    </>
  );
};

export default ChatPanel;
