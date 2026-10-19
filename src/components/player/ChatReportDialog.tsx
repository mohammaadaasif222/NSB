import { useEffect, useRef, useState, type FC, type FormEvent } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { CloseIcon, FlagIcon } from '@/components/icons';
import { CHAT_REPORT_REASON_MAX, type ChatMessage } from '@/services/chat';

interface Props {
  message: ChatMessage | null;
  onClose: () => void;
  onSubmit: (messageId: string, reason: string) => Promise<void>;
  onReported: () => void;
}

const ChatReportDialog: FC<Props> = ({ message, onClose, onSubmit, onReported }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setReason('');
    setFailure(null);
    setSubmitting(false);
    if (message) requestAnimationFrame(() => inputRef.current?.focus());
  }, [message]);

  useEffect(() => {
    if (!message) return undefined;

    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose();
    };

    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [message, onClose]);

  if (!message) return null;

  const trimmed = reason.trim();
  const canSubmit = trimmed.length > 0 && !submitting;

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setFailure(null);

    onSubmit(message.id, trimmed)
      .then(() => {
        onReported();
        onClose();
      })
      .catch((err: { message?: string }) => {
        setFailure(err?.message || t('chat.reportFailed'));
        setSubmitting(false);
      });
  };

  const preview = message.kind === 'voice' ? t('chat.voiceMessage') : message.body;

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 px-3 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label={t('chat.reportTitle')}
        onSubmit={submit}
        className="w-full rounded-2xl border border-slate-700 bg-[#1a2330] p-4 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-white">
            <FlagIcon size={17} className="text-slate-300" />
            {t('chat.reportTitle')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="mt-3 rounded-xl border border-slate-600/70 px-3 py-2.5 text-[13px] leading-relaxed text-slate-200">
          <span className="font-semibold text-slate-300">{message.name}:</span>{' '}
          <span className="break-words">{preview}</span>
        </div>

        <label className="mt-3 block">
          <span className="text-[12px] font-medium text-slate-400">{t('chat.reportReason')}</span>
          <input
            ref={inputRef}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={CHAT_REPORT_REASON_MAX}
            placeholder={t('chat.reportPlaceholder')}
            className="mt-1.5 w-full rounded-lg border border-slate-500/80 bg-[#0f1923] px-3 py-2.5 text-[13px] text-white outline-none transition-colors placeholder:text-slate-600 focus:border-[#4a9eff]"
          />
        </label>

        {failure && (
          <p role="alert" className="mt-2 text-[11px] text-rose-400">
            {failure}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-600/60 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-slate-600"
          >
            {t('chat.reportCancel')}
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg bg-[#1475e1] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a82f5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('chat.reportConfirm')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatReportDialog;
