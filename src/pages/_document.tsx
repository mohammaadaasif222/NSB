import { Html, Head, Main, NextScript } from 'next/document';

/**
 * `data-theme` is seeded with the same default ThemeContext starts from, so
 * the server markup matches the first client render. ThemeContext swaps in the
 * user's stored theme once it mounts.
 *
 * The typefaces are loaded here rather than through `next/font` so the build
 * does not need network access to succeed; `display=swap` means a blocked or
 * slow font costs nothing but a repaint — the stack in index.css carries the
 * first frame.
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
export default function Document() {
  return (
    <Html lang="en" data-theme="dark">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600;700;800&family=Rubik:wght@400;500;600;700&display=swap"
        />

      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
