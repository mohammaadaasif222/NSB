import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import CurrencyMark from '../shared/CurrencyMark';

export interface WalletAsset {
  /** The currency's code — USDT, BTC. */
  code: string;
  /** Its name — Tether, Bitcoin; the code again when the catalogue has none. */
  name: string;
  /** The holding in the asset itself — "1,550.00 USDT". */
  amount: string;
  /** What it is worth in the display currency — "~$1,550.00". */
  worth: string;
}

/**
 * One holding, as the design's My Assets rows: the coin's badge, its name over
 * its code, and the amount over its worth on the end edge.
 */
export const AssetRow: FC<{ asset: WalletAsset }> = ({ asset }) => (
  <li className="flex h-[82px] bg-white/5 items-center gap-4 rounded-[24px] px-4 lg:h-[calc(var(--u)*82)] lg:gap-[calc(var(--u)*16)] lg:rounded-[calc(var(--u)*24)] lg:px-[calc(var(--u)*16)]">
    <CurrencyMark
      kind="coin"
      code={asset.code}
      className="h-10 w-10 text-[16px] lg:h-[calc(var(--u)*40)] lg:w-[calc(var(--u)*40)]"
    />
    <div className="min-w-0 flex-1 text-[18px] leading-7 lg:text-[length:max(11px,calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)]">
      <p className="truncate text-[#f0f1f5]">{asset.name}</p>
      <p className="mt-0.5 truncate text-[#9da2b4] lg:mt-[calc(var(--u)*2)]">{asset.code}</p>
    </div>
    <div className="shrink-0 text-end text-[18px] leading-7 tabular-nums lg:text-[length:max(11px,calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)]">
      <p className="text-[#f0f1f5]">{asset.amount}</p>
      <p className="mt-0.5 text-[#9da2b4] lg:mt-[calc(var(--u)*2)]">{asset.worth}</p>
    </div>
  </li>
);

/**
 * The wallet page's My Assets card: a row per holding, under the design's
 * 18px title.
 */
const WalletAssets: FC<{ assets: readonly WalletAsset[]; loading?: boolean }> = ({
  assets,
  loading = false,
}) => {
  const { t } = useTranslation();

  return (
    <section className="rl-panel px-[13px] pb-[34px] pt-[25px] [--panel-fill:rgba(0,0,0,0.2)] lg:px-[calc(var(--u)*31)] lg:pb-[calc(var(--u)*34)] lg:pt-[calc(var(--u)*25)]">
      <h2 className="text-[18px] font-normal leading-7 text-[#f0f1f5] lg:text-[length:max(11px,calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)]">
        {t('wallet.assets')}
      </h2>

      {assets.length > 0 ? (
        <ul className="mt-3 space-y-3 lg:mt-[calc(var(--u)*12)] lg:space-y-[calc(var(--u)*12)]">
          {assets.map((a) => (
            <AssetRow key={a.code} asset={a} />
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[14px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*12)]">
          {loading ? t('common.loading') : t('wallet.noAssets')}
        </p>
      )}
    </section>
  );
};

export default WalletAssets;
