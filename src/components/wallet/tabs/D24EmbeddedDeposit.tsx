import { useState, useEffect, useRef, type FC } from 'react';
import { toast } from 'react-toastify';
import api from '@/services/api';

export interface D24PaymentDetails {
  deposit_id: string;
  reference_id?: string;
  payment_method: string;
  currency: string;
  amount: string;
  checkout_type?: string;
  redirect_url?: string;
  payment_details: {
    type: 'QR_CODE' | 'BANK_TRANSFER' | 'CARD';
    qr_code?: string;
    qr_text?: string;
    pix_key?: string;
    account_holder?: string;
    account_number?: string;
    routing_number?: string;
    iban?: string;
    ifsc?: string;
    bank_code?: string;
    bank_name?: string;
    branch_code?: string;
    reference_id?: string;
  };
  instructions?: string[];
  processing_time?: string;
  fee_percent?: string;
}

interface Props {
  amount: string;
  currency: string;
  paymentMethod: string;
  payer: {
    document: string;
    document_type: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    birth_date?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zip_code?: string;
    };
  };
  onBack: () => void;
  onHostedCheckout?: (redirectUrl: string) => void;
}

/**
 * D24 Embedded Deposit Component
 *
 * Displays payment details for D24 deposits directly in the wallet UI.
 * Supports multiple payment methods:
 * - PIX: Shows QR code for instant payment (Brazil)
 * - WIRE/ACH/SEPA/NEFT: Shows bank account details
 * - CARD: Shows card payment form
 *
 * User completes payment in their own bank/app, not in D24's iframe.
 * Requires complete payer information to fetch embedded payment details from D24.
 */
const D24EmbeddedDeposit: FC<Props> = ({
  amount,
  currency,
  paymentMethod,
  payer,
  onBack,
  onHostedCheckout,
}) => {
  const [details, setDetails] = useState<D24PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasCalledHostedCheckout = useRef(false);
  const hasApiBeenCalled = useRef(false);

  // Fetch payment details on mount
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.post<D24PaymentDetails>(
          '/wallet/deposit/d24/embedded',
          {
            amount,
            currency,
            payment_method: paymentMethod,
            payer,
          }
        );

        if (!response.data) {
          throw new Error('Empty response from server');
        }

        setDetails(response.data);
        console.log('[D24EmbeddedDeposit] Payment details loaded successfully:', response.data);
      } catch (err: any) {
        console.error('[D24EmbeddedDeposit] Error loading payment details:', err);

        let errorMsg = 'Failed to load payment details';

        if (err?.response?.status === 400) {
          errorMsg = err?.response?.data?.message || 'Invalid payment request. Please check your information.';
        } else if (err?.response?.status === 401) {
          errorMsg = 'Authentication failed. Please log in again.';
        } else if (err?.response?.status === 503) {
          errorMsg = 'Payment service is temporarily unavailable. Please try again later.';
        } else if (err?.message?.includes('Network')) {
          errorMsg = 'Network connection error. Please check your internet connection.';
        } else if (err?.message?.includes('timeout')) {
          errorMsg = 'Request timed out. Please try again.';
        } else if (err?.response?.data?.message) {
          errorMsg = err.response.data.message;
        } else if (err?.message) {
          errorMsg = err.message;
        }

        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if payer has minimum required fields and API hasn't been called yet
    if (payer?.first_name && payer?.last_name && payer?.email && !hasApiBeenCalled.current) {
      hasApiBeenCalled.current = true;
      console.log('[D24EmbeddedDeposit] Calling API to fetch payment details');
      fetchDetails();
    } else if (!payer?.first_name || !payer?.last_name || !payer?.email) {
      setError('Missing required payer information');
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          className="w-8 h-8 animate-spin text-emerald-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-slate-400 text-sm">Loading payment details...</p>
      </div>
    );
  }

  if (error || !details) {
    const errorMessages: Record<string, string> = {
      'Field validation error': 'Some payment information is invalid. Please go back and check your details.',
      'Could not retrieve payment details': 'Failed to fetch payment details from payment provider. Please try again.',
      'Request method': 'Payment service error. Please contact support.',
      '400': 'Invalid payment request. Please verify your information.',
      '503': 'Payment service is temporarily unavailable. Please try again later.',
      'network': 'Network connection error. Please check your internet and try again.',
    };

    let displayError = error || 'Failed to load payment details';
    for (const [key, message] of Object.entries(errorMessages)) {
      if (error?.includes(key)) {
        displayError = message;
        break;
      }
    }

    return (
      <div className="space-y-4">
        <div className="bg-red-900/30 border border-red-600 p-4 rounded-lg">
          <p className="text-red-400 text-sm font-semibold mb-2">
            ❌ Payment Details Error
          </p>
          <p className="text-red-300 text-sm">
            {displayError}
          </p>
          {error && (
            <p className="text-red-200 text-xs mt-2 opacity-70">
              Details: {error}
            </p>
          )}
        </div>

        {/* Retry or go back options */}
        <div className="space-y-2">
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              // Re-fetch by remounting component via onBack
              setTimeout(() => onBack(), 100);
            }}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium"
          >
            🔄 Try Again
          </button>
          <button
            onClick={onBack}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition"
          >
            ← Go Back
          </button>
        </div>

        {/* Help text */}
        <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg">
          <p className="text-slate-400 text-xs">
            💡 If the problem persists:
          </p>
          <ul className="text-slate-400 text-xs mt-2 space-y-1 list-disc list-inside">
            <li>Check your internet connection</li>
            <li>Verify all information is correct</li>
            <li>Try again in a few moments</li>
            <li>Contact support if the issue continues</li>
          </ul>
        </div>
      </div>
    );
  }

  const pd = details.payment_details;

  // If D24 returned a HOSTED checkout with redirect_url, open it in full-screen modal
  if (details.checkout_type === 'HOSTED' && details.redirect_url) {
    console.log('[D24EmbeddedDeposit] Opening HOSTED checkout in modal:', details.redirect_url);

    // Trigger the parent component to open the full-screen modal (only once)
    if (onHostedCheckout && !hasCalledHostedCheckout.current) {
      console.log('[D24EmbeddedDeposit] Calling onHostedCheckout callback');
      hasCalledHostedCheckout.current = true;
      onHostedCheckout(details.redirect_url);
    }

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          className="w-8 h-8 animate-spin text-emerald-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-slate-400 text-sm">Opening D24 Checkout...</p>
      </div>
    );
  }

  // Validate payment details are complete
  if (!pd || !pd.type) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-900/30 border border-yellow-600 p-4 rounded-lg">
          <p className="text-yellow-300 text-sm font-semibold mb-2">
            ⚠️ Incomplete Payment Details
          </p>
          <p className="text-yellow-200 text-sm">
            The payment details are incomplete. Please try again.
          </p>
        </div>
        <button
          onClick={onBack}
          className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  // PIX / QR Code Payment
  if (pd.type === 'QR_CODE') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900/40 to-slate-800 p-4 rounded-lg border border-emerald-600/30">
          <p className="text-emerald-400 text-sm font-semibold mb-1">
            💚 {paymentMethod} Payment
          </p>
          <p className="text-slate-300 text-2xl font-bold">
            {amount} {currency}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Processing time: {details.processing_time}
          </p>
        </div>

        {/* QR Code */}
        {pd.qr_code && (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <img
                src={pd.qr_code}
                alt="Payment QR Code"
                className="w-56 h-56"
              />
            </div>
            <p className="text-slate-400 text-sm text-center">
              Scan this QR code with your bank app to pay instantly
            </p>
          </div>
        )}

        {/* PIX Key (Copy & Paste) */}
        {pd.pix_key && (
          <PixKeyCopy pixKey={pd.pix_key} />
        )}

        {/* Reference ID */}
        {details.reference_id && (
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-xs font-semibold mb-2">
              📌 Reference ID (include in payment if needed)
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-slate-900 px-3 py-2 rounded text-slate-100 text-sm font-mono break-all">
                {details.reference_id}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(details.reference_id || '');
                  toast.success('Reference ID copied!');
                }}
                className="flex-shrink-0 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded font-medium transition"
                title="Copy Reference ID"
              >
                📋
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {details.instructions && details.instructions.length > 0 && (
          <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg">
            <p className="text-slate-300 font-semibold text-sm">
              📋 How to Pay:
            </p>
            <ol className="space-y-2">
              {details.instructions.map((step, i) => (
                <li
                  key={i}
                  className="text-slate-400 text-sm flex gap-3"
                >
                  <span className="text-emerald-400 font-semibold flex-shrink-0">
                    {i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Fee Notice */}
        {details.fee_percent && (
          <div className="bg-yellow-900/30 border border-yellow-600 p-3 rounded-lg">
            <p className="text-yellow-200 text-sm">
              💳 Fee: {details.fee_percent}% of amount
            </p>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition text-sm font-medium"
        >
          ← Back
        </button>
      </div>
    );
  }

  // Bank Transfer Payment
  if (pd.type === 'BANK_TRANSFER') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/40 to-slate-800 p-4 rounded-lg border border-blue-600/30">
          <p className="text-blue-400 text-sm font-semibold mb-1">
            🏦 {paymentMethod} Transfer
          </p>
          <p className="text-slate-300 text-2xl font-bold">
            {amount} {currency}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Processing time: {details.processing_time}
          </p>
        </div>

        {/* Bank Details */}
        <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <p className="text-slate-300 font-semibold text-sm mb-4">
            Bank Account Details
          </p>

          {pd.bank_name && (
            <DetailRow
              label="Bank Name"
              value={pd.bank_name}
              copyable={true}
            />
          )}

          {pd.account_holder && (
            <DetailRow
              label="Account Holder"
              value={pd.account_holder}
              copyable={true}
            />
          )}

          {pd.iban && (
            <DetailRow
              label="IBAN"
              value={pd.iban}
              copyable={true}
            />
          )}

          {pd.account_number && (
            <DetailRow
              label="Account Number"
              value={pd.account_number}
              copyable={true}
            />
          )}

          {pd.routing_number && (
            <DetailRow
              label="Routing Number (ACH)"
              value={pd.routing_number}
              copyable={true}
            />
          )}

          {pd.ifsc && (
            <DetailRow
              label="IFSC Code"
              value={pd.ifsc}
              copyable={true}
            />
          )}

          {pd.bank_code && (
            <DetailRow
              label="Bank Code"
              value={pd.bank_code}
              copyable={true}
            />
          )}

          {pd.branch_code && (
            <DetailRow
              label="Branch Code"
              value={pd.branch_code}
              copyable={true}
            />
          )}

          {pd.reference_id && (
            <DetailRow
              label="Reference / Payment ID"
              value={pd.reference_id}
              copyable={true}
              important={true}
            />
          )}
        </div>

        {/* Instructions */}
        {details.instructions && details.instructions.length > 0 && (
          <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg">
            <p className="text-slate-300 font-semibold text-sm">
              📋 How to Pay:
            </p>
            <ol className="space-y-2">
              {details.instructions.map((step, i) => (
                <li
                  key={i}
                  className="text-slate-400 text-sm flex gap-3"
                >
                  <span className="text-blue-400 font-semibold flex-shrink-0">
                    {i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Important Notes */}
        <div className="bg-blue-900/30 border border-blue-600 p-3 rounded-lg space-y-2">
          <p className="text-blue-300 text-xs font-semibold">📌 Important:</p>
          <ul className="space-y-1 text-blue-200 text-xs">
            <li>• Always include the reference ID in your payment</li>
            <li>• Your deposit will be credited once payment is confirmed</li>
            <li>• Processing time depends on your bank</li>
          </ul>
        </div>

        {/* Fee Notice */}
        {details.fee_percent && (
          <div className="bg-yellow-900/30 border border-yellow-600 p-3 rounded-lg">
            <p className="text-yellow-200 text-sm">
              💳 Fee: {details.fee_percent}% of amount
            </p>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition text-sm font-medium"
        >
          ← Back
        </button>
      </div>
    );
  }

  // Unknown / Unsupported Payment Method
  return (
    <div className="space-y-4">
      <div className="bg-yellow-900/30 border border-yellow-600 p-4 rounded-lg">
        <p className="text-yellow-300 text-sm">
          ⚠️ Payment method '{paymentMethod}' is not yet supported for embedded checkout.
        </p>
      </div>
      <button
        onClick={onBack}
        className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition text-sm font-medium"
      >
        ← Go Back
      </button>
    </div>
  );
};

/**
 * Copy-to-Clipboard Component for PIX Key
 */
const PixKeyCopy: FC<{ pixKey: string }> = ({ pixKey }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <p className="text-slate-400 text-sm">Or copy this PIX key:</p>
      <div
        onClick={handleCopy}
        className="bg-slate-700 hover:bg-slate-600 p-4 rounded-lg cursor-pointer transition border border-slate-600 hover:border-slate-500"
      >
        <code className="text-emerald-400 break-all text-xs font-mono">
          {pixKey}
        </code>
      </div>
      {copied && (
        <p className="text-emerald-400 text-sm font-medium text-center">
          ✓ Copied to clipboard!
        </p>
      )}
      <p className="text-slate-500 text-xs">
        Click to copy, then paste in your bank app
      </p>
    </div>
  );
};

/**
 * Helper Component for Displaying Bank Details with Copy Functionality
 */
interface DetailRowProps {
  label: string;
  value: string;
  copyable?: boolean;
  important?: boolean;
}

const DetailRow: FC<DetailRowProps> = ({
  label,
  value,
  copyable = false,
  important = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1">
      <label className="text-slate-400 text-xs uppercase tracking-wide font-semibold">
        {label}
      </label>
      {copyable ? (
        <div
          onClick={handleCopy}
          className={`p-3 rounded cursor-pointer transition border ${
            important
              ? 'bg-emerald-900/30 border-emerald-500/50 hover:bg-emerald-900/50'
              : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500'
          }`}
        >
          <code
            className={`text-xs font-mono break-all ${
              important ? 'text-emerald-400' : 'text-slate-200'
            }`}
          >
            {value}
          </code>
          {copied && (
            <p className={`text-xs mt-1 ${important ? 'text-emerald-300' : 'text-slate-300'}`}>
              ✓ Copied
            </p>
          )}
        </div>
      ) : (
        <p className="text-slate-200 text-sm">{value}</p>
      )}
    </div>
  );
};

export default D24EmbeddedDeposit;
