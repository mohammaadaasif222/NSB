import { useEffect, useRef, useState, type FC } from 'react';
import CountryFlag from '@/components/flags/CountryFlag';
import { LanguageMenu } from '@/components/LanguagePicker';
import { LOCALE_META } from '@/i18n/locales';
import { ChevronDownIcon } from '@/components/icons';
import { isChatRoom, type ChatRoom } from '@/services/chat';

interface Props {
  room: ChatRoom;
  rooms: readonly ChatRoom[];
  onChange: (room: ChatRoom) => void;
  label: string;
}

const metaFor = (room: ChatRoom) =>
  LOCALE_META.find((entry) => entry.code === room) ?? LOCALE_META[0];

const ChatRoomPicker: FC<Props> = ({ room, rooms, onChange, label }) => {
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

  if (rooms.length < 2) {
    return (
      <span className="inline-flex items-center gap-2 px-1 py-1.5 text-[13px] font-semibold text-slate-100">
        <CountryFlag country={active.country} size={18} />
        <span className="max-w-[7rem] truncate">{active.label}</span>
      </span>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="glass-pill flex h-10 items-center gap-1.5 px-2.5 font-rubik text-[14px] text-white"
      >
        <CountryFlag country={active.country} size={24} />
        <span className="max-w-[7rem] truncate font-medium">{active.label}</span>
        <ChevronDownIcon size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <LanguageMenu
          locales={LOCALE_META.filter((entry) => rooms.some((code) => code === entry.code))}
          current={room}
          onSelect={(code) => {
            if (isChatRoom(code)) onChange(code);
            setOpen(false);
          }}
          title={label}
          className="!absolute start-0 top-full mt-1.5 !bg-[#121317]"
        />
      )}
    </div>
  );
};

export default ChatRoomPicker;
