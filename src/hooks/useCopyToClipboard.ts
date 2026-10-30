import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { translate } from '@/i18n/translate';

/**
 * `navigator.clipboard` needs a secure context and is absent over plain HTTP
 * on a LAN address, so fall back to the old textarea + execCommand route.
 */
const writeText = async (text: string): Promise<void> => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(area);
  if (!ok) throw new Error('copy failed');
};

/**
 * Copies text and reports it: `copied` is true for `resetMs` afterwards so the
 * control can show it, and a toast confirms it wherever the player is looking.
 */
export const useCopyToClipboard = (resetMs = 2000) => {
  const [copied, setCopied] = useState(false);

  // Clears itself so the control does not sit on "Copied" forever.
  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), resetMs);
    return () => window.clearTimeout(id);
  }, [copied, resetMs]);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text) return false;
      try {
        await writeText(text);
        setCopied(true);
        toast.success(translate('ref.copied'), { toastId: 'copied', autoClose: resetMs });
        return true;
      } catch {
        // Show the text so it can still be copied by hand.
        toast.info(text);
        return false;
      }
    },
    [resetMs]
  );

  return { copied, copy };
};
