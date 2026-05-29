import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Runs UNN - Peer-to-Peer Escrow Transport Network',
  description: 'University of Nigeria, Nsukka peer errand dispatch grid.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} bg-black`}>
      <body className="font-sans antialiased text-zinc-100 bg-black" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
