import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { SearchIcon } from '@/components/icons';
import { TX_FILTERS, type TxFilter } from './mockTransactions';

interface Props {
  query: string;
  onQuery: (value: string) => void;
  filter: TxFilter;
  onFilter: (filter: TxFilter) => void;
}

/**
 * The search box and category chips above the ledger.
 *
 * Both drive real state and both really filter — over the mock rows, in the
 * browser. When the endpoint exists they become query parameters instead; the
 * section already holds the values.
 *
 * The chips are the same pill the Statistic tab's range filter uses; the
 * search is that pill at the row's full height.
 */
const TransactionFilters: FC<Props> = ({ query, onQuery, filter, onFilter }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* `flex-1` rather than `w-full`: at the design's panel width the cap is
          what sets the field's size, but on a laptop's narrower panel `w-full`
          claimed the whole row and pushed the chips onto a second line. It
          shrinks now instead, down to a floor that still fits a search term. */}
      <label className="rl-chip flex h-12 min-w-50 flex-1 items-center gap-2.5 ps-3 pe-5 @panel:max-w-108.5">
        <SearchIcon size={24} strokeWidth={1.5} className="shrink-0 text-[#f0f1f5]" />
        <input
          type="search"
          value={query}
          placeholder={t('tx.search')}
          onChange={(e) => onQuery(e.target.value)}
          aria-label={t('tx.search')}
          className="min-w-0 flex-1 bg-transparent text-base leading-6 text-[#f0f1f5] outline-none placeholder:text-[#f0f1f5]"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2.75">
        {TX_FILTERS.map(({ key, labelKey }) => {
          const selected = key === filter;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onFilter(key)}
              aria-pressed={selected}
              className={`flex h-8 shrink-0 items-center justify-center rounded-full px-3.75 text-xs leading-5 whitespace-nowrap ${
                selected
                  ? 'rl-chip-active font-medium text-[#ffe779]'
                  : 'rl-chip font-normal text-[#9da2b4] hover:rl-chip-active hover:font-medium hover:text-[#ffe779]'
              }`}
            >
              {t(labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionFilters;
