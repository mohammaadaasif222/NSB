/**
 * App shell, auth plumbing, services and utilities: toasts, fallback error
 * messages and the odd label that lives outside any one page.
 */
export const en = {
  // App shell
  'misc.meta.description': 'ROLLUCK: originals, new releases, featured games and slots.',

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
