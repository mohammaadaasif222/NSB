import { Html, Head, Main, NextScript } from 'next/document';

import { GA_MEASUREMENT_ID } from '@/utils/ga';

/**
 * `data-theme` is seeded with the same default ThemeContext starts from, so
 * the server markup matches the first client render. ThemeContext swaps in the
 * user's stored theme once it mounts.
 *
 * Poppins is loaded here rather than through `next/font` so the build does not
 * need network access to succeed; `display=swap` means a blocked or slow font
 * costs nothing but a repaint — the stack in index.css carries the first frame.
 */
export default function Document() {
  return (
    <Html lang="en" data-theme="dark">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap"
        />

        {/*
          GA4, only when a measurement id is configured — development and
          preview builds send nothing.

          `send_page_view: false` because useTracking reports every page view
          itself, including the client-side route changes GA cannot see in a
          single-page app. Left at its default, the first page of every visit
          would be counted twice.

          Loaded with `async` and left out of the tracker's own path entirely:
          this layer is a convenience for marketing, and nothing in the admin
          console depends on it arriving.
        */}
        {GA_MEASUREMENT_ID !== '' && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
                `,
              }}
            />
          </>
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
