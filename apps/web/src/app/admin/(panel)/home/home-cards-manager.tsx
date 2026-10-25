"use client";

import { type FormEvent, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, RotateCcw } from "lucide-react";
import {
  type AdminSettings,
  DEFAULT_HOME_CARDS,
  HOME_CARD_COLOR_LABELS,
  HOME_CARD_COLORS,
  HOME_CARD_ICON_LABELS,
  HOME_CARD_ICONS,
  HOME_CARD_MAX_TAGS,
  HOME_CARD_TAG_SUGGESTIONS,
  HOME_CARD_TAG_TONES,
  type HomeCard,
  type HomeCardTag,
} from "@nsb/shared";
import { Button, Field, IconButton, Select, TextInput, Toggle } from "@/components/admin/form";
import { useSessionUploads, useUploader } from "@/components/admin/image-upload";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { Icon } from "@/components/site/nsb-home/bits";
import { HOME_CARD_ICON_PATHS } from "@/components/site/nsb-home/content";
import { adminClient } from "@/lib/admin-client";

const TONE_LABELS: Record<HomeCardTag["tone"], string> = { red: "Red", blue: "Blue", gold: "Gold", green: "Green", dark: "Dark" };
/** Pages the cards often point to; any site path or https:// link works. */
const ROUTES = ["/wedding", "/wedding/wedding-venues", "/wedding/makeup-beauty", "/wedding/photography-films", "/real-estate", "/schools", "/brand-stores"];

/** The card as the home page draws it: image or colour, icon, tags and title. */
function CardPreview({ card }: { card: HomeCard }) {
  return (
    <div className={`a-cpv ${card.color} ${card.imageUrl ? "img" : ""}`} style={card.imageUrl ? { backgroundImage: `url(${JSON.stringify(card.imageUrl)})` } : undefined}>
      {card.tags.length > 0 && (
        <div className="a-qt">
          {card.tags.map((t) => (
            <em key={t.label} className={t.tone}>
              {t.label}
            </em>
          ))}
        </div>
      )}
      {(!card.imageUrl || card.showIcon) && <Icon d={HOME_CARD_ICON_PATHS[card.icon]} size={32} stroke={1.6} />}
      <span>{card.title || "Title"}</span>
    </div>
  );
}

/** Tags shown on the card, e.g. a red "New" or a gold "Top": up to three, any words. */
function TagsEditor({ tags, onChange }: { tags: HomeCardTag[]; onChange: (tags: HomeCardTag[]) => void }) {
  const [label, setLabel] = useState("");
  const [tone, setTone] = useState<HomeCardTag["tone"]>("red");
  const full = tags.length >= HOME_CARD_MAX_TAGS;
  const add = () => {
    const text = label.trim().slice(0, 16);
    setLabel("");
    if (!text || full || tags.some((t) => t.label.toLowerCase() === text.toLowerCase())) return;
    onChange([...tags, { label: text, tone }]);
  };
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-semibold">
        Tags <span className="font-normal text-zinc-500">shown on the card, e.g. New or Top (up to {HOME_CARD_MAX_TAGS})</span>
      </span>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t, i) => (
            <span key={t.label} className={`a-tagc ${t.tone}`}>
              {t.label}
              <button type="button" aria-label={`Remove tag ${t.label}`} onClick={() => onChange(tags.filter((_, j) => j !== i))}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {!full && (
        <div className="flex flex-wrap gap-2">
          <TextInput
            className="w-36!"
            list="home-card-tags"
            value={label}
            maxLength={16}
            placeholder="New, Top…"
            aria-label="Tag text"
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault(); // Enter would submit the whole form.
              add();
            }}
          />
          <Select className="w-28!" value={tone} aria-label="Tag colour" onChange={(e) => setTone(e.target.value as HomeCardTag["tone"])}>
            {HOME_CARD_TAG_TONES.map((t) => (
              <option key={t} value={t}>
                {TONE_LABELS[t]}
              </option>
            ))}
          </Select>
          <Button variant="secondary" onClick={add} disabled={!label.trim()}>
            Add tag
          </Button>
        </div>
      )}
    </div>
  );
}

/** Own image for a card: upload, replace or remove. */
function CardImage({ url, onChange, onUploaded, maxBytes }: { url: string | null; onChange: (url: string | null) => void; onUploaded: (url: string) => void; maxBytes: number }) {
  const input = useRef<HTMLInputElement>(null);
  const { upload, pending, error } = useUploader("home-card", maxBytes, onUploaded);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={pending} onClick={() => input.current?.click()}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {url ? "Replace image" : "Use my own image"}
        </Button>
        {url && (
          <Button variant="secondary" disabled={pending} onClick={() => onChange(null)}>
            Remove image
          </Button>
        )}
      </div>
      <span className="text-xs text-zinc-500">Best size 700 × 460. JPEG, PNG or WebP.</span>
      {error && <span className="text-xs text-red-600">{error}</span>}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Upload card image"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          const uploaded = await upload(file);
          if (uploaded) onChange(uploaded);
        }}
      />
    </div>
  );
}

/**
 * Home page › "Four cards", as in the demo: each card's title, colour and icon (or own image),
 * where it goes, its tags, and its position. Saved together with one button.
 */
export function HomeCardsManager({ cards: saved, maxUploadBytes }: { cards: HomeCard[]; maxUploadBytes: number }) {
  const { run, pending } = useAdminAction();
  const trackUpload = useSessionUploads();
  const [cards, setCards] = useState<HomeCard[]>(saved);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const changed = JSON.stringify(cards) !== JSON.stringify(saved);

  const set = (i: number, patch: Partial<HomeCard>) => setCards((all) => all.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const move = (i: number, to: number) =>
    setCards((all) => {
      const next = [...all];
      [next[i], next[to]] = [next[to]!, next[i]!];
      return next;
    });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await run(() => adminClient.patch<AdminSettings>("/admin/settings", { homeCards: cards }), { success: "Cards saved. The homepage shows them now." });
    if (result.ok) {
      setErrors({});
      // Images no card uses any more are deleted (files still in use are kept).
      const kept = new Set(cards.map((c) => c.imageUrl));
      adminClient.discardUploads(saved.map((c) => c.imageUrl).filter((u): u is string => !!u && !kept.has(u)));
    } else {
      setErrors(Object.fromEntries(Object.entries(result.error.fieldErrors).map(([path, m]) => [path.replace(/^homeCards\./, ""), m])));
    }
  };

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate>
      <datalist id="home-card-routes">
        {ROUTES.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>
      <datalist id="home-card-tags">
        {HOME_CARD_TAG_SUGGESTIONS.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>

      {cards.map((card, i) => (
        <div key={i} className="a-hrow a-cardrow">
          <div className="flex flex-col gap-1.5">
            <CardPreview card={card} />
            <small className="text-center text-xs text-zinc-500">{["Top left", "Top right", "Bottom left", "Bottom right"][i]}</small>
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <b>Card {i + 1}</b>
            <Field label="Title (short)" error={errors[`${i}.title`]}>
              <TextInput value={card.title} maxLength={28} placeholder="e.g. Interior design" invalid={!!errors[`${i}.title`]} onChange={(e) => set(i, { title: e.target.value })} />
            </Field>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold">Colour and icon</span>
              <div className="a-sws">
                {HOME_CARD_COLORS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`a-sw0 ${g}`}
                    title={HOME_CARD_COLOR_LABELS[g]}
                    aria-label={HOME_CARD_COLOR_LABELS[g]}
                    aria-pressed={card.color === g}
                    onClick={() => set(i, { color: g })}
                  />
                ))}
                <Select className="w-40!" value={card.icon} aria-label="Icon" onChange={(e) => set(i, { icon: e.target.value as HomeCard["icon"] })}>
                  {HOME_CARD_ICONS.map((k) => (
                    <option key={k} value={k}>
                      {HOME_CARD_ICON_LABELS[k]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <TagsEditor tags={card.tags} onChange={(tags) => set(i, { tags })} />
            {errors[`${i}.tags`] && <span className="text-xs text-red-600">{errors[`${i}.tags`]}</span>}
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <Field label="Where should it go? (link)" hint="A page on this site such as /wedding, or a full https:// address" error={errors[`${i}.link`]}>
              <TextInput value={card.link} list="home-card-routes" maxLength={300} placeholder="/wedding" invalid={!!errors[`${i}.link`]} onChange={(e) => set(i, { link: e.target.value })} />
            </Field>
            <CardImage url={card.imageUrl} onChange={(imageUrl) => set(i, { imageUrl })} onUploaded={trackUpload} maxBytes={maxUploadBytes} />
            {card.imageUrl && (
              <Toggle label="Also show the icon on the image (the title always shows)" showLabel checked={card.showIcon} onChange={(showIcon) => set(i, { showIcon })} />
            )}
          </div>

          <div className="a-mv">
            <IconButton label={`Move card ${i + 1} up`} disabled={i === 0} onClick={() => move(i, i - 1)}>
              <ArrowUp className="size-4" aria-hidden />
            </IconButton>
            <IconButton label={`Move card ${i + 1} down`} disabled={i === cards.length - 1} onClick={() => move(i, i + 1)}>
              <ArrowDown className="size-4" aria-hidden />
            </IconButton>
            <IconButton label={`Reset card ${i + 1} to the original design`} onClick={() => setCards((all) => all.map((c, j) => (j === i ? DEFAULT_HOME_CARDS[i]! : c)))}>
              <RotateCcw className="size-4" aria-hidden />
            </IconButton>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        {changed && <span className="text-sm text-zinc-500">You have unsaved changes.</span>}
        {changed && (
          <Button variant="secondary" onClick={() => setCards(saved)} disabled={pending}>
            Undo changes
          </Button>
        )}
        <Button type="submit" pending={pending} disabled={!changed}>
          {pending ? "Saving…" : "Save cards"}
        </Button>
      </div>
    </form>
  );
}
