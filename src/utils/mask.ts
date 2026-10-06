/**
 * Hide most of an identifier before echoing it back on screen, e.g. on the
 * OTP step — enough for the player to recognise it, not enough to read off.
 */

/** "9876545984" → "XXXXXX5984". */
export const maskMobile = (digits: string, visible = 4): string =>
  digits.length <= visible
    ? digits
    : `${'X'.repeat(digits.length - visible)}${digits.slice(-visible)}`;

/** "samantha@gmail.com" → "sam****@gmail.com". */
export const maskEmail = (email: string, visible = 3): string => {
  const at = email.indexOf('@');
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const shown = local.slice(0, Math.min(visible, local.length - 1));
  return `${shown}****${email.slice(at)}`;
};
