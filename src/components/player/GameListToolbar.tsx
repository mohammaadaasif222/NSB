import { useEffect, useState, type FC } from 'react';
import { Dropdown, Option, SearchField } from '@/components/player/BrowseControls';
import { useTranslation } from '@/context/I18nContext';
import { MIN_SEARCH_LENGTH } from '@/services/catalogue';
import type { ShelfListQuery } from '@/constants/games';
import type { TranslationKey } from '@/i18n/locales';
import sortIcon from '@/assets/lobby/player/tool-sort.svg';
import providerIcon from '@/assets/lobby/player/tool-provider.svg';

export type Sort = NonNullable<ShelfListQuery['sort']>;
export const SORTS: readonly Sort[] = ['popular', 'trending', 'new', 'rtp', 'az', 'za'];
const SORT_LABEL: Record<Sort, TranslationKey> = {
  popular: 'allGames.sort.popular',
  trending: 'allGames.sort.trending',
  new: 'allGames.sort.new',
  rtp: 'allGames.sort.rtp',
  az: 'allGames.sort.az',
  za: 'allGames.sort.za',
};

const SEARCH_DELAY_MS = 400;

export interface ToolbarValues {
  q: string;
  /** '' is the shelf's own order, offered only where `defaultSort` is set. */
  sort: Sort | '';
  provider: string;
}

interface Props extends ToolbarValues {
  providers: readonly string[];
  /** Offer "Default order" in Sort: the page has an order of its own to go back to. */
  defaultSort?: boolean;
  onChange: (next: Partial<ToolbarValues>) => void;
}

/**
 * The casino browser's toolbar for a game list: search, sort and studio.
 *
 * It holds nothing of the filters itself. The page owns them (in its URL) and
 * is told what changed; the box only keeps what is being typed, follows the
 * URL when it changes (back button, Clear all) and searches once typing pauses.
 */
const GameListToolbar: FC<Props> = ({
  q,
  sort,
  provider,
  providers,
  defaultSort = false,
  onChange,
}) => {
  const { t } = useTranslation();
  const [term, setTerm] = useState(q);

  useEffect(() => setTerm(q), [q]);
  useEffect(() => {
    const wanted = term.trim().length >= MIN_SEARCH_LENGTH ? term.trim() : '';
    if (wanted === q) return undefined;
    const timer = setTimeout(() => onChange({ q: wanted }), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
    // `onChange` reads the page's current filters; re-running on it would re-arm the timer for nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  return (
    <div className="flex flex-col gap-[14px] lg:flex-row lg:gap-[calc(var(--u)*20)]">
      <SearchField
        value={term}
        onChange={setTerm}
        placeholder={t('search.placeholder')}
        label={t('search.title')}
      />
      <div className="grid grid-cols-2 gap-[7px] lg:flex lg:gap-[calc(var(--u)*10)]">
        <Dropdown
          icon={sortIcon}
          label={sort ? t(SORT_LABEL[sort]) : t('browse.sort')}
          active={defaultSort && !!sort}
        >
          {(close) => (
            <>
              {defaultSort && (
                <Option
                  selected={!sort}
                  onSelect={() => {
                    close();
                    onChange({ sort: '' });
                  }}
                >
                  {t('browse.sortDefault')}
                </Option>
              )}
              {SORTS.map((value) => (
                <Option
                  key={value}
                  selected={sort === value}
                  onSelect={() => {
                    close();
                    onChange({ sort: value });
                  }}
                >
                  {t(SORT_LABEL[value])}
                </Option>
              ))}
            </>
          )}
        </Dropdown>
        {/* One studio is no choice: Live Casino, say, has only Evolution. */}
        {(providers.length > 1 || provider) && (
          <Dropdown
            icon={providerIcon}
            label={provider || t('browse.provider')}
            active={!!provider}
          >
            {(close) => (
              <>
                <Option
                  selected={!provider}
                  onSelect={() => {
                    close();
                    onChange({ provider: '' });
                  }}
                >
                  {t('browse.allProviders')}
                </Option>
                {providers.map((name) => (
                  <Option
                    key={name}
                    selected={provider === name}
                    onSelect={() => {
                      close();
                      onChange({ provider: name });
                    }}
                  >
                    {name}
                  </Option>
                ))}
              </>
            )}
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default GameListToolbar;
