import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import apiService from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
  bootIntercom,
  configureIntercom,
  holdForIdentity,
  isIntercomConfigured,
  releaseIdentity,
  shutdownIntercom,
  showIntercom,
} from '@/services/intercom';
import type { IntercomIdentityResponse, SupportChatSettings } from '@/types';

interface SupportChatContextType {
  /** Show the Intercom launcher. Off unless an operator switched it on AND the
   *  API reported an App ID — a bubble wired to nothing is worse than none. */
  intercomEnabled: boolean;
  /** Show the platform's own chat panel in the top bar. */
  internalChatEnabled: boolean;
  chatAmbienceEnabled: boolean;
  chatRegionalRoomsEnabled: boolean;
  /** True once the settings call has answered, either way. Exposed for callers
   *  that want to wait for the real answer rather than act on the default. */
  ready: boolean;
  /** Open the Intercom messenger, loading it on demand. */
  openIntercom: () => void;
}

const SupportChatContext = createContext<SupportChatContextType | undefined>(undefined);

/**
 * What to assume before the settings call answers, and if it never does.
 *
 * These mirror the API's CONFIG_DEFAULTS, and mirroring them is the point: the
 * default configuration then never flickers. The built-in panel is on today, so
 * it renders immediately rather than appearing a beat late; Intercom is off, so
 * its bubble never flashes up only to be taken away.
 */
const INTERCOM_DEFAULT = false;
const INTERNAL_CHAT_DEFAULT = true;

/**
 * Which support entry points to show, and keeping Intercom in step with the
 * session.
 *
 * The two launchers are independent switches in System config (Support →
 * Intercom live chat / Built-in chat panel), so an operator can run either,
 * both, or neither without a deploy.
 *
 * Intercom is booted for signed-out visitors too — someone with a question
 * before they register is exactly who support wants to reach. They boot
 * anonymously; only a signed-in player gets the verified identity.
 */
export const SupportChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { token, hydrated } = useAuth();

  const [settings, setSettings] = useState<SupportChatSettings | null>(null);
  const [ready, setReady] = useState(false);

  /* --- which launchers are switched on ---------------------------------- */
  useEffect(() => {
    let cancelled = false;

    void apiService
      .get<SupportChatSettings>('/intercom/settings')
      .then((res) => {
        if (cancelled || !res?.success || !res.data) return;
        // Before setSettings, so the App ID is in place by the time anything
        // re-renders and asks whether Intercom is configured.
        configureIntercom(res.data.intercom_app_id);
        setSettings(res.data);
      })
      // A failed settings call falls back to the defaults above rather than
      // breaking the header. The player app must not depend on this endpoint
      // to render.
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const intercomEnabled =
    (settings?.intercom_chat_enabled ?? INTERCOM_DEFAULT) && isIntercomConfigured();

  /* --- keep the messenger in step with the session ----------------------- */
  useEffect(() => {
    // Waiting for hydration matters: booting before the stored token is read
    // would identify a returning player as an anonymous visitor for a frame,
    // and Intercom would start a guest conversation under their nose.
    if (!hydrated || !intercomEnabled) return;

    if (!token) {
      shutdownIntercom();
      return;
    }

    let cancelled = false;

    // Set before the request goes out, so a player who clicks support in the
    // meantime waits for their verified identity instead of starting an
    // anonymous conversation.
    holdForIdentity();

    void apiService
      .get<IntercomIdentityResponse>('/intercom/identity')
      .then((res) => {
        if (cancelled || !res?.success || !res.data) return;
        bootIntercom({
          attributes: res.data.attributes,
          token: res.data.token || undefined,
        });
      })
      // Identity is fetched, not returned from sign-in, so it can fail on its
      // own. Falling back to an anonymous boot keeps chat working: support then
      // sees an unidentified visitor instead of nothing at all.
      .catch(() => {
        if (!cancelled) bootIntercom(null);
      })
      .finally(() => {
        releaseIdentity();
      });

    return () => {
      cancelled = true;
      // Never leave the gate closed behind an abandoned request.
      releaseIdentity();
    };
  }, [hydrated, token, intercomEnabled]);

  const openIntercom = useCallback(() => {
    void showIntercom();
  }, []);

  const value = useMemo<SupportChatContextType>(
    () => ({
      intercomEnabled,
      internalChatEnabled: settings?.internal_chat_enabled ?? INTERNAL_CHAT_DEFAULT,
      chatAmbienceEnabled: settings?.chat_ambience_enabled ?? false,
      chatRegionalRoomsEnabled: settings?.chat_regional_rooms_enabled ?? false,
      ready,
      openIntercom,
    }),
    [
      intercomEnabled,
      settings?.internal_chat_enabled,
      settings?.chat_ambience_enabled,
      settings?.chat_regional_rooms_enabled,
      ready,
      openIntercom,
    ]
  );

  return <SupportChatContext.Provider value={value}>{children}</SupportChatContext.Provider>;
};

export const useSupportChat = (): SupportChatContextType => {
  const context = useContext(SupportChatContext);
  if (!context) {
    throw new Error('useSupportChat must be used within SupportChatProvider');
  }
  return context;
};
