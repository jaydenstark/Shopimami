import CustomerApp from '../../components/CustomerApp';

export const metadata = {
  title: 'SHOPIMAMI | Shop Accra Malls & Get It Delivered',
  description: 'Shop from Accra Mall, West Hills Mall & A&C Mall. Pay by MoMo, picked in-person by our Shoppers, delivered to your door.',
  openGraph: {
    title: 'SHOPIMAMI | Shop Accra Malls & Get It Delivered',
    description: 'Shop from Accra Mall, West Hills Mall & A&C Mall. Pay by MoMo, picked in-person by our Shoppers, delivered to your door.',
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
    title: 'SHOPIMAMI | Shop Accra Malls & Get It Delivered',
    description: 'Shop from Accra Mall, West Hills Mall & A&C Mall. Pay by MoMo, picked in-person by our Shoppers, delivered to your door.',
    images: ['/og-image.jpg'],
  },
};

export default function Page() {
  return <CustomerApp />;
}
