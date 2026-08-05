import CustomerApp from '../../components/CustomerApp';

export const metadata = {
  title: 'SHOPIMAMI | Online Mall Shopping, Shoprite & Melcom Delivery',
  description: 'Get groceries, electronics, and fashion delivered from Shoprite, Melcom, and Game Store. Pay via MTN MoMo, Telecel Cash, or AirtelTigo.',
  openGraph: {
    title: 'SHOPIMAMI | Online Mall Shopping, Shoprite & Melcom Delivery',
    description: 'Get groceries, electronics, and fashion delivered from Shoprite, Melcom, and Game Store. Pay via MTN MoMo, Telecel Cash, or AirtelTigo.',
    url: 'https://shopimami.com/customer',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SHOPIMAMI — Shop Accra Malls, Pay by MoMo, Get Delivered',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SHOPIMAMI | Online Mall Shopping, Shoprite & Melcom Delivery',
    description: 'Get groceries, electronics, and fashion delivered from Shoprite, Melcom, and Game Store. Pay via MTN MoMo, Telecel Cash, or AirtelTigo.',
    images: ['/og-image.jpg'],
  },
};

export default function Page() {
  return <CustomerApp />;
}
