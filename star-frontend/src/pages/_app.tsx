import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/universal-space.css';
import '../styles/zodiac-animations.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
