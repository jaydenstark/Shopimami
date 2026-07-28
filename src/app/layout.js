import './globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata = {
  metadataBase: new URL('https://mallmart.gh'),
  title: 'MallMart | On-Demand Mall Shopping & Delivery Platform',
  description: 'Shop items from Accra Mall, West Hills Mall, and A&C Mall. Paid up front by Mobile Money, bought in-person by our Shoppers, and delivered by Dispatch Riders.',
  keywords: 'mallmart, online shopping ghana, accra mall online, west hills mall online, mtn momo shopping, buy groceries accra, dispatch delivery',
  openGraph: {
    title: 'MallMart | On-Demand Mall Shopping & Delivery',
    description: 'Shop items from top physical malls in Ghana and get them delivered to your doorstep in real time.',
    url: 'https://mallmart.gh',
    siteName: 'MallMart',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MallMart | On-Demand Mall Shopping & Delivery',
    description: 'Shop items from top physical malls in Ghana and get them delivered to your doorstep in real time.',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'MallMart Ghana',
    description: 'On-demand shopping and delivery platform from major Ghanaian malls.',
    url: 'https://mallmart.gh',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <GoogleAnalytics gaId="G-4TD08NQ7DF" />
      </body>
    </html>
  );
}

