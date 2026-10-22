import type { ChatMessage, ReactionSummary } from './chat';

export const AMBIENT_ROOMS: readonly string[] = ['en'];

const SLOT_MS = 2_500;
const MESSAGE_CHANCE = 0.83;
const CAST_WINDOW_MS = 20 * 60_000;
const CAST_SIZE = 15;
const REPLY_LOOKBACK = 4;
const CACHE_LIMIT = 4_000;

const PERSONAS = [
  'KrakenRider',
  'LuckyMarcus',
  'VexxieRay',
  'SnowballSam',
  'DeltaRay',
  'JuneBug77',
  'MozzaKing',
  'NightOwlNico',
  'TomiKai',
  'GhostPepper',
  'BambiStar',
  'ZedSpins',
  'PixelPanda',
  'HollowEcho',
  'RezaMir',
  'CaptainCrumb',
  'MistyRiver',
  'OllieBear',
  'NovaQueen',
  'SantiG',
  'FrostByte',
  'LilaMoon',
  'DrummerJoe',
  'KaitoBlaze',
  'BrickFoot',
  'YukiTan',
  'MrPickles',
  'SableFox',
  'IvyRose',
  'ChonkyCat',
  'ThaneStorm',
  'Mavrick',
  'PeachFuzz',
  'DexterVane',
  'RubyRush',
  'AceHarlow',
  'CobaltCrow',
  'MiloWave',
  'JadeViper',
  'RioBlaze',
  'LunaVex',
  'TitanTaco',
  'OscarLynx',
  'ZaraNight',
  'BlueMamba',
  'WolfieGrey',
  'SunnyKai',
  'NeonFalcon',
  'HazelHunt',
  'EmberJay',
] as const;

const OPENERS = [
  'gm chat',
  'evening all 👋',
  'yo whats good',
  'hey everyone',
  'back again lol',
  'morning ☕',
  'sup chat',
  'just got home, what did i miss',
  'hi all, first time in chat 😄',
  'hello hello',
  'wassup people',
  'hey hey 👋',
  'good evening chat',
  'afternoon all',
  'im back 😎',
  'whats up everyone',
  'howdy chat 🤠',
  'greetings from the couch',
  'lunch break check in',
  'yo yo yo',
  'hi chat, hope everyone is good',
  'finally off work',
  'quick hello before dinner',
  'gm gm',
  'late night crew where you at',
];

const SHORT = [
  '🔥',
  '😂😂',
  'lol',
  'haha',
  '👀',
  'gg',
  'nice',
  'same',
  '💯',
  'true',
  'lmao',
  'real',
  'ok ok',
  '😅',
  '🙌',
  'fr',
  'yep',
  'ikr',
  'wow',
  'nah',
  '😎',
  'damn',
  'sheesh',
  '🤣',
  'hahaha',
];

const CHATTER = [
  'plinko on high risk is a rollercoaster 😂',
  'dice on auto is weirdly relaxing',
  'anyone tried the new slots in the lobby?',
  'this chat is so chill today',
  'who else is up way too late',
  'gates of olympus music lives in my head rent free',
  'mines is my comfort game ngl',
  'the new UI is clean',
  'anyone watching the match tonight?',
  'coffee number 3 ☕☕☕',
  'sweet bonanza vibes today 🍭',
  'taking it slow tonight, low stakes only',
  'love the daily rewards here',
  'crash keeps teasing me lol',
  'whats everyone playing rn?',
  'live blackjack tables are fun tonight',
  'chat is the best part of this site tbh',
  'just set my limits for the week, feels good',
  'remember to take breaks people 😅',
  'rainy day here, perfect for some slots',
  'good vibes in here today 🔥',
  'roulette red streak is wild',
  'i always forget to claim my rakeback',
  'lol the dog just stole my sandwich',
  'anyone else play from mobile? app feels smooth',
  'tried keno for the first time, its cute',
  'whats a good slot with low volatility?',
  'how do the daily rewards work again?',
  'where do i check my rakeback?',
  'is there a tournament this weekend?',
  'the dealer on table 3 is hilarious',
  'baccarat is so underrated',
  'my cat keeps walking on the keyboard 🐈',
  'pizza just arrived, brb 🍕',
  'this playlist is hitting tonight 🎧',
  'who else plays with the sound off',
  'plinko balls bouncing is so satisfying',
  'mines with 3 bombs is my sweet spot',
  'love how fast the site loads now',
  'whos watching the champions league',
  'what a goal that was ⚽',
  'cant believe its already the weekend soon',
  'just finished the gym, time to relax',
  'ordered sushi, best decision today 🍣',
  'anyone here from canada? 🇨🇦',
  'greetings from the uk 🇬🇧',
  'anyone from australia up this late?',
  'chilling with some lofi and dice',
  'the slot animations here are so smooth',
  'vip page looks nice',
  'who else loves the dark theme',
  'took a break for a week, feels good to be back',
  'tea > coffee, fight me ☕',
  'my wifi is being so slow today',
  'dice game is so simple but so fun',
  'hilo is lowkey addictive',
  'the limbo animation is clean',
  'trying out the originals tonight',
  'ngl this chat makes the night better',
  'love seeing new faces in chat 👋',
  'anyone else just here for the vibes',
  'my neighbour is mowing the lawn at 9pm 💀',
  'storm outside, cozy inside ⛈️',
  'watching a movie and chatting, multitasking king',
  'which slot has the best soundtrack?',
  'what do you guys think of the new games?',
  'anyone tried the live game shows?',
  'crazy time wheel is mesmerizing',
  'the monopoly live host is so funny',
  'roulette is a classic for a reason',
  'blackjack basic strategy chart on my wall lol',
  'switching to dice for a bit',
  'back to plinko, i cant help it',
  'low stakes and good company tonight',
  'the rewards calendar is a nice touch',
  'never played keno before this site',
  'wheel game is cute',
  'tower game is giving me anxiety 😂',
  'anyone else think the coins look nice in the wallet',
  'switched to the mobile site, its smooth',
  'should i get dinner or one more game 🤔',
  'my brother got me into this site',
  'first time trying live roulette, its fun',
  'the chat rules are fair, nice to see',
  'quiet sunday energy',
  'monday blues, need some fun',
  'this is my wind down after work',
  'who else is drinking way too much energy drink',
  'stretch break everyone 🧘',
  'the new avatars are cool',
  'love the custom avatar option',
  'notifications here are actually useful',
  'is there a leaderboard somewhere?',
  'whats the best original game in your opinion?',
  'whats the most chill game here?',
  'any slot recommendations?',
  'how long have you guys been playing here?',
  'anyone else listening to music while playing?',
  'what time is it for everyone?',
  'is it just me or is chat extra active today',
  'football weekend coming up ⚽',
  'basketball tonight anyone? 🏀',
  'nba season is so good this year',
  'f1 race this weekend 🏎️',
  'ufc fight tonight should be crazy',
  'cricket match is going down to the wire',
  'just got my coffee refill, lets go',
  'grandma called, had to pause lol',
  'snacks secured, ready for the night 🍿',
];

const REPLIES = [
  '@{name} haha same',
  '@{name} facts',
  '@{name} what game?',
  '@{name} gl!',
  '@{name} welcome 👋',
  '@{name} lol fr',
  '@{name} thats the spirit',
  '@{name} agreed 💯',
  '@{name} hahaha',
  '@{name} no way 😂',
  '@{name} big mood',
  '@{name} sounds good to me',
  '@{name} exactly',
  '@{name} lmao true',
  '@{name} 😂😂',
  '@{name} same here',
  '@{name} love that',
  '@{name} hey 👋',
  '@{name} relatable',
  '@{name} you said it',
  '@{name} ha nice',
  '@{name} for real',
  '@{name} totally',
  '@{name} 100%',
  '@{name} classic',
  '@{name} lol yes',
  '@{name} hey welcome back',
  '@{name} hope you have a good one',
  '@{name} nice one',
  '@{name} cheers 🍻',
];

const ANSWERS: Record<string, readonly string[]> = {
  'anyone tried the new slots in the lobby?': [
    '@{name} yeah the new ones are fun',
    '@{name} not yet, any good?',
  ],
  'anyone watching the match tonight?': [
    '@{name} yes! should be a good one',
    '@{name} missed it, whats the score?',
  ],
  'whats everyone playing rn?': [
    '@{name} plinko',
    '@{name} mines as always',
    '@{name} just chilling on dice',
  ],
  'whats a good slot with low volatility?': [
    '@{name} the fruit themed ones are pretty chill',
    '@{name} sweet bonanza is ok for that',
  ],
  'how do the daily rewards work again?': ['@{name} check the rewards page, its all there'],
  'where do i check my rakeback?': ['@{name} its in the rewards section'],
  'is there a tournament this weekend?': [
    '@{name} check the tournaments page, they post them there',
  ],
  'anyone else play from mobile? app feels smooth': ['@{name} mobile all day 📱'],
  'who else is up way too late': ['@{name} me 😅', '@{name} always lol'],
  'tried keno for the first time, its cute': ['@{name} keno is underrated'],
  'anyone here from canada? 🇨🇦': ['@{name} toronto here 👋', '@{name} vancouver checking in'],
  'anyone from australia up this late?': ['@{name} sydney here, cant sleep lol'],
  'which slot has the best soundtrack?': ['@{name} gates of olympus easily'],
  'what do you guys think of the new games?': [
    '@{name} pretty fun so far',
    '@{name} havent tried them yet',
  ],
  'anyone tried the live game shows?': ['@{name} crazy time is my fav'],
  'is there a leaderboard somewhere?': ['@{name} check the tournaments page'],
  'whats the best original game in your opinion?': [
    '@{name} plinko for sure',
    '@{name} mines all day',
    '@{name} dice is the goat',
  ],
  'whats the most chill game here?': ['@{name} dice on auto', '@{name} keno is super chill'],
  'any slot recommendations?': [
    '@{name} sugar rush is fun',
    '@{name} try gates of olympus',
    '@{name} big bass is a classic',
  ],
  'how long have you guys been playing here?': [
    '@{name} couple months now',
    '@{name} since launch basically',
  ],
  'anyone else listening to music while playing?': [
    '@{name} always, lofi gang',
    '@{name} rock playlist here 🎸',
  ],
  'what time is it for everyone?': ['@{name} almost midnight here', '@{name} lunch time here'],
  'is it just me or is chat extra active today': ['@{name} yeah its busy today'],
  'football weekend coming up ⚽': ['@{name} cant wait'],
  'basketball tonight anyone? 🏀': ['@{name} watching it now'],
  'should i get dinner or one more game 🤔': ['@{name} dinner first lol', '@{name} food wins'],
};

export interface AmbientCast {
  id: string;
  name: string;
}

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const prng = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = <T>(rand: () => number, items: readonly T[]): T =>
  items[Math.floor(rand() * items.length)];

const hex = (rand: () => number, length: number): string => {
  let out = '';
  for (let i = 0; i < length; i += 1) out += Math.floor(rand() * 16).toString(16);
  return out;
};

const uuidFrom = (seed: number): string => {
  const rand = prng(seed);
  return `${hex(rand, 8)}-${hex(rand, 4)}-4${hex(rand, 3)}-${pick(rand, ['8', '9', 'a', 'b'])}${hex(rand, 3)}-${hex(rand, 12)}`;
};

const remember = <K, V>(cache: Map<K, V>, key: K, make: () => V): V => {
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const value = make();
  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(key, value);
  return value;
};

const shuffled = (length: number, seed: number): number[] => {
  const rand = prng(seed);
  const order = Array.from({ length }, (_, index) => index);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

const bagCache = new Map<string, number[]>();

const rawBag = (size: number, label: string, room: string, cycle: number): number[] =>
  shuffled(size, hashString(`bag:${label}:${room}:${cycle}`));

const bagOrder = (
  size: number,
  items: number,
  label: string,
  room: string,
  cycle: number
): number[] =>
  remember(bagCache, `${label}:${room}:${size}:${cycle}`, () => {
    const order = rawBag(size, label, room, cycle);
    const guard = Math.floor(size / 3);
    const tail = new Set(
      rawBag(size, label, room, cycle - 1)
        .slice(size - guard)
        .filter((value) => value < items)
    );

    for (let i = 0; i < guard; i += 1) {
      if (!tail.has(order[i])) continue;
      for (let j = guard; j < size - guard; j += 1) {
        if (!tail.has(order[j])) {
          [order[i], order[j]] = [order[j], order[i]];
          break;
        }
      }
    }

    return order;
  });

const fromBag = (
  pool: readonly string[],
  label: string,
  room: string,
  slot: number,
  spread = 1
): string | null => {
  const size = pool.length * spread;
  const cycle = Math.floor(slot / size);
  const order = bagOrder(size, pool.length, label, room, cycle);
  const value = order[((slot % size) + size) % size];
  return value < pool.length ? pool[value] : null;
};

const personaId = (index: number): string => uuidFrom(hashString(`persona:${PERSONAS[index]}`));

const castCache = new Map<string, AmbientCast[]>();

const castFor = (room: string, at: number): AmbientCast[] => {
  const early = Math.floor(at / CAST_WINDOW_MS);
  const late = Math.floor((at + CAST_WINDOW_MS / 2) / CAST_WINDOW_MS);

  return remember(castCache, `${room}:${early}:${late}`, () => {
    const first = shuffled(PERSONAS.length, hashString(`cast:a:${room}:${early}`));
    const second = shuffled(PERSONAS.length, hashString(`cast:b:${room}:${late}`));
    const chosen: number[] = [];

    for (const index of first) {
      if (chosen.length >= Math.ceil(CAST_SIZE / 2)) break;
      chosen.push(index);
    }
    for (const index of second) {
      if (chosen.length >= CAST_SIZE) break;
      if (!chosen.includes(index)) chosen.push(index);
    }

    return chosen.map((index) => ({ id: personaId(index), name: PERSONAS[index] }));
  });
};

interface SlotLine {
  speaker: AmbientCast;
  at: number;
  seed: number;
}

const slotCache = new Map<string, SlotLine | null>();

const slotLine = (room: string, slot: number): SlotLine | null =>
  remember(slotCache, `${room}:${slot}`, () => {
    const seed = hashString(`slot:${room}:${slot}`);
    const rand = prng(seed);
    if (rand() > MESSAGE_CHANCE) return null;

    const start = slot * SLOT_MS;
    const cast = castFor(room, start);

    return {
      speaker: pick(rand, cast),
      at: start + Math.floor(rand() * SLOT_MS),
      seed,
    };
  });

const reactionsFor = (rand: () => number): ReactionSummary => {
  if (rand() > 0.18) return { up: 0, down: 0, mine: null };
  return { up: 1 + Math.floor(rand() * 3), down: 0, mine: null };
};

interface Decision {
  body: string;
  target: AmbientCast | null;
  plain: boolean;
}

const previousLine = (room: string, slot: number): { slot: number; line: SlotLine } | null => {
  for (let back = 1; back <= REPLY_LOOKBACK; back += 1) {
    const line = slotLine(room, slot - back);
    if (line) return { slot: slot - back, line };
  }
  return null;
};

const voiceOf = (line: SlotLine): (() => number) => prng(line.seed ^ 0x9e3779b9);

const decide = (room: string, slot: number, line: SlotLine, rand: () => number): Decision => {
  const roll = rand();
  const previous = previousLine(room, slot);
  const target =
    previous && previous.line.speaker.id !== line.speaker.id ? previous.line.speaker : null;

  if (target && roll < 0.28) {
    const reply = fromBag(REPLIES, 'reply', room, slot) ?? REPLIES[0];
    return { body: reply.replace('{name}', target.name), target, plain: false };
  }

  const chatter = (): Decision => ({
    body: fromBag(CHATTER, 'chatter', room, slot) ?? CHATTER[0],
    target: null,
    plain: true,
  });

  if (roll < 0.4) {
    return { body: fromBag(SHORT, 'short', room, slot) ?? SHORT[0], target: null, plain: true };
  }
  if (roll < 0.58) {
    const opener = fromBag(OPENERS, 'open', room, slot, 3);
    return opener ? { body: opener, target: null, plain: true } : chatter();
  }
  return chatter();
};

const compose = (room: string, slot: number, line: SlotLine): ChatMessage => {
  const rand = voiceOf(line);
  let decision = decide(room, slot, line, rand);

  const asking = decision.plain && ANSWERS[decision.body] !== undefined;
  const previous = previousLine(room, slot);
  if (!asking && previous && previous.line.speaker.id !== line.speaker.id) {
    const asked = decide(room, previous.slot, previous.line, voiceOf(previous.line));
    const answers = asked.plain ? ANSWERS[asked.body] : undefined;

    if (answers && rand() < 0.75) {
      const target = previous.line.speaker;
      decision = {
        body: pick(rand, answers).replace('{name}', target.name),
        target,
        plain: false,
      };
    } else if (answers && decision.target) {
      decision = {
        body: fromBag(CHATTER, 'chatter', room, slot) ?? CHATTER[0],
        target: null,
        plain: true,
      };
    }
  }

  return {
    id: uuidFrom(line.seed),
    room,
    user_id: line.speaker.id,
    name: line.speaker.name,
    avatar_url: null,
    body: decision.body,
    kind: 'text',
    voice: null,
    mentions: decision.target ? [{ user_id: decision.target.id, name: decision.target.name }] : [],
    reply_to: null,
    at: new Date(line.at).toISOString(),
    reactions: reactionsFor(rand),
  };
};

const messageCache = new Map<string, ChatMessage>();

export const ambientMessages = (room: string, now: number, windowMs: number): ChatMessage[] => {
  if (!AMBIENT_ROOMS.includes(room)) return [];

  const first = Math.floor((now - windowMs) / SLOT_MS);
  const last = Math.floor(now / SLOT_MS);
  const out: ChatMessage[] = [];

  for (let slot = first; slot <= last; slot += 1) {
    const line = slotLine(room, slot);
    if (!line || line.at > now || line.at < now - windowMs) continue;
    out.push(remember(messageCache, `${room}:${slot}`, () => compose(room, slot, line)));
  }

  return out;
};

const ROOM_SCALE: Record<string, number> = {
  en: 1,
  es: 0.28,
  pt: 0.24,
  tr: 0.2,
  ru: 0.18,
  hi: 0.16,
  fr: 0.14,
  it: 0.12,
  ar: 0.12,
};

export const onlineCount = (room: string, now: number): number => {
  const minutes = now / 60_000;
  const hourOfDay = new Date(now).getUTCHours() + new Date(now).getUTCMinutes() / 60;
  const daily = Math.sin(((hourOfDay - 8) / 24) * Math.PI * 2);
  const drift = Math.sin(minutes / 7) * 9 + Math.sin(minutes / 2.3) * 4;
  const jitter = prng(hashString(`online:${room}:${Math.floor(now / 30_000)}`))() * 6;
  const base = 262 + daily * 38 + drift + jitter;

  return Math.max(3, Math.round(base * (ROOM_SCALE[room] ?? 0.1)));
};
