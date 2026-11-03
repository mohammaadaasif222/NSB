/**
 * The field's name. Deliberately meaningless: browsers and password managers autofill fields named
 * like "website" or "url" even when hidden, which made the API drop real visitors' leads.
 */
const HONEYPOT_NAME = "nsb_trap";

/** A field people never see. Bots fill it in, and the API then drops the lead. */
export function Honeypot() {
  return (
    <input
      type="text"
      name={HONEYPOT_NAME}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden
      // Keeps password managers (1Password, LastPass, Bitwarden, Dashlane) from filling it.
      data-1p-ignore
      data-lpignore="true"
      data-bwignore="true"
      data-form-type="other"
      style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
    />
  );
}

/** The honeypot's value, sent to the API as `website`; undefined when left empty. */
export function honeypotValue(form: FormData): string | undefined {
  const value = form.get(HONEYPOT_NAME);
  return typeof value === "string" && value ? value : undefined;
}
