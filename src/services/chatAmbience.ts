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
  'itsmebrain',
  'Bravestone',
] as const;

const OPENERS = [
  'yo chat',
  'wsg chat',
  'heyy',
  'yooo',
  'sup ppl',
  'gm gm ☀️',
  'back lol',
  'hiii 👋',
  'evening fam',
  'whats poppin',
  'ayy im back',
  'hey hey',
  'yo yo',
  'oi chat',
  'hellooo',
  'wassup gang',
  'im hereee',
  'just woke up lol',
  'finally home 😮‍💨',
  'night shift crew where u at',
  'hi chat 🫶',
  'yo whats goin on',
  'ello ello',
  'ayo',
  'lunch break lets gooo',
];

const SHORT = [
  'lmaooo',
  'bruh',
  'lol',
  'haha',
  '😭😭',
  '💀',
  'fr',
  'ngl',
  'same tbh',
  'real',
  'facts',
  'W',
  'oof',
  'nahhh',
  'yesss',
  '👀',
  '🔥🔥',
  'sheeesh',
  'lmfao',
  'ikr',
  'mood',
  'ong',
  'yikes',
  'aight',
  'bet',
];

const CHATTER = [
  'plinko on high risk got me screaming 😭',
  'dice on auto is lowkey therapy',
  'yall tried the new slots yet?',
  'chat kinda chill today ngl',
  'who else up way too late 😴',
  'gates of olympus music stuck in my head fr',
  'mines is my comfort game',
  'new ui looks clean ngl',
  'anyone watchin the match tonight?',
  '3rd coffee and its not even noon ☕',
  'sweet bonanza vibes rn 🍭',
  'keeping it chill tonight, small bets only',
  'daily rewards here are nice tbh',
  'crash keeps teasing me lmao',
  'what yall playin rn?',
  'live blackjack is fun tonight',
  'chat is the best part of this site lol',
  'set my limits for the week, feels good',
  'take breaks yall 😅',
  'rainy day = slots day',
  'vibes are immaculate rn',
  'roulette hit red like 6 times in a row wtf',
  'i always forget to claim rakeback smh',
  'my dog just stole my sandwich 💀',
  'anyone else on mobile? its smooth af',
  'tried keno for the first time, its kinda cute',
  'whats a good low volatility slot?',
  'how do daily rewards work again?',
  'where do i check rakeback?',
  'is there a tourney this weekend?',
  'dealer on table 3 is hilarious lmao',
  'baccarat is so underrated',
  'my cat keeps walkin on my keyboard 🐈',
  'pizza just came brb 🍕',
  'this playlist is hittin tonight 🎧',
  'who else plays with sound off',
  'plinko balls bouncing is so satisfying',
  'mines w 3 bombs is the sweet spot',
  'site loads so fast now',
  'who watchin champions league',
  'what a goal omg ⚽',
  'cant wait for the weekend fr',
  'just got back from the gym, time to chill',
  'ordered sushi best decision today 🍣',
  'anyone here from canada? 🇨🇦',
  'uk gang where u at 🇬🇧',
  'anyone from aus up rn?',
  'lofi + dice = peak chill',
  'slot animations here are so smooth',
  'vip page looks sick',
  'dark theme supremacy',
  'took a week off, feels good to be back',
  'tea > coffee fight me',
  'my wifi is trash today',
  'dice is so simple but so fun',
  'hilo is lowkey addictive',
  'limbo animation goes hard',
  'trying the originals tonight',
  'this chat makes my night ngl',
  'love seeing new ppl in chat 👋',
  'anyone else just here for the vibes',
  'neighbour mowing the lawn at 9pm 💀',
  'storm outside, cozy inside ⛈️',
  'watchin a movie and chatting, multitasking king',
  'which slot got the best music?',
  'what yall think of the new games?',
  'anyone tried the live game shows?',
  'crazy time wheel is hypnotizing',
  'monopoly live host is so funny lol',
  'roulette is a classic for a reason',
  'got the blackjack chart on my wall lmao',
  'switching to dice for a bit',
  'back to plinko i cant help it',
  'small stakes good company tonight',
  'rewards calendar is a nice touch',
  'never played keno before this site',
  'wheel game is cute ngl',
  'tower game giving me anxiety 😂',
  'dinner or one more game 🤔',
  'my bro got me into this site',
  'first time trying live roulette, its fun',
  'lazy day energy',
  'need some fun after work today',
  'this is my wind down after work',
  'who else on their 3rd energy drink',
  'stretch break yall 🧘',
  'new avatars are cool',
  'custom avatars are a W',
  'is there a leaderboard somewhere?',
  'best original game? go',
  'most chill game here?',
  'any slot recs?',
  'how long yall been playin here?',
  'anyone else listen to music while playing?',
  'what time is it for yall?',
  'is chat extra busy today or is it just me',
  'football this weekend ⚽',
  'anyone watchin the bball game tonight? 🏀',
  'nba season is so good this year',
  'f1 this weekend 🏎️',
  'ufc tonight gonna be crazy',
  'cricket match going down to the wire',
  'coffee refill secured lets go',
  'grandma called had to pause lol',
  'snacks secured, ready for the night 🍿',
  'bro i keep misclicking',
  'so tired but cant sleep lol',
  'whos got a good netflix rec',
  'just ate way too much 😮‍💨',
  'its so cold here rn 🥶',
  'its so hot here rn 🥵',
  'brb charging my phone',
  'my roommate is so loud today',
  'chat movin fast today',
  'lowkey love this community',
  'need a nap fr',
  'ok one more spin then bed (lie)',
  'who else talks to their screen while playing lol',
  'gm to everyone except my alarm clock',
];

const REPLIES = [
  '@{name} lmaooo same',
  '@{name} fr fr',
  '@{name} what game?',
  '@{name} gl!!',
  '@{name} welcome 👋',
  '@{name} lol real',
  '@{name} thats the spirit',
  '@{name} 💯',
  '@{name} hahaha',
  '@{name} nooo way 😂',
  '@{name} big mood',
  '@{name} sounds good',
  '@{name} exactly',
  '@{name} lmao true',
  '@{name} 😭😭',
  '@{name} same here',
  '@{name} love that',
  '@{name} heyy 👋',
  '@{name} relatable af',
  '@{name} u said it',
  '@{name} ha nice',
  '@{name} for real',
  '@{name} ong',
  '@{name} 100%',
  '@{name} classic',
  '@{name} lol yes',
  '@{name} wb!',
  '@{name} have a good one',
  '@{name} nice one',
  '@{name} cheers 🍻',
];

const ANSWERS: Record<string, readonly string[]> = {
  'yall tried the new slots yet?': ['@{name} yea theyre fun', '@{name} not yet, any good?'],
  'anyone watchin the match tonight?': [
    '@{name} yesss gonna be a good one',
    '@{name} missed it whats the score',
  ],
  'what yall playin rn?': [
    '@{name} plinko',
    '@{name} mines as always',
    '@{name} just chillin on dice',
  ],
  'whats a good low volatility slot?': [
    '@{name} the fruit ones are pretty chill',
    '@{name} sweet bonanza is ok for that',
  ],
  'how do daily rewards work again?': ['@{name} check the rewards page its all there'],
  'where do i check rakeback?': ['@{name} its in the rewards section'],
  'is there a tourney this weekend?': ['@{name} check the tournaments page they post em there'],
  'anyone else on mobile? its smooth af': ['@{name} mobile all day 📱'],
  'who else up way too late 😴': ['@{name} me 😅', '@{name} always lol'],
  'tried keno for the first time, its kinda cute': ['@{name} keno is underrated fr'],
  'anyone here from canada? 🇨🇦': ['@{name} toronto here 👋', '@{name} vancouver checkin in'],
  'uk gang where u at 🇬🇧': ['@{name} manchester here 👋', '@{name} london innit'],
  'anyone from aus up rn?': ['@{name} sydney here cant sleep lol'],
  'which slot got the best music?': ['@{name} gates of olympus easy'],
  'what yall think of the new games?': ['@{name} pretty fun so far', '@{name} havent tried em yet'],
  'anyone tried the live game shows?': ['@{name} crazy time is my fav'],
  'is there a leaderboard somewhere?': ['@{name} check the tournaments page'],
  'best original game? go': [
    '@{name} plinko obv',
    '@{name} mines all day',
    '@{name} dice is the goat',
  ],
  'most chill game here?': ['@{name} dice on auto', '@{name} keno is super chill'],
  'any slot recs?': [
    '@{name} sugar rush is fun',
    '@{name} try gates of olympus',
    '@{name} big bass is a classic',
  ],
  'how long yall been playin here?': [
    '@{name} couple months now',
    '@{name} since launch basically',
  ],
  'anyone else listen to music while playing?': [
    '@{name} always, lofi gang',
    '@{name} rock playlist here 🎸',
  ],
  'what time is it for yall?': ['@{name} almost midnight here', '@{name} lunch time here'],
  'is chat extra busy today or is it just me': ['@{name} yea its poppin today'],
  'football this weekend ⚽': ['@{name} cant wait'],
  'anyone watchin the bball game tonight? 🏀': ['@{name} watchin it rn'],
  'dinner or one more game 🤔': ['@{name} dinner first lol', '@{name} food wins'],
};

export const VOICE_CLIPS: readonly string[] = [
  'female_voice_1.mp3',
  'female_voice_2.mp3',
  'female_voice_3.mp3',
  'female_voice_4.mp3',
  'female_voice_5.mp3',
  'female_voice_6.mp3',
  'female_voice_7.wav',
  'female_voice_8.mp3',
  'female_voice_9.mp3',
  'female_voice_10.mp3',
  'male_voice_1.mp3',
  'male_voice_2.mp3',
  'male_voice_3.mp3',
  'male_voice_4.mp3',
  'male_voice_5.mp3',
  'male_voice_6.mp3',
  'brb_food.mp3',
  'chill_vibes.mp3',
  'coffee.mp3',
  'dog_sandwich.mp3',
  'late_night.mp3',
  'plinko_laugh.mp3',
  'whats_everyone_playing.mp3',
  'yo_chat.mp3',
];

const VOICE_SPREAD = 3.33;

export const voiceClipUrl = (file: string): string => `/chat-voices/${encodeURIComponent(file)}`;

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
  const size = Math.max(pool.length, Math.round(pool.length * spread));
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

const voiceFor = (room: string, slot: number): string | null =>
  VOICE_CLIPS.length === 0 ? null : fromBag(VOICE_CLIPS, 'voice', room, slot, VOICE_SPREAD);

const voiceMessage = (
  room: string,
  line: SlotLine,
  file: string,
  durationMs: number
): ChatMessage => ({
  id: uuidFrom(line.seed),
  room,
  user_id: line.speaker.id,
  name: line.speaker.name,
  avatar_url: null,
  body: '',
  kind: 'voice',
  voice: { url: voiceClipUrl(file), duration_ms: durationMs },
  mentions: [],
  reply_to: null,
  at: new Date(line.at).toISOString(),
  reactions: reactionsFor(voiceOf(line)),
});

const compose = (room: string, slot: number, line: SlotLine): ChatMessage => {
  const rand = voiceOf(line);
  let decision = decide(room, slot, line, rand);

  const asking = decision.plain && ANSWERS[decision.body] !== undefined;
  const previous = previousLine(room, slot);
  if (
    !asking &&
    previous &&
    previous.line.speaker.id !== line.speaker.id &&
    !voiceFor(room, previous.slot)
  ) {
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

export const ambientMessages = (
  room: string,
  now: number,
  windowMs: number,
  voiceDurations: Readonly<Record<string, number>> = {}
): ChatMessage[] => {
  if (!AMBIENT_ROOMS.includes(room)) return [];

  const first = Math.floor((now - windowMs) / SLOT_MS);
  const last = Math.floor(now / SLOT_MS);
  const out: ChatMessage[] = [];

  for (let slot = first; slot <= last; slot += 1) {
    const line = slotLine(room, slot);
    if (!line || line.at > now || line.at < now - windowMs) continue;

    const clip = voiceFor(room, slot);
    if (clip) {
      const durationMs = voiceDurations[clip];
      if (durationMs) {
        out.push(
          remember(messageCache, `${room}:${slot}:voice`, () =>
            voiceMessage(room, line, clip, durationMs)
          )
        );
      }
      continue;
    }

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
