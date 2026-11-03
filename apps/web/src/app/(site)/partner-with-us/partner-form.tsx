"use client";

import { type FormEvent, useState } from "react";

const WHATSAPP = "https://wa.me/919811590088";

/** As in the design, this starts a WhatsApp chat with the NSB team; nothing is saved on the site. */
export function PartnerForm() {
  const [note, setNote] = useState({ text: "We respect your privacy.", error: false });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const mobile = String(form.get("mobile")).replace(/\D/g, "");
    const email = String(form.get("email")).trim();
    if (mobile.length !== 10 || !/^\S+@\S+\.\S+$/.test(email)) {
      setNote({ text: "Please enter a valid 10-digit mobile number and email.", error: true });
      return;
    }
    setNote({ text: "Opening WhatsApp...", error: false });
    const text = `Hi NSB, I want to promote my business.\nMobile: +91 ${mobile}\nEmail: ${email}`;
    window.open(`${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  return (
    <form className="pw-form" onSubmit={onSubmit} noValidate>
      <h2>Get started</h2>
      <p>Share your details. Our team will call you.</p>
      <label htmlFor="pw-mobile">Mobile number</label>
      <div className="pw-mob">
        <span>+91</span>
        <input id="pw-mobile" name="mobile" type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit number" autoComplete="tel-national" />
      </div>
      <label htmlFor="pw-email">Email address</label>
      <input id="pw-email" name="email" type="email" placeholder="you@business.com" autoComplete="email" />
      <button type="submit">Get Started</button>
      <p className={`pw-note ${note.error ? "is-error" : ""}`} role="status">
        {note.text}
      </p>
    </form>
  );
}
