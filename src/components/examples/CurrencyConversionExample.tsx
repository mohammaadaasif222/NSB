/**
 * Example: How to use CurrencyConversionContext
 *
 * This file shows the correct patterns for using the CurrencyConversionContext
 * to display amounts in the user's display currency using snapshot rates.
 */

import { useCurrencyConversion } from '@/context/CurrencyConversionContext';

/**
 * Example 1: Display a transaction amount
 */
export function TransactionDisplay() {
  const { formatCurrencyDisplay } = useCurrencyConversion();

  // Backend sends transaction amount in USD
  const transactionAmountUSD = '150.50';

  // Automatically converts to display currency and formats with symbol
  // If user's display currency is EUR with snapshot rate 0.92:
  // 150.50 ÷ 0.92 = 163.59 EUR
  // Displays as: "€ 163.59"
  const formatted = formatCurrencyDisplay(transactionAmountUSD);

  return (
    <div>
      <p>Transaction: {formatted}</p>
    </div>
  );
}

/**
 * Example 2: Convert amount with metadata
 */
export function ConversionWithMetadata() {
  const { convertToDisplayCurrency } = useCurrencyConversion();

  // Backend returns deposit information
  const depositAmount = '100.00'; // in USD
  const depositCurrency = 'USD';

  const conversion = convertToDisplayCurrency(depositAmount, depositCurrency);

  return (
    <div>
      <div>
        <strong>Deposit Received:</strong>
        <p>{conversion.displayAmount} {conversion.currency}</p>
        <small>Rate used: {conversion.rate} (snapshot)</small>
      </div>
    </div>
  );
}

/**
 * Example 3: Display transaction history
 */
export function TransactionHistoryExample() {
  const { formatCurrencyDisplay } = useCurrencyConversion();

  // Mock transaction data from backend (all in USD)
  const transactions = [
    { id: 1, amountUSD: '50.00', type: 'deposit', date: '2026-09-28' },
    { id: 2, amountUSD: '25.50', type: 'withdrawal', date: '2026-09-27' },
    { id: 3, amountUSD: '100.25', type: 'deposit', date: '2026-09-26' },
  ];

  return (
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Amount</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => {
          return (
            <tr key={tx.id}>
              <td>{tx.type}</td>
              <td>{formatCurrencyDisplay(tx.amountUSD)}</td>
              <td>{tx.date}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/**
 * Example 4: Display balance with snapshot rate info
 */
export function BalanceWithRateInfo() {
  const { convertToDisplayCurrency, getSnapshotRate } = useCurrencyConversion();

  const balanceUSD = '1234.56';

  const conversion = convertToDisplayCurrency(balanceUSD, 'USD');
  const displayRate = getSnapshotRate('EUR');

  return (
    <div className="balance-card">
      <h3>Your Balance</h3>
      <div className="amount">
        {conversion.displayAmount} {conversion.currency}
      </div>
      <div className="rate-info">
        <small>
          {conversion.currency} snapshot rate (to USD): {displayRate}
        </small>
      </div>
    </div>
  );
}

/**
 * Example 5: Handle conversion errors gracefully
 */
export function ConversionWithFallback() {
  const { convertToDisplayCurrency, formatCurrencyDisplay } = useCurrencyConversion();

  const amount = '500.00';
  const currency = 'USD';

  try {
    const result = convertToDisplayCurrency(amount, currency);

    // Check if conversion was actually applied
    if (!result.converted) {
      // Amount is already in display currency
      return <div>Balance: {formatCurrencyDisplay(amount)}</div>;
    }

    // Conversion was applied
    return (
      <div>
        <div>Balance: {formatCurrencyDisplay(amount)}</div>
        <small>Converted using snapshot rate {result.rate}</small>
      </div>
    );
  } catch (error) {
    console.error('Conversion error:', error);
    // Fallback: show original amount
    return <div>Balance: {amount}</div>;
  }
}
