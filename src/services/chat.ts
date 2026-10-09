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

/** One line in a room. The same shape from history and from the socket. */
export interface ChatMessage {
  id: string;
  room: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  body: string;
  /** ISO 8601, set by the server. */
  at: string;
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

/** The room the header panel opens. */
export const DEFAULT_CHAT_ROOM = 'global';

/**
 * The socket event a new message arrives on.
 *
 * A plain string on both sides, mirroring the API's REALTIME_EVENTS
 * (rolluck-backend/src/modules/realtime/utils/channels.ts) the same way the
 * admin console mirrors them. Named here rather than typed inline so there is
 * one place to grep when the pair has to change together.
 */
export const CHAT_MESSAGE_EVENT = 'chat.message';

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
export const fetchChatHistory = async (room = DEFAULT_CHAT_ROOM): Promise<ChatHistory | null> => {
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
  room = DEFAULT_CHAT_ROOM
): Promise<ChatMessage | null> => {
  const res = await apiService.post<ChatMessage>(`/chat/${room}/messages`, { body });
  return res?.success && res.data ? res.data : null;
};
