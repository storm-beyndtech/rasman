import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Providers } from '@/components/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rasman Music - Conscious Reggae Music by Rasman Peter Dudu',
  description: 'Official music platform of Rasman Peter Dudu. Stream and download authentic reggae music with conscious messages of love, unity, and spirituality.',
  keywords: 'Rasman, Peter Dudu, reggae music, conscious music, Jamaican music, roots reggae, spiritual music',
  authors: [{ name: 'Rasman Peter Dudu' }],
  openGraph: {
    title: 'Rasman Music - Conscious Reggae Music',
    description: 'Official music platform of Rasman Peter Dudu. Stream and download authentic reggae music.',
    url: 'https://rasmanmusic.com',
    siteName: 'Rasman Music',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rasman Music - Conscious Reggae Music',
    description: 'Official music platform of Rasman Peter Dudu. Stream and download authentic reggae music.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#228B22',
          colorBackground: '#ffffff',
          colorText: '#1a1a1a',
        },
        elements: {
          formButtonPrimary: 'bg-reggae-green hover:bg-green-600',
          card: 'shadow-xl',
        },
      }}
    >
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Gloock:wght@400&display=swap" rel="stylesheet" />
        </head>
        <body className={`${inter.className} antialiased`}>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}