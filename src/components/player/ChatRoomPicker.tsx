import { useEffect, useRef, useState, type FC } from 'react';
import CountryFlag from '@/components/flags/CountryFlag';
import { LOCALE_META } from '@/i18n/locales';
import { ChevronDownIcon } from '@/components/icons';
import { CHAT_ROOMS, type ChatRoom } from '@/services/chat';

interface Props {
  room: ChatRoom;
  onChange: (room: ChatRoom) => void;
  label: string;
}

const metaFor = (room: ChatRoom) =>
  LOCALE_META.find((entry) => entry.code === room) ?? LOCALE_META[0];

const ChatRoomPicker: FC<Props> = ({ room, onChange, label }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event: MouseEvent): void => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const active = metaFor(room);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[13px] font-semibold text-slate-100 transition-colors hover:border-slate-600"
      >
        <CountryFlag country={active.country} size={18} />
        <span className="max-w-[7rem] truncate">{active.label}</span>
        <ChevronDownIcon size={14} className={open ? 'rotate-180' : undefined} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="thin-scrollbar absolute start-0 top-full z-20 mt-1.5 max-h-[18rem] w-[13rem] overflow-y-auto rounded-2xl border border-slate-700 bg-[#12151c] p-1.5 shadow-2xl"
        >
          {CHAT_ROOMS.map((code) => {
            const meta = metaFor(code);
            const selected = code === room;

            return (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-[13px] transition-colors ${
                    selected
                      ? 'bg-[#4a9eff]/15 font-semibold text-[#4a9eff]'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <CountryFlag country={meta.country} size={20} />
                  <span className="truncate">{meta.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ChatRoomPicker;
