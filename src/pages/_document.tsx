import { Html, Head, Main, NextScript, type DocumentProps } from 'next/document';
import { LOCALE_META } from '@/i18n/locales';
import { SERVER_DICTIONARIES } from '@/i18n/dictionaries.server';
import { EMBEDDED_DICTIONARY_ID } from '@/i18n/registry';

/**
 * `data-theme` is seeded with the same default ThemeContext starts from, so
 * the server markup matches the first client render. ThemeContext swaps in the
 * user's stored theme once it mounts.
 *
 * Onest is the design's typeface almost everywhere: nearly every text node in
 * the Figma file reports `Onest` at Regular, Medium or SemiBold. Rubik comes
 * with it for the two places that do not — the selected tab on the Responsible
 * Gambling rail, and the whole body of the Terms and Privacy documents, which
 * the design sets in Rubik Regular and Bold. 700 is loaded for those headings;
 * without it the browser synthesises a fake bold and the weight reads wrong.
 *
 * The app shipped Poppins until now, which is why column widths measured
 * against Onest in the design were always a few pixels out here. It is kept at
 * the end of the stack so anything still rendering while Onest loads lands on
 * the face this app has been read in rather than on Arial.
 */
export default function Document({ locale }: DocumentProps) {
  const meta = LOCALE_META.find((m) => m.code === locale) ?? LOCALE_META[0];
  const dictionary = SERVER_DICTIONARIES[meta.code];

  return (
    <Html lang={meta.code} dir={meta.rtl ? 'rtl' : 'ltr'} data-theme="dark">
      <Head>
        <link
          rel="preload"
          href="/fonts/onest-latin-v5.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        {dictionary && (
          <script
            id={EMBEDDED_DICTIONARY_ID}
            type="application/json"
            data-locale={meta.code}
            dangerouslySetInnerHTML={{ __html: JSON.stringify(dictionary).replace(/</g, '\\u003c') }}
          />
        )}
        <NextScript />
      </body>
    </Html>
  );
}
