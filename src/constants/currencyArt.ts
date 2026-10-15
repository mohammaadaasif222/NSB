import type { StaticImageData } from 'next/image';
import aedFlag from '@/assets/wallet/flags/aed.webp';
import arsFlag from '@/assets/wallet/flags/ars.webp';
import audFlag from '@/assets/wallet/flags/aud.webp';
import brlFlag from '@/assets/wallet/flags/brl.webp';
import cadFlag from '@/assets/wallet/flags/cad.webp';
import chfFlag from '@/assets/wallet/flags/chf.webp';
import cnyFlag from '@/assets/wallet/flags/cny.webp';
import eurFlag from '@/assets/wallet/flags/eur.webp';
import gbpFlag from '@/assets/wallet/flags/gbp.webp';
import idrFlag from '@/assets/wallet/flags/idr.webp';
import inrFlag from '@/assets/wallet/flags/inr.webp';
import jpyFlag from '@/assets/wallet/flags/jpy.webp';
import krwFlag from '@/assets/wallet/flags/krw.webp';
import mxnFlag from '@/assets/wallet/flags/mxn.webp';
import ngnFlag from '@/assets/wallet/flags/ngn.webp';
import phpFlag from '@/assets/wallet/flags/php.webp';
import plnFlag from '@/assets/wallet/flags/pln.webp';
import rubFlag from '@/assets/wallet/flags/rub.webp';
import sarFlag from '@/assets/wallet/flags/sar.webp';
import thbFlag from '@/assets/wallet/flags/thb.webp';
import tryFlag from '@/assets/wallet/flags/try.webp';
import usdFlag from '@/assets/wallet/flags/usd.webp';
import vndFlag from '@/assets/wallet/flags/vnd.webp';
import zarFlag from '@/assets/wallet/flags/zar.webp';
import btcCoin from '@/assets/wallet/coins/btc.webp';
import ethCoin from '@/assets/wallet/coins/eth.webp';
import solCoin from '@/assets/wallet/coins/sol.webp';
import usdcCoin from '@/assets/wallet/coins/usdc.webp';

/** Round flags for the display currencies, from the design's currency picker. */
export const CURRENCY_FLAGS: Readonly<Record<string, StaticImageData>> = {
  AED: aedFlag,
  ARS: arsFlag,
  AUD: audFlag,
  BRL: brlFlag,
  CAD: cadFlag,
  CHF: chfFlag,
  CNY: cnyFlag,
  EUR: eurFlag,
  GBP: gbpFlag,
  IDR: idrFlag,
  INR: inrFlag,
  JPY: jpyFlag,
  KRW: krwFlag,
  MXN: mxnFlag,
  NGN: ngnFlag,
  PHP: phpFlag,
  PLN: plnFlag,
  RUB: rubFlag,
  SAR: sarFlag,
  THB: thbFlag,
  TRY: tryFlag,
  USD: usdFlag,
  VND: vndFlag,
  ZAR: zarFlag,
};

/** Coin marks for the wallet's assets, from the design's My Assets list. */
export const COIN_MARKS: Readonly<Record<string, StaticImageData>> = {
  BTC: btcCoin,
  ETH: ethCoin,
  SOL: solCoin,
  USDC: usdcCoin,
};
