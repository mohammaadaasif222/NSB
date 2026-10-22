/**
 * App shell, auth plumbing, services and utilities: toasts, fallback error
 * messages and the odd label that lives outside any one page.
 */
export const en = {
  // App shell
  'misc.meta.description':
    'ROLLUCK is a crypto casino with originals, slots, live casino, table games and new releases. 18+. Play responsibly.',
  'misc.meta.homeTitle': 'ROLLUCK — Crypto Casino: Originals, Slots & Live Casino',
  'misc.meta.liveCasino':
    'Live blackjack, roulette, baccarat and game shows with real dealers at ROLLUCK.',
  'misc.meta.casino':
    'Browse the ROLLUCK casino: originals, slots, live dealer tables, table games and bonus buys, all playable with crypto.',
  'misc.meta.category':
    'Browse every {category} game at ROLLUCK, the crypto casino, and open any title to see its details.',
  'misc.meta.game':
    'Play {title} by {provider} at ROLLUCK, the crypto casino. See the game details and discover similar titles.',
  'misc.meta.gameRtp':
    'Play {title} by {provider} at ROLLUCK, the crypto casino. RTP {rtp}%. See the game details and discover similar titles.',
  'misc.meta.promotions':
    'Current ROLLUCK promotions for casino and sports players. Check each offer and its terms before you take part.',
  'misc.meta.bonuses':
    'ROLLUCK bonuses: the welcome pack and regular bonuses, with the terms and wagering for each.',
  'misc.meta.rewards':
    'ROLLUCK rewards and VIP levels: rakeback, cashback and the perks unlocked at every tier.',
  'misc.meta.providers':
    'Every game provider at ROLLUCK, the crypto casino. Pick a studio to browse all of its slots and live games.',
  'misc.meta.provider':
    'Play {provider} games at ROLLUCK, the crypto casino: {count} titles to browse, each with its details and RTP.',

  // Auth fields and helpers
  'misc.otp.digit': 'Digit {n}',
  'misc.help.loginSubject': 'Login help',
  'misc.help.otpSubject': 'Verification code',
  'misc.field.optional': '(Optional)',
  'misc.field.showPassword': 'Show password',
  'misc.field.hidePassword': 'Hide password',

  // Auth outcomes
  'misc.auth.loggedOut': 'Logged out successfully',
  'misc.auth.sessionExpired': 'Your session has expired. Please sign in again.',
  'misc.auth.malformedToken': 'Received an invalid sign-in token. Please try again.',
  'misc.steam.completing': 'Completing Steam sign-in…',
  'misc.unauthorized.title': 'Unauthorized',
  'misc.unauthorized.body': 'You do not have permission to access this page.',
  'misc.reset.allRequired': 'All fields are required',
  'misc.reset.minLength': 'Password must be at least {min} characters',

  // Fraud step-up prompt
  'misc.seon.confirmDefault': 'Please confirm this with the code we just sent you.',
  'misc.seon.codeReissued': 'That code was not accepted. We have sent a new one.',
  'misc.seon.codeInvalid': 'That code is not right, or it has expired.',

  // API fallbacks when the server sends no message of its own
  'misc.api.serverError': 'The server is having trouble right now. Please try again shortly.',
  'misc.api.rejected': 'The server rejected the request but gave no reason.',

  // KYC fallbacks
  'misc.kyc.submitFailed': 'Could not submit your personal details. Please try again.',
  'misc.kyc.tokenFailed': 'Could not start verification. Please try again.',
  'misc.kyc.levelFailed': 'Could not start this verification level',

  // Buy crypto fallbacks
  'misc.buyCrypto.cryptosFailed': 'Could not load the available cryptocurrencies',
  'misc.buyCrypto.offersFailed': 'Could not load offers',
  'misc.buyCrypto.orderFailed': 'Could not create the order',

  // Countdown: the days part of "2d 04:05:06"
  'misc.countdown.days': '{days}d',

  // Real-time connection test toasts
  'misc.realtime.okTitle': 'Real-time connection working!',
  'misc.realtime.random': 'Random: {value}',
  'misc.realtime.issueTitle': 'Real-time connection issue',
  'misc.realtime.issueBody': "The test message didn't arrive within 5 seconds",
  'misc.realtime.issueHint': 'Soketi may not be delivering events properly',
} as const;
