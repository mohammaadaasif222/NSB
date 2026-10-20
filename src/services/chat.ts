import apiService from './api';

/**
 * Group chat — the REST half.
 *
 * Reading a room is a socket subscription; posting to one is this. There is
 * no socket write, and that is not an omission: soketi runs with client
 * events disabled, so the browser cannot broadcast on a channel even after it
 * has joined. Every message goes through the API, which is what makes the
 * length cap, the send floor and the author name something other than a
 * suggestion.
 */

/** The two reactions a message can carry. */
export type ReactionKind = 'up' | 'down';

/** A message's reactions, as THIS viewer sees them. */
export interface ReactionSummary {
  up: number;
  down: number;
  /** What this account reacted, or null. Per-viewer, so it never rides the
   *  socket — only the counts do. */
  mine: ReactionKind | null;
}

export const NO_REACTIONS: ReactionSummary = { up: 0, down: 0, mine: null };

/** One line in a room. The same shape from history and from the socket. */
export type MessageKind = 'text' | 'voice';

export interface MentionRef {
  user_id: string;
  name: string;
}

export interface ReplyRef {
  id: string;
  user_id: string;
  name: string;
  body: string;
  kind: MessageKind;
}

export interface VoiceClip {
  url: string;
  duration_ms: number;
}

export interface ChatMessage {
  id: string;
  room: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  body: string;
  kind?: MessageKind;
  voice?: VoiceClip | null;
  mentions?: MentionRef[];
  reply_to?: ReplyRef | null;
  at: string;
  reactions?: ReactionSummary;
}

/** The counts a `chat.reaction` event carries. No `mine`: see ReactionSummary. */
export interface ReactionUpdate {
  message_id: string;
  up: number;
  down: number;
}

/** The room's posting rules, so the composer can apply them without a round trip. */
export interface ChatLimits {
  max_length: number;
  slow_mode_ms: number;
}

export interface ChatHistory {
  room: string;
  /** Oldest first. */
  messages: ChatMessage[];
  /** The channel to subscribe to for everything after this snapshot. */
  channel: string;
  limits: ChatLimits;
}

export const CHAT_ROOMS = ['en', 'ar', 'tr', 'hi', 'fr', 'ru', 'pt', 'es', 'it'] as const;

export type ChatRoom = (typeof CHAT_ROOMS)[number];

export const DEFAULT_CHAT_ROOM: ChatRoom = 'en';

export const isChatRoom = (value: string): value is ChatRoom =>
  (CHAT_ROOMS as readonly string[]).includes(value);

export const MAX_VOICE_MS = 60_000;

export const MIN_VOICE_MS = 700;

/**
 * The socket event a new message arrives on.
 *
 * A plain string on both sides, mirroring the API's REALTIME_EVENTS
 * (rolluck-backend/src/modules/realtime/utils/channels.ts) the same way the
 * admin console mirrors them. Named here rather than typed inline so there is
 * one place to grep when the pair has to change together.
 */
export const CHAT_MESSAGE_EVENT = 'chat.message';

/** The socket event a reaction count change arrives on. */
export const CHAT_REACTION_EVENT = 'chat.reaction';

export const CHAT_DELETE_EVENT = 'chat.delete';

export interface ChatDeletion {
  message_id: string;
}

/**
 * What the composer assumes before the first history call answers.
 *
 * Mirrors the API's own values (chat.limits.ts). Mirroring them means the
 * counter under the input is right from the first keystroke instead of
 * appearing a beat late — and the server still enforces the real ones, so a
 * drift here costs a wrong counter, never a lost message.
 */
export const CHAT_LIMITS_DEFAULT: ChatLimits = {
  max_length: 300,
  slow_mode_ms: 2000,
};

/** A room's recent messages, plus the channel to go live on. */
export const fetchChatHistory = async (
  room: ChatRoom = DEFAULT_CHAT_ROOM
): Promise<ChatHistory | null> => {
  const res = await apiService.get<ChatHistory>(`/chat/${room}/messages`);
  return res?.success && res.data ? res.data : null;
};

/**
 * Post a message. Resolves with the stored message.
 *
 * The same message also arrives over the socket a moment later, so a caller
 * that renders this one must de-duplicate on `id` — see useGroupChat, which
 * does exactly that and is why both paths can be left alone.
 */
export const sendChatMessage = async (
  body: string,
  room: ChatRoom = DEFAULT_CHAT_ROOM,
  replyTo: string | null = null
): Promise<ChatMessage | null> => {
  const res = await apiService.post<ChatMessage>(`/chat/${room}/messages`, {
    body,
    reply_to: replyTo,
  });
  return res?.success && res.data ? res.data : null;
};

/**
 * Set, swap or clear this account's reaction to somebody else's message.
 *
 * Send the reaction the player clicked, not the one they should end up with:
 * sending the one already held clears it. The toggle is decided on the server
 * so two open tabs cannot disagree about the current state, and the summary
 * that comes back is what to render.
 */
export const setChatReaction = async (
  messageId: string,
  reaction: ReactionKind | null,
  room: ChatRoom = DEFAULT_CHAT_ROOM
): Promise<ReactionSummary | null> => {
  const res = await apiService.post<ReactionSummary>(
    `/chat/${room}/messages/${messageId}/reactions`,
    { reaction }
  );
  return res?.success && res.data ? res.data : null;
};

export const sendVoiceMessage = async (
  clip: Blob,
  durationMs: number,
  room: ChatRoom = DEFAULT_CHAT_ROOM,
  replyTo: string | null = null
): Promise<ChatMessage | null> => {
  const form = new FormData();
  form.append('file', clip, 'voice.webm');
  form.append('duration_ms', String(Math.round(durationMs)));
  if (replyTo) form.append('reply_to', replyTo);

  const res = await apiService.post<ChatMessage>(`/chat/${room}/voice`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res?.success && res.data ? res.data : null;
};

export const deleteChatMessage = async (
  messageId: string,
  room: ChatRoom = DEFAULT_CHAT_ROOM
): Promise<boolean> => {
  const res = await apiService.delete<ChatDeletion>(`/chat/${room}/messages/${messageId}`);
  return Boolean(res?.success);
};

export const CHAT_REPORT_REASON_MAX = 200;

export const reportChatMessage = async (
  messageId: string,
  reason: string,
  room: ChatRoom = DEFAULT_CHAT_ROOM
): Promise<boolean> => {
  const res = await apiService.post<{ id: string }>(`/chat/${room}/messages/${messageId}/report`, {
    reason,
  });
  return Boolean(res?.success);
};
