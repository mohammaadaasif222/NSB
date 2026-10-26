"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  type AdminSettings,
  DEFAULT_FOOTER,
  FOOTER_MAX_LINKS,
  FOOTER_SOCIAL_LABELS,
  FOOTER_SOCIALS,
  type FooterLink,
  type FooterSettings,
} from "@nsb/shared";
import { Button, Field, IconButton, TextArea, TextInput, Toggle } from "@/components/admin/form";
import { ImageUpload, useSessionUploads } from "@/components/admin/image-upload";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";

type LinkList = "quickLinks" | "bottomLinks";

/** Pages a footer link often points to; any site path, https://, mailto: or tel: link works. */
const ROUTES = ["/", "/wedding", "/real-estate", "mailto:", "tel:+91"];

/** Show/hide switch for one footer item; a hidden item stays here, dimmed, and is left off the site. */
function ShowSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-zinc-600">
      <Toggle label={`Show ${label}`} checked={checked} onChange={onChange} />
      <span aria-hidden className="w-9">
        {checked ? "Shown" : "Hidden"}
      </span>
    </span>
  );
}

/** One footer item with its switch, dimmed while hidden. */
function Item({ label, shown, onShow, children }: { label: string; shown: boolean; onShow: (shown: boolean) => void; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <b className="text-[13px]">{label}</b>
        <ShowSwitch label={label.toLowerCase()} checked={shown} onChange={onShow} />
      </div>
      <div className={shown ? undefined : "opacity-50"}>{children}</div>
    </div>
  );
}

/** An ordered list of footer links: text, where it goes, and show/hide, with move, remove and add. */
function LinksEditor({
  list,
  links,
  errors,
  onChange,
}: {
  list: LinkList;
  links: FooterLink[];
  errors: Record<string, string>;
  onChange: (links: FooterLink[]) => void;
}) {
  const set = (i: number, patch: Partial<FooterLink>) => onChange(links.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const move = (i: number, to: number) => {
    const next = [...links];
    [next[i], next[to]] = [next[to]!, next[i]!];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-2">
      {links.length === 0 && <p className="text-sm text-zinc-500">No links. This part of the footer is hidden.</p>}
      {links.length > 0 && links.every((l) => !l.visible) && <p className="text-sm text-zinc-500">Every link is hidden, so this part of the footer is too.</p>}
      {links.map((l, i) => (
        <div key={i} className="flex flex-wrap items-start gap-2">
          <div className={`flex min-w-0 flex-[2.4] flex-wrap gap-2 ${l.visible ? "" : "opacity-50"}`}>
            <Field label="Text" hideLabel error={errors[`${list}.${i}.label`]} className="min-w-36 flex-1">
              <TextInput
                value={l.label}
                maxLength={40}
                placeholder="e.g. About us"
                aria-label={`Link ${i + 1} text`}
                invalid={!!errors[`${list}.${i}.label`]}
                onChange={(e) => set(i, { label: e.target.value })}
              />
            </Field>
            <Field label="Link" hideLabel error={errors[`${list}.${i}.link`]} className="min-w-48 flex-[1.4]">
              <TextInput
                value={l.link}
                list="footer-routes"
                maxLength={300}
                placeholder="/about or https://… (blank: no link yet)"
                aria-label={`Link ${i + 1} address`}
                invalid={!!errors[`${list}.${i}.link`]}
                onChange={(e) => set(i, { link: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex items-center gap-1 pt-1.5">
            <ShowSwitch label={l.label || `link ${i + 1}`} checked={l.visible} onChange={(visible) => set(i, { visible })} />
            <IconButton label={`Move link ${i + 1} up`} disabled={i === 0} onClick={() => move(i, i - 1)}>
              <ArrowUp className="size-4" aria-hidden />
            </IconButton>
            <IconButton label={`Move link ${i + 1} down`} disabled={i === links.length - 1} onClick={() => move(i, i + 1)}>
              <ArrowDown className="size-4" aria-hidden />
            </IconButton>
            <IconButton label={`Remove link ${i + 1}`} onClick={() => onChange(links.filter((_, j) => j !== i))}>
              <Trash2 className="size-4" aria-hidden />
            </IconButton>
          </div>
        </div>
      ))}
      {errors[list] && <span className="text-xs text-red-600">{errors[list]}</span>}
      {links.length < FOOTER_MAX_LINKS && (
        <Button variant="secondary" className="self-start" onClick={() => onChange([...links, { label: "", link: "", visible: true }])}>
          <Plus className="size-4" aria-hidden /> Add link
        </Button>
      )}
    </div>
  );
}

/**
 * Home page › Footer: the logo, the short text and phone number, the trust badge, the Quick links
 * list, the links after the copyright line, and the social media pages, each with a show/hide
 * switch. The footer shows on every page.
 */
export function FooterManager({ footer: saved, maxUploadBytes }: { footer: FooterSettings; maxUploadBytes: number }) {
  const { run, pending } = useAdminAction();
  const trackUpload = useSessionUploads();
  const [footer, setFooter] = useState<FooterSettings>(saved);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const changed = JSON.stringify(footer) !== JSON.stringify(saved);
  const set = (patch: Partial<FooterSettings>) => setFooter((f) => ({ ...f, ...patch }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await run(() => adminClient.patch<AdminSettings>("/admin/settings", { footer }), { success: "Footer saved. Every page shows it now." });
    if (result.ok) {
      setErrors({});
      // The old logo is deleted once nothing uses it.
      if (saved.logoUrl && saved.logoUrl !== footer.logoUrl) adminClient.discardUploads([saved.logoUrl]);
    } else {
      setErrors(Object.fromEntries(Object.entries(result.error.fieldErrors).map(([path, m]) => [path.replace(/^footer\./, ""), m])));
    }
  };

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-5">
      <datalist id="footer-routes">
        {ROUTES.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>

      <div className="grid gap-5 md:grid-cols-2">
        <Item label="Logo" shown={footer.showLogo} onShow={(showLogo) => set({ showLogo })}>
          <ImageUpload
            label="Logo image"
            slot="footer-logo"
            value={footer.logoUrl}
            onChange={(logoUrl) => set({ logoUrl })}
            onUploaded={trackUpload}
            maxBytes={maxUploadBytes}
            error={errors.logoUrl}
          />
          {!footer.logoUrl && <span className="text-xs text-zinc-500">No logo uploaded: the footer shows the NSB logo.</span>}
        </Item>
        <div className="flex flex-col gap-4">
          <Item label="Short text under the logo" shown={footer.showAbout} onShow={(showAbout) => set({ showAbout })}>
            <Field label="Short text under the logo" hideLabel error={errors.about}>
              <TextArea value={footer.about} rows={3} maxLength={300} invalid={!!errors.about} onChange={(e) => set({ about: e.target.value })} />
            </Field>
          </Item>
          <Item label="Phone number" shown={footer.showPhone} onShow={(showPhone) => set({ showPhone })}>
            <Field label="Phone number" hideLabel hint="Visitors can tap it to call." error={errors.phone}>
              <TextInput value={footer.phone} maxLength={20} placeholder="+91 98115 90088" inputMode="tel" invalid={!!errors.phone} onChange={(e) => set({ phone: e.target.value })} />
            </Field>
          </Item>
          <Item label="“Trusted by local businesses” badge" shown={footer.showBadge} onShow={(showBadge) => set({ showBadge })}>
            <span className="text-xs text-zinc-500">The shield with five stars below the phone number.</span>
          </Item>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <b className="text-sm">Quick links</b>
        <p className="text-xs text-zinc-500">
          Up to {FOOTER_MAX_LINKS}. A link can be a page on this site such as /real-estate, a full https:// address, mailto: or tel:. Leave it blank to show the
          text until the page is ready. Switch a link off to hide it without deleting it. The Categories list next to it follows the categories switched on
          above.
        </p>
        <LinksEditor list="quickLinks" links={footer.quickLinks} errors={errors} onChange={(quickLinks) => set({ quickLinks })} />
      </div>

      <div className="flex flex-col gap-2">
        <b className="text-sm">Links after the copyright line</b>
        <p className="text-xs text-zinc-500">For example Terms and Privacy.</p>
        <LinksEditor list="bottomLinks" links={footer.bottomLinks} errors={errors} onChange={(bottomLinks) => set({ bottomLinks })} />
      </div>

      <div className="flex flex-col gap-2">
        <b className="text-sm">Social media</b>
        <p className="text-xs text-zinc-500">Paste the full link to each page. An icon shows only while it has a link and is switched on.</p>
        <div className="grid gap-3 md:grid-cols-2">
          {FOOTER_SOCIALS.map((s) => {
            const page = footer.socials[s];
            const setPage = (patch: Partial<typeof page>) => set({ socials: { ...footer.socials, [s]: { ...page, ...patch } } });
            return (
              <Item key={s} label={FOOTER_SOCIAL_LABELS[s]} shown={page.visible} onShow={(visible) => setPage({ visible })}>
                <Field label={FOOTER_SOCIAL_LABELS[s]} hideLabel error={errors[`socials.${s}.url`]}>
                  <TextInput
                    value={page.url}
                    type="url"
                    maxLength={300}
                    placeholder="https://"
                    invalid={!!errors[`socials.${s}.url`]}
                    onChange={(e) => setPage({ url: e.target.value })}
                  />
                </Field>
              </Item>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {changed && <span className="text-sm text-zinc-500">You have unsaved changes.</span>}
        {changed && (
          <Button variant="secondary" onClick={() => setFooter(saved)} disabled={pending}>
            Undo changes
          </Button>
        )}
        <Button variant="secondary" onClick={() => setFooter({ ...DEFAULT_FOOTER, logoUrl: footer.logoUrl })} disabled={pending}>
          Reset text and links to the original design
        </Button>
        <Button type="submit" pending={pending} disabled={!changed}>
          {pending ? "Saving…" : "Save footer"}
        </Button>
      </div>
    </form>
  );
}
