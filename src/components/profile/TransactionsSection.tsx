import { useEffect, useState, useRef, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { useCurrencyConversion } from '@/context/CurrencyConversionContext';
import { SECTION_HEADING } from '@/components/profile/SectionShell';
import TransactionFilters from '@/components/profile/transactions/TransactionFilters';
import TransactionTable from '@/components/profile/transactions/TransactionTable';
import TablePager from '@/components/profile/transactions/TablePager';
import TransactionDetailModal from '@/components/profile/transactions/TransactionDetailModal';
import {
  PAGE_SIZE,
  queryTransactions,
  CURRENCY_SYMBOLS,
  type Transaction,
  type TxFilter,
} from '@/components/profile/transactions/mockTransactions';
import { analytics } from '@/services/analytics';

/**
 * The ledger.
 *
 * NOT WIRED — `queryTransactions` answers off an array in memory, and is the
 * one function to replace when a ledger endpoint exists. Everything this
 * section does around it is already what a request needs: the search, the
 * category and the page go out as parameters, and the pager counts pages from
 * the `total` that comes back rather than from the rows it is holding.
 *
 * The wallet summary this tab used to open with is gone: it was not in the
 * design, and the top bar's `BalanceMenu` carries the live balance on every
 * page, so nothing was stranded by dropping it.
 */
const TransactionsSection: FC = () => {
  const { t } = useTranslation();
  const { convertToDisplayCurrency } = useCurrencyConversion();
  const [inputQuery, setInputQuery] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<TxFilter>('all');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<readonly Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const debounceTimer = useRef<NodeJS.Timeout>();

  // Debounce search input (500ms delay)
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setQuery(inputQuery);
      setPage(1);
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [inputQuery]);

  // The closest thing to a cashier the app has today. Traffic here is the
  // baseline for the buy/redeem flows when they arrive.
  useEffect(() => {
    analytics.wallet.viewed();
  }, []);

  useEffect(() => {
    let live = true;
    setLoading(true);

    queryTransactions({ query, filter, page, pageSize: PAGE_SIZE }).then((result) => {
      // A slower answer to an older query must not overwrite a newer one.
      if (!live) return;

      // Re-convert amounts based on user's current display currency
      const convertedRows = result.rows.map((row) => {
        if (!row.amount_usd) {
          return row;
        }

        // Convert USD to user's current display currency using context
        const converted = convertToDisplayCurrency(row.amount_usd.toString(), 'USD');
        const symbol = CURRENCY_SYMBOLS[converted.currency] || converted.currency;

        // Format to 2 decimal places
        const formattedAmount = parseFloat(converted.displayAmount).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        // Recalculate effect with converted amount
        let newEffect = row.effect;
        // Check rejected/failed statuses FIRST before checking type
        if (row.status === 'WITHDRAW_REJECTED' || row.status === 'WITHDRAW_FAILED' || row.status === 'DEPOSIT_FAILED' || (row.tx_type === 'BET' && row.status === 'BET_LOST')) {
          newEffect = '0';
        } else if (row.status === 'TIP_SENT') {
          newEffect = `-${symbol}${formattedAmount}`;
        } else if (row.status === 'TIP_RECEIVED') {
          newEffect = `+${symbol}${formattedAmount}`;
        } else if (row.tx_type === 'BET' && row.status === 'BET_PLACED') {
          newEffect = `-${symbol}${formattedAmount}`;
        } else if ((row.tx_type === 'WIN' && row.status === 'BET_WON') || row.status === 'DEPOSIT_CONFIRMED') {
          newEffect = `+${symbol}${formattedAmount}`;
        } else if (row.tx_type === 'WITHDRAWAL') {
          newEffect = `-${symbol}${formattedAmount}`;
        }

        return {
          ...row,
          usd: `${symbol}${formattedAmount}`,
          effect: newEffect,
        };
      });

      setRows(convertedRows);
      setTotalPages(result.totalPages);
      setLoading(false);
    }).catch((error) => {
      console.error('Error fetching transactions:', error);
      if (live) {
        setRows([]);
        setTotalPages(0);
        setLoading(false);
      }
    });

    return () => {
      live = false;
    };
  }, [query, filter, page, convertToDisplayCurrency]);

  /** Any change to filter starts again at page one. */
  const resetPage =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      setPage(1);
    };

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  };

  return (
    <div>
      <h2 className={`${SECTION_HEADING} max-lg:hidden`}>{t('profile.transactions')}</h2>

      <div className="lg:mt-[calc(var(--u)*18)]">
        <TransactionFilters
          query={inputQuery}
          onQuery={setInputQuery}
          filter={filter}
          onFilter={resetPage(setFilter)}
        />
      </div>

      {/* Held at the table's height while a page is in flight, so the pager
          below does not jump up and back down on every keystroke. */}
      <div className={`mt-5 transition-opacity lg:mt-[calc(var(--u)*14)] ${loading ? 'opacity-60' : ''}`}>
        <TransactionTable rows={rows} onRowClick={handleRowClick} />
      </div>

      <div className="mt-[34px] lg:mt-[calc(var(--u)*33)]">
        <TablePager page={Math.min(page, totalPages)} totalPages={totalPages} onPage={setPage} />
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default TransactionsSection;
