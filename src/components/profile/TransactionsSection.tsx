import { useEffect, useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { SECTION_HEADING } from '@/components/profile/SectionShell';
import TransactionFilters from '@/components/profile/transactions/TransactionFilters';
import TransactionTable from '@/components/profile/transactions/TransactionTable';
import TablePager from '@/components/profile/transactions/TablePager';
import {
  PAGE_SIZE,
  queryTransactions,
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
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<TxFilter>('all');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<readonly Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

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
      setRows(result.rows);
      setTotal(result.total);
      setLoading(false);
    }).catch((error) => {
      console.error('Error fetching transactions:', error);
      if (live) {
        setRows([]);
        setTotal(0);
        setLoading(false);
      }
    });

    return () => {
      live = false;
    };
  }, [query, filter, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /** Any change to what is being asked for starts again at page one. */
  const reset =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      setPage(1);
    };

  return (
    <div>
      <h2 className={SECTION_HEADING}>{t('profile.transactions')}</h2>

      <div className="mt-[calc(var(--u)*18)]">
        <TransactionFilters
          query={query}
          onQuery={reset(setQuery)}
          filter={filter}
          onFilter={reset(setFilter)}
        />
      </div>

      {/* Held at the table's height while a page is in flight, so the pager
          below does not jump up and back down on every keystroke. */}
      <div className={`mt-[calc(var(--u)*14)] transition-opacity ${loading ? 'opacity-60' : ''}`}>
        <TransactionTable rows={rows} />
      </div>

      <div className="mt-[calc(var(--u)*33)]">
        <TablePager page={Math.min(page, totalPages)} totalPages={totalPages} onPage={setPage} />
      </div>
    </div>
  );
};

export default TransactionsSection;
