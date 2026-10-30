import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useTranslation } from '@/context/I18nContext';
import { useMe } from '@/context/UserContext';
import { useGroupChat } from '@/hooks/useGroupChat';
import { useChatAmbience } from '@/hooks/useChatAmbience';
import { useSupportChat } from '@/context/SupportChatContext';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import EmojiPopover from '@/components/player/EmojiPopover';
import ChatRoomPicker from '@/components/player/ChatRoomPicker';
import ChatRules from '@/components/player/ChatRules';
import VoiceMessage from '@/components/player/VoiceMessage';
import ChatReportDialog from '@/components/player/ChatReportDialog';
import MentionSuggest, {
  matchParticipants,
  readMentionQuery,
} from '@/components/player/MentionSuggest';
import {
  ArrowUpIcon,
  ChatIcon,
  CloseIcon,
  FlagIcon,
  InfoIcon,
  MicIcon,
  ReplyIcon,
  SmileIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  TrashIcon,
  ChevronLeftIcon,
} from '@/components/icons';
import {
  NO_REACTIONS,
  type ChatMessage,
  type ChatRoom,
  type MentionRef,
  type ReactionKind,
  type ReplyRef,
} from '@/services/chat';
import type { ConnectionState } from '@/services/realtimeService';

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

const GROUPING_WINDOW_MS = 120_000;

const FLASH_MS = 1400;

const NOTICE_MS = 4000;

const toneFor = (userId: string): string => {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
};

const initialOf = (name: string): string => name.trim().charAt(0).toUpperCase() || '?';

const timeOf = (iso: string): string => {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return '';
  return at.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};

const clock = (ms: number): string => {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const Avatar: FC<{ message: ChatMessage }> = ({ message }) =>
  message.avatar_url ? (
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

const MessageBody: FC<{ message: ChatMessage; meId?: string }> = ({ message, meId }) => {
  const mentions = message.mentions ?? [];

  const parts = useMemo(() => {
    if (mentions.length === 0) return [message.body];

    const names = [...mentions].sort((a, b) => b.name.length - a.name.length);
    const pattern = names
      .map((person) => `@${person.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
      .join('|');

    return message.body.split(new RegExp(`(${pattern})`, 'gi')).filter(Boolean);
  }, [message.body, mentions]);

  return (
    <p className="mt-0.5 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-slate-200">
      {parts.map((part, index) => {
        const hit = mentions.find(
          (person) => `@${person.name}`.toLowerCase() === part.toLowerCase()
        );

        if (!hit) return <span key={index}>{part}</span>;

        return (
          <span
            key={index}
            className={`rounded px-1 font-semibold ${
              hit.user_id === meId
                ? 'bg-[#f9d028]/20 text-[#f9d028]'
                : 'bg-[#4a9eff]/15 text-[#4a9eff]'
            }`}
          >
            {part}
          </span>
        );
      })}
    </p>
  );
};

const HoverAction: FC<{
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}> = ({ label, onClick, danger, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-500 opacity-0 transition hover:bg-white/5 focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100 ${
      danger ? 'hover:text-rose-400' : 'hover:text-slate-200'
    }`}
  >
    {children}
  </button>
);

const ReplyQuote: FC<{
  reply: ReplyRef;
  meId?: string;
  onJump: (messageId: string) => void;
}> = ({ reply, meId, onJump }) => {
  const { t } = useTranslation();
  const toMe = reply.user_id === meId;

  return (
    <button
      type="button"
      onClick={() => onJump(reply.id)}
      className={`mb-1 block w-full max-w-full rounded-md border-s-2 bg-white/[0.04] px-2 py-1 text-start transition-colors hover:bg-white/[0.07] ${
        toMe ? 'border-[#f9d028]' : 'border-[#4a9eff]/70'
      }`}
    >
      <span
        className={`block truncate text-[11px] font-semibold ${
          toMe ? 'text-[#f9d028]' : 'text-[#4a9eff]'
        }`}
      >
        {reply.name}
      </span>
      <span className="block truncate text-[11px] text-slate-400">
        {reply.kind === 'voice' ? t('chat.voiceMessage') : reply.body}
      </span>
    </button>
  );
};

const ReactionBar: FC<{
  message: ChatMessage;
  onReact: (messageId: string, reaction: ReactionKind) => void;
  onReply: (message: ChatMessage) => void;
  onReport: (message: ChatMessage) => void;
}> = ({ message, onReact, onReply, onReport }) => {
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
        aria-pressed={active}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors ${
          active
            ? 'bg-[#4a9eff]/15 text-[#4a9eff]'
            : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
        }`}
      >
        <span className={active ? 'fill-current' : undefined}>{icon}</span>
        {count > 0 && <span className="tabular-nums">{count}</span>}
      </button>
    );
  };

  return (
    <div className="-ms-1.5 mt-1 flex items-center gap-0.5">
      {button('up', t('chat.like'), reactions.up, <ThumbsUpIcon size={13} />)}
      {button('down', t('chat.dislike'), reactions.down, <ThumbsDownIcon size={13} />)}
      <span className="ms-1 flex items-center gap-0.5">
        <HoverAction label={t('chat.reply')} onClick={() => onReply(message)}>
          <ReplyIcon size={13} />
        </HoverAction>
        <HoverAction label={t('chat.report')} onClick={() => onReport(message)} danger>
          <FlagIcon size={12} />
        </HoverAction>
      </span>
    </div>
  );
};

const CONFIRM_WINDOW_MS = 3000;

const DeleteButton: FC<{
  messageId: string;
  onDelete: (messageId: string) => void;
}> = ({ messageId, onDelete }) => {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), CONFIRM_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [confirming]);

  if (confirming) {
    return (
      <button
        type="button"
        onClick={() => onDelete(messageId)}
        onBlur={() => setConfirming(false)}
        aria-label={t('chat.delete')}
        className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-medium text-rose-400 transition-colors hover:bg-rose-500/25"
      >
        <TrashIcon size={11} />
        {t('chat.deleteConfirm')}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={t('chat.delete')}
      title={t('chat.delete')}
      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-500 opacity-0 transition hover:bg-white/5 hover:text-rose-400 focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
    >
      <TrashIcon size={12} />
    </button>
  );
};

interface RowProps {
  message: ChatMessage;
  mine: boolean;
  grouped: boolean;
  flashing: boolean;
  meId?: string;
  onReact: (messageId: string, reaction: ReactionKind) => void;
  onDelete: (messageId: string) => void;
  onReply: (message: ChatMessage) => void;
  onReport: (message: ChatMessage) => void;
  onJump: (messageId: string) => void;
}

const MessageRow: FC<RowProps> = ({
  message,
  mine,
  grouped,
  flashing,
  meId,
  onReact,
  onDelete,
  onReply,
  onReport,
  onJump,
}) => {
  const { t } = useTranslation();
  const isVoice = message.kind === 'voice' && message.voice;
  const reply = message.reply_to ?? null;
  const spacing = grouped && !reply ? 'mt-1' : 'mt-3';
  const flash = flashing ? 'bg-[#4a9eff]/10' : '';

  if (mine) {
    return (
      <li
        id={`chat-msg-${message.id}`}
        className={`group -mx-2 flex flex-col items-end rounded-lg px-2 transition-colors duration-500 ${spacing} ${flash}`}
      >
        <div className="max-w-[85%]">
          {reply && <ReplyQuote reply={reply} meId={meId} onJump={onJump} />}
          {isVoice ? (
            <VoiceMessage clip={message.voice!} mine />
          ) : (
            <div className="rounded-2xl rounded-ee-md bg-white/10 px-3.5 py-2">
              <MessageBody message={message} meId={meId} />
            </div>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5 pe-1">
          <HoverAction label={t('chat.reply')} onClick={() => onReply(message)}>
            <ReplyIcon size={12} />
          </HoverAction>
          <DeleteButton messageId={message.id} onDelete={onDelete} />
          <time dateTime={message.at} className="text-[10px] text-slate-500">
            {timeOf(message.at)}
          </time>
        </div>
      </li>
    );
  }

  return (
    <li
      id={`chat-msg-${message.id}`}
      className={`group -mx-2 flex gap-2.5 rounded-lg px-2 transition-colors duration-500 ${spacing} ${
        flash || (meId && reply?.user_id === meId ? 'bg-[#f9d028]/[0.05]' : '')
      }`}
    >
      {grouped && !reply ? (
        <span className="h-8 w-8 flex-shrink-0" aria-hidden="true" />
      ) : (
        <Avatar message={message} />
      )}

      <div className="min-w-0 flex-1">
        {(!grouped || reply) && (
          <div className="flex items-baseline gap-2">
            <span className="truncate text-[13px] font-semibold text-[#4a9eff]">
              {message.name}
            </span>
            <time dateTime={message.at} className="flex-shrink-0 text-[10px] text-slate-500">
              {timeOf(message.at)}
            </time>
          </div>
        )}

        {reply && (
          <div className="mt-1">
            <ReplyQuote reply={reply} meId={meId} onJump={onJump} />
          </div>
        )}

        {isVoice ? (
          <div className="mt-1 max-w-[85%]">
            <VoiceMessage clip={message.voice!} mine={false} />
          </div>
        ) : (
          <MessageBody message={message} meId={meId} />
        )}

        <ReactionBar message={message} onReact={onReact} onReply={onReply} onReport={onReport} />
      </div>
    </li>
  );
};

const Empty: FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-600">
      <ChatIcon size={22} />
    </span>
    <p className="text-xs text-slate-500">{message}</p>
  </div>
);

const ConnectionNote: FC<{ state: ConnectionState; label: string }> = ({ state, label }) => {
  if (state === 'connected') return null;

  return (
    <p className="border-t border-white/10 bg-white/5 px-4 py-1.5 text-center text-[10px] text-amber-400/90">
      {label}
    </p>
  );
};

interface PanelProps {
  onClose: () => void;
  room: ChatRoom;
  rooms: readonly ChatRoom[];
  onRoomChange: (room: ChatRoom) => void;
}

const ChatPanel: FC<PanelProps> = ({ onClose, room, rooms, onRoomChange }) => {
  const { t } = useTranslation();
  const { me } = useMe();
  const {
    messages,
    loading,
    error,
    connection,
    limits,
    sending,
    cooldownMs,
    send,
    react,
    sendVoice,
    remove,
    report,
  } = useGroupChat(room);

  const { chatAmbienceEnabled } = useSupportChat();
  const ambience = useChatAmbience(room, chatAmbienceEnabled);

  const combined = useMemo(() => {
    if (ambience.messages.length === 0) return messages;
    return [...messages, ...ambience.messages].sort((a, b) => {
      const delta = Date.parse(a.at) - Date.parse(b.at);
      return delta !== 0 ? delta : a.id.localeCompare(b.id);
    });
  }, [messages, ambience.messages]);

  const { isAmbient, react: reactAmbient } = ambience;

  const reactAny = useCallback(
    (messageId: string, reaction: ReactionKind): void => {
      if (isAmbient(messageId)) {
        reactAmbient(messageId, reaction);
        return;
      }
      void react(messageId, reaction);
    },
    [isAmbient, reactAmbient, react]
  );

  const reportAny = useCallback(
    async (messageId: string, reason: string): Promise<void> => {
      if (isAmbient(messageId)) return;
      await report(messageId, reason);
    },
    [isAmbient, report]
  );

  const quoteOf = (message: ChatMessage | null): ReplyRef | null =>
    message
      ? {
          id: message.id,
          user_id: message.user_id,
          name: message.name,
          body: message.kind === 'voice' ? '' : message.body.slice(0, 140),
          kind: message.kind ?? 'text',
        }
      : null;

  const recorder = useVoiceRecorder();

  const [draft, setDraft] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [mentionAt, setMentionAt] = useState<number | null>(null);
  const [mentionText, setMentionText] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [reportTarget, setReportTarget] = useState<ChatMessage | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pinned = useRef(true);

  useEffect(() => {
    setReplyingTo(null);
    setReportTarget(null);
  }, [room]);

  useEffect(() => {
    if (replyingTo && !combined.some((message) => message.id === replyingTo.id)) {
      setReplyingTo(null);
    }
  }, [combined, replyingTo]);

  useEffect(() => {
    if (!flashId) return undefined;
    const timer = setTimeout(() => setFlashId(null), FLASH_MS);
    return () => clearTimeout(timer);
  }, [flashId]);

  useEffect(() => {
    if (!info) return undefined;
    const timer = setTimeout(() => setInfo(null), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [info]);

  const startReply = useCallback((message: ChatMessage): void => {
    setReplyingTo(message);
    setEmojiOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const jumpTo = useCallback((messageId: string): void => {
    const row = document.getElementById(`chat-msg-${messageId}`);
    if (!row) return;
    row.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setFlashId(messageId);
  }, []);

  const closeReport = useCallback(() => setReportTarget(null), []);

  const onReported = useCallback(() => setInfo(t('chat.reportSent')), [t]);

  const trackPinned = (): void => {
    const list = listRef.current;
    if (!list) return;
    pinned.current = list.scrollHeight - list.scrollTop - list.clientHeight < 48;
  };

  useLayoutEffect(() => {
    if (pinned.current) endRef.current?.scrollIntoView({ block: 'end' });
  }, [combined]);

  const cooling = cooldownMs > 0;
  const tooLong = draft.trim().length > limits.max_length;
  const canSend = draft.trim().length > 0 && !tooLong && !sending && !cooling;
  const recording = recorder.state === 'recording';

  const participants = useMemo<MentionRef[]>(() => {
    const byId = new Map<string, MentionRef>();
    for (const message of combined) {
      if (message.user_id !== me?.id && !byId.has(message.user_id)) {
        byId.set(message.user_id, { user_id: message.user_id, name: message.name });
      }
    }
    return [...byId.values()];
  }, [combined, me?.id]);

  const suggestions = useMemo(
    () => (mentionAt === null ? [] : matchParticipants(participants, mentionText)),
    [mentionAt, mentionText, participants]
  );

  const rows = useMemo(
    () =>
      combined.map((message, i) => {
        const previous = combined[i - 1];
        return {
          message,
          grouped:
            previous !== undefined &&
            previous.user_id === message.user_id &&
            previous.kind !== 'voice' &&
            message.kind !== 'voice' &&
            Date.parse(message.at) - Date.parse(previous.at) < GROUPING_WINDOW_MS,
        };
      }),
    [combined]
  );

  const syncMention = (value: string, caret: number): void => {
    const query = readMentionQuery(value, caret);

    if (!query) {
      setMentionAt(null);
      setMentionText('');
      return;
    }

    setMentionAt(query.at);
    setMentionText(query.text);
    setMentionIndex(0);
  };

  const onDraftChange = (value: string, caret: number): void => {
    setDraft(value);
    syncMention(value, caret);
  };

  const applyMention = useCallback(
    (person: MentionRef): void => {
      if (mentionAt === null) return;

      const input = inputRef.current;
      const caret = input?.selectionStart ?? draft.length;
      const next = `${draft.slice(0, mentionAt)}@${person.name} ${draft.slice(caret)}`;

      setDraft(next);
      setMentionAt(null);
      setMentionText('');

      requestAnimationFrame(() => {
        input?.focus();
        const to = mentionAt + person.name.length + 2;
        input?.setSelectionRange(to, to);
      });
    },
    [draft, mentionAt]
  );

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Escape' && !event.defaultPrevented && replyingTo && mentionAt === null) {
      event.preventDefault();
      setReplyingTo(null);
      return;
    }

    if (mentionAt === null || suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setMentionIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setMentionIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      applyMention(suggestions[mentionIndex]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setMentionAt(null);
    }
  };

  const insertEmoji = (emoji: string): void => {
    const input = inputRef.current;

    if (!input) {
      setDraft((current) => current + emoji);
      return;
    }

    const start = input.selectionStart ?? draft.length;
    const end = input.selectionEnd ?? start;

    setDraft(draft.slice(0, start) + emoji + draft.slice(end));

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
    const quoted = replyingTo;
    setDraft('');
    setEmojiOpen(false);
    setMentionAt(null);
    setReplyingTo(null);

    const local = quoted && isAmbient(quoted.id);

    void send(body, local ? null : (quoted?.id ?? null), local ? quoteOf(quoted) : null).then(
      (accepted) => {
        if (accepted) return;
        setDraft((current) => (current.length === 0 ? body : current));
        if (quoted) setReplyingTo((current) => current ?? quoted);
      }
    );
  };

  const startRecording = (): void => {
    setNotice(null);
    setEmojiOpen(false);
    void recorder.start();
  };

  const finishRecording = (): void => {
    void recorder.stop().then((result) => {
      if (!result) {
        setNotice(t('chat.voiceTooShort'));
        return;
      }
      const quoted = replyingTo;
      const local = quoted && isAmbient(quoted.id);
      setReplyingTo(null);
      void sendVoice(
        result.clip,
        result.durationMs,
        local ? null : (quoted?.id ?? null),
        local ? quoteOf(quoted) : null
      );
    });
  };

  const remaining = limits.max_length - draft.trim().length;

  const micMessage =
    recorder.state === 'denied'
      ? t('chat.micDenied')
      : recorder.state === 'unsupported'
        ? t('chat.micUnsupported')
        : null;

  return (
    <>
      {/* A phone draws the design's back disc at the start, the room name
          beside it, and no rule under them. */}
      <header className="relative flex items-center gap-3 px-4 pb-2 pt-4 sm:gap-2 sm:border-b sm:border-white/10 sm:py-3">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('auth.back')}
          title={t('auth.back')}
          className="rl-glass-btn inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white sm:hidden"
        >
          <ChevronLeftIcon size={22} className="rtl:rotate-180" />
        </button>
        <ChatRoomPicker
          room={room}
          rooms={rooms}
          onChange={onRoomChange}
          label={t('chat.roomSwitch')}
        />

        {ambience.online !== null && (
          <span className="flex flex-shrink-0 items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="tabular-nums">
              {t('chat.online', { count: ambience.online.toLocaleString() })}
            </span>
          </span>
        )}

        <div className="ms-auto flex items-center gap-1">
          <button
            type="button"
            data-rules-toggle
            onClick={() => setRulesOpen((v) => !v)}
            aria-label={t('chat.rules')}
            title={t('chat.rules')}
            aria-expanded={rulesOpen}
            aria-haspopup="dialog"
            className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10 ${
              rulesOpen ? 'text-[#4a9eff]' : 'text-white/50 hover:text-white'
            }`}
          >
            <InfoIcon size={17} />
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('nav.closeMenu')}
            title={t('nav.closeMenu')}
            className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            <CloseIcon size={18} />
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <ChatRules open={rulesOpen} onClose={() => setRulesOpen(false)} />

        <ChatReportDialog
          message={reportTarget}
          onClose={closeReport}
          onSubmit={reportAny}
          onReported={onReported}
        />

        {loading && combined.length === 0 ? (
          <Empty message={t('chat.loading')} />
        ) : combined.length === 0 ? (
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
                  flashing={flashId === message.id}
                  meId={me?.id}
                  onReact={reactAny}
                  onDelete={remove}
                  onReply={startReply}
                  onReport={setReportTarget}
                  onJump={jumpTo}
                />
              ))}
            </ul>
            <div ref={endRef} />
          </div>
        )}
      </div>

      {(error || notice || micMessage) && (
        <p role="alert" className="px-4 pb-1 text-[10px] text-rose-400">
          {error ?? notice ?? micMessage}
        </p>
      )}

      {info && (
        <p role="status" className="px-4 pb-1 text-[10px] text-emerald-400">
          {info}
        </p>
      )}

      <ConnectionNote state={connection} label={t('chat.reconnecting')} />

      <form onSubmit={submit} className="relative border-t border-white/10 p-3">
        <EmojiPopover
          open={emojiOpen}
          onClose={() => setEmojiOpen(false)}
          onPick={insertEmoji}
          label={t('chat.emoji')}
        />

        {mentionAt !== null && (
          <MentionSuggest
            people={suggestions}
            active={mentionIndex}
            onPick={applyMention}
            onActive={setMentionIndex}
          />
        )}

        {replyingTo && (
          <div className="mb-2 flex items-center gap-2 rounded-lg border-s-2 border-[#4a9eff] bg-white/5 px-3 py-1.5">
            <ReplyIcon size={13} className="flex-shrink-0 text-[#4a9eff]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-[#4a9eff]">
                {t('chat.replyingTo', { name: replyingTo.name })}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                {replyingTo.kind === 'voice' ? t('chat.voiceMessage') : replyingTo.body}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              aria-label={t('chat.cancelReply')}
              title={t('chat.cancelReply')}
              className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
            >
              <CloseIcon size={13} />
            </button>
          </div>
        )}

        {recording ? (
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-rose-500/40 bg-white/5 px-4 py-2">
              <span className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-rose-500" />
              <span className="text-[13px] text-slate-300">{t('chat.recording')}</span>
              <span className="ms-auto tabular-nums text-[13px] text-slate-400">
                {clock(recorder.elapsedMs)}
              </span>
            </div>

            <button
              type="button"
              onClick={recorder.cancel}
              aria-label={t('chat.cancelRecording')}
              title={t('chat.cancelRecording')}
              className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-slate-400 transition-colors hover:bg-white/15 hover:text-white"
            >
              <TrashIcon size={17} />
            </button>

            <button
              type="button"
              onClick={finishRecording}
              aria-label={t('chat.stopSend')}
              title={t('chat.stopSend')}
              className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#4a9eff] text-white transition-colors hover:bg-[#3b8de8]"
            >
              <ArrowUpIcon size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="relative flex min-w-0 flex-1 items-center rounded-full border border-white/15 bg-white/5 ps-4 pe-1 transition-colors focus-within:border-blue-500/60">
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => onDraftChange(e.target.value, e.target.selectionStart ?? 0)}
                onKeyDown={onKeyDown}
                onBlur={() => setMentionAt(null)}
                maxLength={limits.max_length * 2}
                placeholder={cooling ? t('chat.slowMode') : t('chat.placeholder')}
                aria-label={t('chat.placeholder')}
                aria-invalid={tooLong}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none"
              />

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

            {draft.trim().length === 0 && recorder.supported ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={sending || cooling}
                aria-label={t('chat.record')}
                title={cooling ? t('chat.slowMode') : t('chat.record')}
                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/15 disabled:text-slate-500"
              >
                <MicIcon size={18} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSend}
                aria-label={t('chat.send')}
                title={cooling ? t('chat.slowMode') : t('chat.send')}
                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/15 disabled:text-slate-500 disabled:hover:bg-white/10"
              >
                <ArrowUpIcon size={18} />
              </button>
            )}
          </div>
        )}
      </form>
    </>
  );
};

export default ChatPanel;
