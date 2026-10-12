import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FC,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
} from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from '@/context/I18nContext';
import { removeAvatar, uploadAvatar } from '@/services/profile';
import {
  AVATAR_ACCEPT,
  MAX_AVATAR_BYTES,
  MIN_AVATAR_SOURCE_SIZE,
  cropToSquare,
  isAcceptedAvatarType,
  loadImageFile,
  megabytes,
  type LoadedImage,
} from '@/lib/avatarImage';
import { CameraIcon } from '@/components/icons';
import ProfileModalShell from './ProfileModalShell';

interface Props {
  currentAvatarUrl: string | null;
  onClose: () => void;
  onSaved: (avatarUrl: string | null) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.05;
const WHEEL_STEP = ZOOM_STEP * 4;
const NUDGE = 8;

interface Frame {
  zoom: number;
  x: number;
  y: number;
}

interface Metrics {
  scale: number;
  width: number;
  height: number;
}

const UNMEASURED: Frame = { zoom: MIN_ZOOM, x: 0, y: 0 };

const ChangeAvatarModal: FC<Props> = ({ currentAvatarUrl, onClose, onSaved }) => {
  const { t } = useTranslation();
  const zoomId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const loaded = useRef<LoadedImage | null>(null);
  const unframed = useRef(true);

  const [source, setSource] = useState<LoadedImage | null>(null);
  const [side, setSide] = useState(0);
  const [frame, setFrame] = useState<Frame>(UNMEASURED);
  const [dragging, setDragging] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(
    () => () => {
      if (loaded.current) {
        URL.revokeObjectURL(loaded.current.url);
      }
    },
    []
  );

  useLayoutEffect(() => {
    const node = viewport.current;

    if (!node || !source) {
      return;
    }

    const apply = (): void => {
      const next = node.clientWidth;

      if (next === 0) {
        return;
      }

      setSide(next);

      const iw = source.image.naturalWidth;
      const ih = source.image.naturalHeight;
      const first = unframed.current;
      unframed.current = false;

      setFrame((current) => {
        const zoom = first ? MIN_ZOOM : current.zoom;
        const scale = (next / Math.min(iw, ih)) * zoom;
        const width = iw * scale;
        const height = ih * scale;
        const x = first ? (next - width) / 2 : current.x;
        const y = first ? (next - height) / 2 : current.y;

        return {
          zoom,
          x: Math.min(0, Math.max(next - width, x)),
          y: Math.min(0, Math.max(next - height, y)),
        };
      });
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(node);

    return () => observer.disconnect();
  }, [source]);

  const measured = useCallback(
    (next: Frame): Metrics | null => {
      if (!source || side === 0) {
        return null;
      }

      const iw = source.image.naturalWidth;
      const ih = source.image.naturalHeight;
      const scale = (side / Math.min(iw, ih)) * next.zoom;

      return { scale, width: iw * scale, height: ih * scale };
    },
    [source, side]
  );

  const clamped = useCallback(
    (next: Frame): Frame => {
      const size = measured(next);

      if (!size) {
        return next;
      }

      return {
        zoom: next.zoom,
        x: Math.min(0, Math.max(side - size.width, next.x)),
        y: Math.min(0, Math.max(side - size.height, next.y)),
      };
    },
    [measured, side]
  );

  const recentre = useCallback((): void => {
    const size = measured(UNMEASURED);

    if (!size) {
      setFrame(UNMEASURED);
      return;
    }

    setFrame({
      zoom: MIN_ZOOM,
      x: (side - size.width) / 2,
      y: (side - size.height) / 2,
    });
  }, [measured, side]);

  const accept = useCallback(
    async (file: File): Promise<void> => {
      setError('');

      if (!isAcceptedAvatarType(file.type)) {
        setError(t('avatar.errType'));
        return;
      }

      if (file.size > MAX_AVATAR_BYTES) {
        setError(t('avatar.errSize', { max: megabytes(MAX_AVATAR_BYTES) }));
        return;
      }

      try {
        const next = await loadImageFile(file);

        if (loaded.current) {
          URL.revokeObjectURL(loaded.current.url);
        }

        loaded.current = next;
        unframed.current = true;
        setSource(next);
        setFrame(UNMEASURED);
      } catch (err) {
        setError(
          (err as Error)?.message === 'too-small'
            ? t('avatar.errTooSmall', { min: MIN_AVATAR_SOURCE_SIZE })
            : t('avatar.errRead')
        );
      }
    },
    [t]
  );

  const onPick = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (file) {
      void accept(file);
    }
  };

  const onDrop = (event: DragEvent<HTMLElement>): void => {
    event.preventDefault();
    setDropping(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      void accept(file);
    }
  };

  const zoomTo = useCallback(
    (nextZoom: number): void => {
      const bounded = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));

      setFrame((current) => {
        const from = measured(current);
        const to = measured({ ...current, zoom: bounded });

        if (!from || !to) {
          return { ...current, zoom: bounded };
        }

        const centreX = (side / 2 - current.x) / from.scale;
        const centreY = (side / 2 - current.y) / from.scale;

        return clamped({
          zoom: bounded,
          x: side / 2 - centreX * to.scale,
          y: side / 2 - centreY * to.scale,
        });
      });
    },
    [clamped, measured, side]
  );

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    if (!source || event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    const start = drag.current;

    if (!start || start.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };

    setFrame((current) => clamped({ ...current, x: current.x + dx, y: current.y + dy }));
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>): void => {
    if (drag.current?.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    drag.current = null;
    setDragging(false);
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>): void => {
    if (!source) {
      return;
    }

    event.preventDefault();
    zoomTo(frame.zoom - Math.sign(event.deltaY) * WHEEL_STEP);
  };

  const PAN_KEYS: Record<string, [number, number]> = {
    ArrowLeft: [-NUDGE, 0],
    ArrowRight: [NUDGE, 0],
    ArrowUp: [0, -NUDGE],
    ArrowDown: [0, NUDGE],
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (!source) {
      return;
    }

    const step = PAN_KEYS[event.key];

    if (step) {
      event.preventDefault();
      setFrame((current) =>
        clamped({ ...current, x: current.x + step[0], y: current.y + step[1] })
      );
      return;
    }

    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      zoomTo(frame.zoom + WHEEL_STEP);
    }

    if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      zoomTo(frame.zoom - WHEEL_STEP);
    }
  };

  const save = async (): Promise<void> => {
    if (!source) {
      fileInput.current?.click();
      return;
    }

    const size = measured(frame);

    if (!size) {
      return;
    }

    setBusy(true);
    setError('');

    try {
      const { blob, filename } = await cropToSquare(source.image, {
        x: -frame.x / size.scale,
        y: -frame.y / size.scale,
        size: side / size.scale,
      });

      if (blob.size > MAX_AVATAR_BYTES) {
        setError(t('avatar.errSize', { max: megabytes(MAX_AVATAR_BYTES) }));
        return;
      }

      const res = await uploadAvatar(blob, filename);

      if (res?.success && res.data) {
        toast.success(t('avatar.saved'));
        onSaved(res.data.avatar_url ?? null);
        onClose();
        return;
      }

      setError(res?.message || t('avatar.errUpload'));
    } catch (err) {
      setError((err as { message?: string })?.message || t('avatar.errUpload'));
    } finally {
      setBusy(false);
    }
  };

  const discard = async (): Promise<void> => {
    setBusy(true);
    setError('');

    try {
      const res = await removeAvatar();

      if (res?.success) {
        toast.success(t('avatar.removed'));
        onSaved(null);
        onClose();
        return;
      }

      setError(res?.message || t('avatar.errRemove'));
    } catch (err) {
      setError((err as { message?: string })?.message || t('avatar.errRemove'));
    } finally {
      setBusy(false);
    }
  };

  const size = measured(frame);

  return (
    <ProfileModalShell
      title={t('avatar.title')}
      onClose={onClose}
      onSubmit={() => void save()}
      loading={busy}
      submitLabel={source ? t('avatar.save') : t('avatar.choose')}
    >
      <input
        ref={fileInput}
        type="file"
        accept={AVATAR_ACCEPT}
        onChange={onPick}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {source ? (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div
              ref={viewport}
              role="group"
              tabIndex={0}
              aria-label={t('avatar.cropArea')}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onWheel={onWheel}
              onKeyDown={onKeyDown}
              className={`relative aspect-square w-full max-w-[320px] touch-none overflow-hidden rounded-2xl bg-black/40 outline-none select-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                dragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              {size && (
                <img
                  src={source.url}
                  alt=""
                  draggable={false}
                  style={{
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                    transform: `translate3d(${frame.x}px, ${frame.y}px, 0)`,
                  }}
                  className="absolute top-0 left-0 max-w-none origin-top-left"
                />
              )}

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full border border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
              />
            </div>
          </div>

          <p className="text-center text-sm leading-5 text-[#9da2b4]">{t('avatar.cropHint')}</p>

          <div className="flex items-center gap-3">
            <label htmlFor={zoomId} className="text-sm leading-5 font-medium text-[#f0f1f5]">
              {t('avatar.zoom')}
            </label>
            <input
              id={zoomId}
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={ZOOM_STEP}
              value={frame.zoom}
              onChange={(e) => zoomTo(Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer rounded-full bg-white/15 accent-[#f0f1f5]"
            />
            <button
              type="button"
              onClick={recentre}
              className="rl-chip h-9 shrink-0 px-3 text-xs font-semibold text-[#f0f1f5]"
            >
              {t('avatar.reset')}
            </button>
          </div>

          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="w-full text-center text-sm leading-5 font-medium text-[#9da2b4] underline-offset-4 hover:text-[#f0f1f5] hover:underline"
          >
            {t('avatar.pickAnother')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDropping(true);
            }}
            onDragLeave={() => setDropping(false)}
            onDrop={onDrop}
            className={`flex w-full flex-col items-center gap-3 rounded-2xl border border-dashed px-5 py-10 transition-colors ${
              dropping
                ? 'border-white/50 bg-white/10'
                : 'border-white/20 bg-white/5 hover:bg-white/8'
            }`}
          >
            {currentAvatarUrl ? (
              <img
                src={currentAvatarUrl}
                alt={t('avatar.current')}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/7 text-[#f0f1f5]">
                <CameraIcon size={28} strokeWidth={1.5} />
              </span>
            )}

            <span className="text-base leading-6 font-semibold text-[#f0f1f5]">
              {t('avatar.dropTitle')}
            </span>
            <span className="text-sm leading-5 text-[#9da2b4]">
              {t('avatar.dropHint', { max: megabytes(MAX_AVATAR_BYTES) })}
            </span>
          </button>

          {currentAvatarUrl && (
            <button
              type="button"
              onClick={() => void discard()}
              disabled={busy}
              className="w-full text-center text-sm leading-5 font-medium text-[#ef4462] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('avatar.remove')}
            </button>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-center text-sm leading-5 text-[#ef4462]">
          {error}
        </p>
      )}
    </ProfileModalShell>
  );
};

export default ChangeAvatarModal;
