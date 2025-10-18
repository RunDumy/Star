import type { AppProps } from 'next/app';
import { AuthProvider } from '../src/lib/AuthContext';
import { SocketProvider } from '../src/lib/SocketContext';
import '../src/styles/globals.css';
import '../src/styles/universal-space.css';
import '../styles/3d-cosmic.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <SocketProvider>
        <Component {...pageProps} />
      </SocketProvider>
    </AuthProvider>
  );
}

