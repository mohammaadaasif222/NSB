import { useEffect, useRef, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { CloseIcon } from '@/components/icons';

interface Props {
  open: boolean;
  onClose: () => void;
}

const RULE_KEYS = [
  'chat.rule.respect',
  'chat.rule.noSpam',
  'chat.rule.noBegging',
  'chat.rule.noAdvertising',
  'chat.rule.noScams',
  'chat.rule.language',
  'chat.rule.noPersonal',
  'chat.rule.staffNeverAsk',
] as const;

const ChatRules: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event: MouseEvent): void => {
      const node = ref.current;
      if (!node || node.contains(event.target as Node)) return;
      if ((event.target as HTMLElement).closest('[data-rules-toggle]')) return;
      onClose();
    };

    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={t('chat.rules')}
      className="absolute inset-x-3 top-3 z-20 overflow-hidden rounded-2xl border border-slate-700 bg-[#12151c] shadow-2xl"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
        <h3 className="text-sm font-bold text-white">{t('chat.rules')}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <CloseIcon size={16} />
        </button>
      </div>

      <ol className="thin-scrollbar max-h-[22rem] space-y-2.5 overflow-y-auto px-4 py-3.5">
        {RULE_KEYS.map((key, index) => (
          <li key={key} className="flex gap-2.5 text-[12px] leading-relaxed text-slate-300">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-400">
              {index + 1}
            </span>
            <span>{t(key)}</span>
          </li>
        ))}
      </ol>

      <p className="border-t border-slate-800 px-4 py-2.5 text-[11px] text-slate-500">
        {t('chat.rulesFooter')}
      </p>
    </div>
  );
};

export default ChatRules;
