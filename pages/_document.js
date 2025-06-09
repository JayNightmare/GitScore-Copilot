/**
 * Next.js Document component for custom HTML structure
 */

import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#24292f" />
        <meta name="author" content="GitHub Scorer" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
