// @ts-nocheck
// Ported verbatim from Win-Win-user/src/pages/Originals/components/HotKeyModel.jsx.
// Keep as-is for easy diffs; new originals code should be strict TSX.
import { useEffect } from 'react';
import { X, Keyboard, Info } from 'lucide-react';

function HotkeyModal({
  showHotkeyModal,
  setShowHotkeyModal,
  setHotkeysEnabled,
  hotkeysEnabled,
  HOtKeys,
  isAnyModalOpen,
  setIsAnyModalOpen,
}) {
  useEffect(() => {
    if (showHotkeyModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showHotkeyModal]);

  if (!showHotkeyModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] ">
      <div
        className="bg-gradient-to-b from-[#1f1e44] via-[#19183a] to-[#13122b] rounded-2xl w-full max-w-2xl relative no-scrollbar overflow-y-auto max-h-[70vh] border border-white/5"
        style={{
          boxShadow:
            '0 20px 40px rgba(0,0,0,0.55), 0 10px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="flex bg-gradient-to-b from-[#1f1e44] to-[#19183a] items-center sticky top-0 z-10 py-3 px-4 justify-between"
          style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.35), inset 0 -1px 0 rgba(0,0,0,0.4)' }}
        >
          <div className="flex items-center space-x-3">
            <Keyboard className="w-6 h-6 text-white" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.55))' }} />
            <h4 className="text-xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.45)' }}>
              Hotkey Settings
            </h4>
          </div>
          <button
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => {
              setShowHotkeyModal(false);
              setIsAnyModalOpen(!isAnyModalOpen);
            }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 px-6 pt-3 bg-transparent">
          <div
            className="bg-[#090c1d] rounded-xl p-2 text-justify space-y-3 text-gray-300 text-sm flex items-start border border-black/30"
            style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.55), 0 6px 14px rgba(0,0,0,0.35)' }}
          >
            <Info className="w-10 h-10 text-white mr-3 mt-0.5" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }} />
            <p>
              When the hotkeys are enabled. they will remain on for all games until disabled. Despite some games sharing
              similar key binds. it's always advised to confirm what key interactions are set for each game.
            </p>
          </div>
          <div
            className="bg-[#090c1d] rounded-xl px-5 py-4 text-justify space-y-3 text-gray-300 text-sm border border-black/30"
            style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.55), 0 6px 14px rgba(0,0,0,0.35)' }}
          >
            {HOtKeys &&
              HOtKeys.map((item, index) => (
                <div key={index} className="flex justify-between align-middle items-center">
                  <p>{item?.name}</p>
                  <p
                    className="px-3 py-1 rounded-md text-white font-mono font-semibold"
                    style={{
                      background: 'linear-gradient(180deg, #2a2956 0%, #19183a 60%, #11102a 100%)',
                      boxShadow:
                        '0 3px 6px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.5)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    }}
                  >
                    {item?.value}
                  </p>
                </div>
              ))}
          </div>

          <div className="flex justify-center sticky w-full py-3 bottom-0 space-x-4 bg-gradient-to-t from-[#13122b] to-transparent">
            <button
              style={{
                background: 'linear-gradient(180deg, #232251 0%, #19183a 100%)',
                boxShadow:
                  '0 3px 6px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -2px 0 rgba(0,0,0,0.35)',
              }}
              className="text-white px-6 py-2 rounded-lg font-medium transition-all hover:-translate-y-[1px] active:translate-y-[1px] border border-black/40"
              onClick={() => {
                setShowHotkeyModal(false);
                setIsAnyModalOpen(!isAnyModalOpen);
              }}
            >
              Cancel
            </button>

            {hotkeysEnabled ? (
              <button
                style={{
                  background: 'linear-gradient(180deg, #f87171 0%, #ef4444 50%, #c92e2e 100%)',
                  boxShadow:
                    '0 6px 12px rgba(239,68,68,0.35), 0 2px 4px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -3px 0 rgba(0,0,0,0.25)',
                }}
                className="text-white px-6 py-2 rounded-lg font-semibold transition-all hover:-translate-y-[1px] active:translate-y-[1px]"
                onClick={() => {
                  setHotkeysEnabled(false);
                  setShowHotkeyModal(false);
                  setIsAnyModalOpen(!isAnyModalOpen);
                }}
              >
                Disable
              </button>
            ) : (
              <button
                style={{
                  background: 'linear-gradient(180deg, #3CB6F0 0%, #29A3E0 50%, #1F8FCA 100%)',
                  boxShadow:
                    '0 6px 12px rgba(41,163,224,0.35), 0 2px 4px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -3px 0 rgba(0,0,0,0.25)',
                }}
                className="text-white px-6 py-2 rounded-lg font-semibold transition-all hover:-translate-y-[1px] active:translate-y-[1px]"
                onClick={() => {
                  setHotkeysEnabled(true);
                  setShowHotkeyModal(false);
                  setIsAnyModalOpen(!isAnyModalOpen);
                }}
              >
                Enable
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotkeyModal;
