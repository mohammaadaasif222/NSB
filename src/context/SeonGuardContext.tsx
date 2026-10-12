import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import SeonStepUpModal from '@/components/modals/SeonStepUpModal';
import {
  SeonStepUpCancelledError,
  extractChallenge,
  isStepUpRequired,
  stepUpHeaders,
  type SeonStepUpChallenge,
} from '@/lib/seon-guard';
import { translate } from '@/i18n/translate';

/**
 * A request that may need a one-time code part-way through.
 *
 * `headers` is empty on the first attempt and carries the step-up headers on
 * the retry — so a call site opts in by spreading it into its axios config and
 * changes nothing else.
 */
export type GuardedRequest<T> = (headers: Record<string, string>) => Promise<T>;

interface SeonGuardContextValue {
  /**
   * Run a request, handling a fraud step-up if one is demanded.
   *
   * Resolves with the result once the request succeeds — first time, or after
   * the player enters a valid code. Rejects with the original error if it was
   * not a step-up, or with SeonStepUpCancelledError if they closed the prompt.
   */
  run: <T>(request: GuardedRequest<T>) => Promise<T>;
}

const SeonGuardContext = createContext<SeonGuardContextValue | undefined>(undefined);

const NO_HEADERS: Record<string, string> = {};

/**
 * Owns the single step-up prompt for the whole app.
 *
 * ── Why a provider and not a hook per caller ────────────────────────────
 * The prompt has to be MODAL over whatever the player was doing, and only one
 * can be open at a time. A hook returning its own modal element would mean
 * every call site remembering to render it — and any that forgot would fail
 * silently on a 428, which is the worst possible place for a silent failure.
 *
 * ── The retry is byte-identical ─────────────────────────────────────────
 * The same `request` function is invoked again with two extra headers. The
 * body is not rebuilt, so a withdrawal cannot change amount or destination
 * between the challenge and its clearance.
 */
export const SeonGuardProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [challenge, setChallenge] = useState<SeonStepUpChallenge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /**
   * How the modal hands its answer back to the awaiting `run()` call.
   *
   * A ref rather than state because it must not trigger a render, and because
   * `run` is suspended on this promise while the player types.
   */
  const resolverRef = useRef<{
    submit: (otp: string) => void;
    cancel: () => void;
  } | null>(null);

  const closeModal = useCallback((): void => {
    setChallenge(null);
    setError(null);
    setSubmitting(false);
    resolverRef.current = null;
  }, []);

  /** Show the prompt and wait for a code, or for the player to give up. */
  const askForCode = useCallback(
    (next: SeonStepUpChallenge): Promise<string> =>
      new Promise<string>((resolve, reject) => {
        setChallenge(next);
        setSubmitting(false);
        resolverRef.current = {
          submit: (otp) => resolve(otp),
          cancel: () => reject(new SeonStepUpCancelledError()),
        };
      }),
    []
  );

  const run = useCallback(
    async <T,>(request: GuardedRequest<T>): Promise<T> => {
      try {
        return await request(NO_HEADERS);
      } catch (firstError) {
        if (!isStepUpRequired(firstError)) throw firstError;

        let current = extractChallenge(firstError, translate('misc.seon.confirmDefault'));
        if (!current) throw firstError;

        // Loop so a wrong code re-prompts rather than failing the whole
        // action. The server enforces the real attempt budget and burns the
        // challenge when it is spent — at which point the error below is no
        // longer a step-up and this exits.
        for (;;) {
          setError(null);
          let otp: string;
          try {
            otp = await askForCode(current);
          } catch (cancelled) {
            closeModal();
            throw cancelled;
          }

          setSubmitting(true);
          try {
            const result = await request(stepUpHeaders(current.stepUpToken, otp));
            closeModal();
            return result;
          } catch (retryError) {
            // A fresh challenge means the server issued a new code (the old
            // one was burned) — carry on with that instead of the stale token.
            const reissued = extractChallenge(retryError, translate('misc.seon.confirmDefault'));
            if (reissued) {
              current = reissued;
              setError(translate('misc.seon.codeReissued'));
              setSubmitting(false);
              continue;
            }

            const message = (retryError as { message?: string })?.message ?? '';
            // 401 from the verifier means the code was wrong, expired or
            // already used. Every one of those reads the same to the player
            // on purpose — guessing must not reveal which.
            if (/invalid or has expired/i.test(message)) {
              setError(translate('misc.seon.codeInvalid'));
              setSubmitting(false);
              continue;
            }

            closeModal();
            throw retryError;
          }
        }
      }
    },
    [askForCode, closeModal]
  );

  const value = useMemo<SeonGuardContextValue>(() => ({ run }), [run]);

  return (
    <SeonGuardContext.Provider value={value}>
      {children}
      {challenge && (
        <SeonStepUpModal
          challenge={challenge}
          error={error}
          submitting={submitting}
          onSubmit={(otp) => resolverRef.current?.submit(otp)}
          onCancel={() => resolverRef.current?.cancel()}
        />
      )}
    </SeonGuardContext.Provider>
  );
};

/**
 * Access the step-up runner.
 *
 * Falls back to running the request unguarded when no provider is mounted, so
 * a component rendered outside the tree (a test, a storybook) still works — it
 * simply gets the raw 428 instead of a prompt.
 */
export const useSeonGuard = (): SeonGuardContextValue => {
  const ctx = useContext(SeonGuardContext);
  if (ctx) return ctx;
  return { run: (request) => request(NO_HEADERS) };
};
