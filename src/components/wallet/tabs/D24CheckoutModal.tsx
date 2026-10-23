import { type FC } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  redirectUrl: string;
  onClose: () => void;
}

/**
 * D24 Checkout Modal
 * Renders D24's hosted checkout in a full-screen modal overlay
 * Similar to how Changelly displays their checkout
 */
const D24CheckoutModal: FC<Props> = ({ redirectUrl, onClose }) => {
  return createPortal(
    <>
      {/* Full Screen Backdrop - Click to close */}
      <div
        className="fixed inset-0 z-[9998] bg-black/80 cursor-pointer"
        onClick={() => {
          console.log('[D24CheckoutModal] Backdrop clicked');
          onClose();
        }}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
        <div
          className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
          style={{ height: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button - Positioned above iframe */}
          <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button
              onClick={() => {
                console.log('[D24CheckoutModal] Close button clicked');
                onClose();
              }}
              className="p-2 bg-[#1b1f29] hover:bg-[#252937] text-[#f0f1f5] rounded-full transition cursor-pointer"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* D24 Iframe - Full Height */}
          <iframe
            src={redirectUrl}
            title="D24 Payment Checkout"
            className="w-full h-full"
            sandbox="allow-same-origin allow-forms allow-popups allow-scripts"
          />
        </div>
      </div>
    </>,
    document.body
  );
};

export default D24CheckoutModal;
