/**
 * Next.js App component wrapper with global styles
 */

import "../styles/globals.css";

export default function App({ Component, pageProps }) {
    return <Component {...pageProps} />;
}
