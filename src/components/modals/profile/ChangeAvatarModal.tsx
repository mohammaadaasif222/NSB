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
import { uploadAvatar } from '@/services/profile';
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
import { CameraIcon, CheckIcon, ChevronLeftIcon, CloseIcon } from '@/components/icons';
import Button from '@/components/ui/Button';
import CircleIconButton from '@/components/ui/CircleIconButton';
import Modal from '@/components/ui/Modal';
import { useStageScale } from '@/hooks/useStageScale';
import zeus from '@/assets/profile/avatars/zeus.webp';
import lion from '@/assets/profile/avatars/lion.webp';
import monkey from '@/assets/profile/avatars/monkey.webp';
import dragon from '@/assets/profile/avatars/dragon.webp';
import jester from '@/assets/profile/avatars/jester.webp';
import pharaoh from '@/assets/profile/avatars/pharaoh.webp';
import cowboy from '@/assets/profile/avatars/cowboy.webp';

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

/** The design's avatars, in its order after the upload tile. */
const PRESETS = [
  { key: 'zeus', image: zeus },
  { key: 'lion', image: lion },
  { key: 'monkey', image: monkey },
  { key: 'dragon', image: dragon },
  { key: 'jester', image: jester },
  { key: 'pharaoh', image: pharaoh },
  { key: 'cowboy', image: cowboy },
] as const;

type PresetKey = (typeof PRESETS)[number]['key'];

/** The design's chosen-tile mark: a 2px gold ring and a gold check badge. */
const Chosen: FC = () => (
  <>
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#f9d028]"
    />
    <span
      aria-hidden="true"
      className="absolute -right-[6%] top-[3.6%] flex aspect-square w-[38%] items-center justify-center rounded-full bg-[#f9d028] text-[#07080a] sm:right-[2.6%] sm:top-[2.6%] sm:w-[27.6%]"
    >
      <CheckIcon size={18} strokeWidth={3} className="h-[56%] w-[56%]" />
    </span>
  </>
);

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
  // A picked avatar; an uploaded photo is `source` instead. The last one
  // chosen wins — picking either clears the other.
  const [preset, setPreset] = useState<PresetKey | null>(null);
  const scale = useStageScale(true);

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
        setPreset(null);
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

  const choosePreset = (key: PresetKey): void => {
    setError('');
    setPreset(key);
    setSource(null);
  };

  /** Uploads a picked avatar the way a photo goes up — the image itself. */
  const savePreset = async (key: PresetKey): Promise<void> => {
    const chosen = PRESETS.find((p) => p.key === key);
    if (!chosen) return;
    setBusy(true);
    setError('');
    try {
      const blob = await (await fetch(chosen.image.src)).blob();
      const res = await uploadAvatar(blob, `${key}.webp`);
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

  const save = async (): Promise<void> => {
    if (preset) {
      await savePreset(preset);
      return;
    }
    // Nothing new chosen: Confirm keeps the picture as it is.
    if (!source) {
      onClose();
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

  const size = measured(frame);
  const picked = PRESETS.find((p) => p.key === preset);

  return (
    <Modal
      open
      onClose={onClose}
      ariaLabel={t('avatar.title')}
      surface="rl-dialog-glass"
      style={{ zoom: scale }}
      // The design's 28 / 36 / 29 insets, less the rim's pixel.
      className="max-w-[581px] px-4 pb-5 pt-6 max-sm:fixed max-sm:inset-0 max-sm:flex max-sm:max-w-none max-sm:flex-col max-sm:overflow-y-auto max-sm:!rounded-none max-sm:!border-0 max-sm:!bg-[#07080a] max-sm:![box-shadow:none] max-sm:![zoom:1] max-sm:pt-5 max-sm:pb-[39px] sm:px-[27px] sm:pb-[28px] sm:pt-[35px]"
    >
      <div className="mb-[26px] flex items-center gap-3 sm:hidden">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="rl-glass-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#f0f1f5]"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <h2 className="truncate text-[24px] font-medium leading-8 text-[#f0f1f5]">
          {t('avatar.title')}
        </h2>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept={AVATAR_ACCEPT}
        onChange={onPick}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <CircleIconButton
        label={t('common.close')}
        onClick={onClose}
        className="absolute right-3 top-3 z-10 max-sm:hidden sm:right-[27px] sm:top-[16px]"
      >
        <CloseIcon size={33} strokeWidth={1.45} />
      </CircleIconButton>

      {/* The picture as it will be: the picked avatar, the photo being framed
          (drag to place it, wheel or keys to zoom), or the current one. */}
      <div
        ref={viewport}
        role={source ? 'group' : undefined}
        tabIndex={source ? 0 : undefined}
        aria-label={source ? t('avatar.cropArea') : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        className={`relative mx-auto h-[120px] w-[120px] overflow-hidden rounded-full bg-[#1a1a1a] outline-none select-none focus-visible:ring-2 focus-visible:ring-white/40 sm:h-[163px] sm:w-[163px] ${
          source ? `touch-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}` : ''
        }`}
      >
        {source && size ? (
          <img
            src={source.url}
            alt=""
            draggable={false}
            style={{
              width: `${size.width}px`,
              height: `${size.height}px`,
              transform: `translate3d(${frame.x}px, ${frame.y}px, 0)`,
            }}
            className="absolute left-0 top-0 max-w-none origin-top-left"
          />
        ) : picked || currentAvatarUrl ? (
          <img
            src={picked ? picked.image.src : (currentAvatarUrl ?? '')}
            alt={picked ? '' : t('avatar.current')}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      {/* Zooming a photo needs a control on touch, where there is no wheel. */}
      {source && (
        <div className="mx-auto mt-3 flex w-[163px] items-center">
          <input
            id={zoomId}
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={ZOOM_STEP}
            value={frame.zoom}
            onChange={(e) => zoomTo(Number(e.target.value))}
            aria-label={t('avatar.zoom')}
            className="h-1.5 flex-1 cursor-pointer rounded-full bg-white/15 accent-[#f9d028]"
          />
        </div>
      )}

      <p
        className={`text-[16px] leading-6 text-[#f0f1f5] ${
          source ? 'mt-6 sm:mt-[23px]' : 'mt-9 sm:mt-[50px]'
        }`}
      >
        {t('avatar.pick')}
      </p>

      <ul className="mt-[21px] grid grid-cols-4 gap-[17px] sm:mt-[14px] sm:gap-[20px]">
        <li>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDropping(true);
            }}
            onDragLeave={() => setDropping(false)}
            onDrop={onDrop}
            aria-label={t('avatar.upload')}
            aria-pressed={!!source}
            className={`rl-circle-btn relative flex aspect-square w-full items-center justify-center rounded-full text-[#f0f1f5] ${
              dropping ? 'bg-white/10' : ''
            }`}
          >
            <CameraIcon size={49} strokeWidth={1.3} className="h-[58%] w-[58%] sm:h-[42%] sm:w-[42%]" />
            {source && <Chosen />}
          </button>
        </li>
        {PRESETS.map((p, i) => (
          <li key={p.key}>
            <button
              type="button"
              onClick={() => choosePreset(p.key)}
              aria-pressed={preset === p.key}
              aria-label={t('avatar.preset', { n: i + 1 })}
              className="relative block aspect-square w-full rounded-full transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <img
                src={p.image.src}
                alt=""
                className="h-full w-full rounded-full object-cover"
                draggable={false}
              />
              {preset === p.key && <Chosen />}
            </button>
          </li>
        ))}
      </ul>

      {error && (
        <p role="alert" className="mt-3 text-[13px] leading-5 text-[#ef4462]">
          {error}
        </p>
      )}

      <Button
        fullWidth
        onClick={() => void save()}
        loading={busy}
        className="mt-6 max-sm:mt-auto max-sm:shrink-0 sm:mt-[34px]"
      >
        {t('avatar.confirm')}
      </Button>
    </Modal>
  );
};

export default ChangeAvatarModal;
