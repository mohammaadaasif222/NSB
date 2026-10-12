import { useState, type FC, type FormEvent } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { PanelHeader, PanelIconButton } from '@/components/player/HeaderPopover';
import { CloseIcon, SendIcon } from '@/components/icons';

/**
 * Support chat.
 *
 * There is no chat service behind this yet, so the composer is inert: it takes
 * input and tags the send button "Soon" rather than pretending to deliver a
 * message no one will read. Wiring it up means replacing `send` and dropping
 * the empty state for a real transcript — the shell around it does not change.
 */

/** The agents who would be on the other end, shown as a stacked pair. */
const AGENTS = [
  { initial: 'B', tone: 'bg-amber-500' },
  { initial: 'S', tone: 'bg-blue-600' },
];

const AgentCluster: FC = () => (
  <span className="inline-flex items-center rounded-full bg-slate-900 border border-slate-700 px-2 py-1.5">
    {AGENTS.map((agent, i) => (
      <span
        key={agent.initial}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-slate-800 ${agent.tone} ${
          i > 0 ? '-ms-2' : ''
        }`}
      >
        {agent.initial}
      </span>
    ))}
  </span>
);

const ChatPanel: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');

  const send = (e: FormEvent): void => {
    // Nothing to send to until there is a chat service; the field simply keeps
    // what was typed so the state is not lost when the panel is reopened.
    e.preventDefault();
  };

  return (
    <div className="flex h-[30rem] flex-col">
      <PanelHeader
        title={t('nav.chat')}
        action={
          <PanelIconButton label={t('nav.closeMenu')} onClick={onClose}>
            <CloseIcon size={17} />
          </PanelIconButton>
        }
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <AgentCluster />
        <p className="text-xs text-slate-500">{t('lobby.chat.soon')}</p>
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-700 p-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('lobby.chat.placeholder')}
          aria-label={t('lobby.chat.message')}
          className="min-w-0 flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60"
        />
        <button
          type="submit"
          disabled
          title={t('common.soon')}
          aria-label={t('common.soon')}
          className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-700 text-slate-400"
        >
          <SendIcon size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
