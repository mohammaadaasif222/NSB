import { useEffect, type FC } from 'react';
import type { MentionRef } from '@/services/chat';

export interface MentionQuery {
  at: number;
  text: string;
}

export const readMentionQuery = (value: string, caret: number): MentionQuery | null => {
  const upto = value.slice(0, caret);
  const at = upto.lastIndexOf('@');

  if (at === -1) return null;

  const before = at === 0 ? '' : upto[at - 1];
  if (before && /[\p{L}\p{N}_]/u.test(before)) return null;

  const text = upto.slice(at + 1);
  if (text.includes('\n') || text.length > 32) return null;

  return { at, text };
};

export const matchParticipants = (
  participants: readonly MentionRef[],
  text: string,
  limit = 6
): MentionRef[] => {
  const needle = text.trim().toLowerCase();

  const matched = needle
    ? participants.filter((person) => person.name.toLowerCase().includes(needle))
    : [...participants];

  matched.sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(needle) ? 0 : 1;
    const bStarts = b.name.toLowerCase().startsWith(needle) ? 0 : 1;
    return aStarts - bStarts || a.name.localeCompare(b.name);
  });

  return matched.slice(0, limit);
};

interface Props {
  people: MentionRef[];
  active: number;
  onPick: (person: MentionRef) => void;
  onActive: (index: number) => void;
}

const MentionSuggest: FC<Props> = ({ people, active, onPick, onActive }) => {
  useEffect(() => {
    if (active >= people.length) onActive(0);
  }, [people.length, active, onActive]);

  if (people.length === 0) return null;

  return (
    <ul
      role="listbox"
      className="absolute bottom-full start-0 end-0 z-20 mb-2 overflow-hidden rounded-2xl border border-slate-700 bg-[#12151c] p-1.5 shadow-2xl"
    >
      {people.map((person, index) => (
        <li key={person.user_id}>
          <button
            type="button"
            role="option"
            aria-selected={index === active}
            onMouseEnter={() => onActive(index)}
            onMouseDown={(event) => {
              event.preventDefault();
              onPick(person);
            }}
            className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-start text-[13px] transition-colors ${
              index === active ? 'bg-[#4a9eff]/15 text-[#4a9eff]' : 'text-slate-300'
            }`}
          >
            <span className="truncate font-semibold">{person.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default MentionSuggest;
