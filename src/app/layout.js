import './globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import PWAInstallBanner from '../components/PWAInstallBanner';

export const metadata = {
  metadataBase: new URL('https://shopimami.com'),
  title: 'SHOPIMAMI | Online Grocery & Mall Delivery Accra',
  description: 'Order online from Shoprite, Melcom, Game Store, and Palace Mall. Secure Mobile Money checkout & 45-minute doorstep delivery across Accra.',
  keywords: 'shopimami, grocery delivery accra, shoprite online delivery ghana, melcom online shopping accra, buy groceries online ghana, palace mall online shopping, momo online shopping ghana, accra mall delivery service, west hills mall online shopping, dispatch rider delivery accra',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SHOPIMAMI',
  },
  openGraph: {
    title: 'SHOPIMAMI | On-Demand Mall Shopping & Delivery',
    description: 'Shop items from top physical malls in Ghana and get them delivered to your doorstep in real time.',
    url: 'https://shopimami.com',
    siteName: 'SHOPIMAMI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SHOPIMAMI — On-Demand Mall Shopping & Delivery in Accra, Ghana',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SHOPIMAMI | On-Demand Mall Shopping & Delivery',
    description: 'Shop items from top physical malls in Ghana and get them delivered to your doorstep in real time.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'SHOPIMAMI Ghana',
    description: 'On-demand shopping and delivery platform from major Ghanaian malls.',
    url: 'https://shopimami.com',
    priceRange: 'GH₵',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Accra',
      addressCountry: 'GH'
    }
  };

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0A0F16" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <PWAInstallBanner />
        {children}
        <GoogleAnalytics gaId="G-4TD08NQ7DF" />
      </body>
    </html>
  );
}
