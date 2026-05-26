import './globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata = {
  metadataBase: new URL('https://neatbrandtrade.com'),
  title: 'Neat Brand Trade | Buy Premium Cleaning & Industrial Chemicals',
  description: 'Shop premium retail cleaning products and bulk industrial chemicals. Direct from manufacturer. Wholesale pricing available in 5L, 25L, and tons. Call/WhatsApp 0246272115 to order today!',
  keywords: 'cleaning chemicals, industrial chemicals, buy bleach ghana, neat brand trade, wholesale chemicals, bulk cleaning products, home care, fabric care',
  openGraph: {
    title: 'Neat Brand Trade | Premium Cleaning Products',
    description: 'Direct manufacturer of retail and industrial cleaning solutions. Shop 5L, 25L and wholesale volumes today.',
    url: 'https://neatbrandtrade.com',
    siteName: 'Neat Brand Trade',
    images: [
      {
        url: '/NBT Logo_.png',
        width: 800,
        height: 600,
        alt: 'Neat Brand Trade Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neat Brand Trade | Buy Premium Cleaning & Industrial Chemicals',
    description: 'Shop premium retail cleaning products and bulk industrial chemicals. Direct from manufacturer.',
    images: ['/NBT Logo_.png'],
  },
  icons: {
    icon: '/NBT Logo_.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'aV1QVjBiYY8xBBwAnBj32A-0J1P8f3WQo7-oNbeg1K4',
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Neat Brand Trade',
    image: 'https://neatbrandtrade.com/NBT Logo_.png',
    description: 'Manufacturer and distributor of premium retail and industrial cleaning chemicals.',
    telephone: '0246272115',
    url: 'https://neatbrandtrade.com',
    priceRange: 'GH₵',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Accra',
      addressCountry: 'GH'
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'
        ],
        opens: '08:00',
        closes: '18:00'
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <GoogleAnalytics gaId="G-4TD08NQ7DF" />
      </body>
    </html>
  );
}
