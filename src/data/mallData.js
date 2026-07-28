export const malls = [
  { id: 'accra_mall', name: 'Accra Mall', location: 'Tetteh Quarshie Interchange, Accra' },
  { id: 'west_hills', name: 'West Hills Mall', location: 'Kasoa Road, Weija, Accra' },
  { id: 'ac_mall', name: 'A&C Mall', location: 'Jungle Road, East Legon, Accra' }
];

export const stores = {
  accra_mall: [
    { id: 'shoprite_accra', name: 'Shoprite' },
    { id: 'game_accra', name: 'Game' },
    { id: 'palace_accra', name: 'Palace Store' }
  ],
  west_hills: [
    { id: 'melcom_west', name: 'Melcom' },
    { id: 'palace_west', name: 'Palace Store' },
    { id: 'shoprite_west', name: 'Shoprite' }
  ],
  ac_mall: [
    { id: 'melcom_ac', name: 'Melcom' },
    { id: 'game_ac', name: 'Game' },
    { id: 'shoprite_ac', name: 'Shoprite' }
  ]
};

export const products = {
  // Groceries & Essentials (Shoprite, Melcom)
  groceries: [
    { id: 'g_rice', name: 'Gazzaz Perfumed Rice 5kg', price: 120.00, category: 'groceries', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&fit=crop&q=80', description: 'Premium grade fragrant long grain jasmine rice.' },
    { id: 'g_tomato', name: 'Gino Tomato Paste 400g', price: 25.00, category: 'groceries', image: 'https://images.unsplash.com/photo-1589114902996-38290f9e1605?w=400&fit=crop&q=80', description: 'Rich double concentrated tomato paste for thick stews.' },
    { id: 'g_oil', name: 'Frytol Cooking Oil 1L', price: 45.00, category: 'groceries', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&fit=crop&q=80', description: 'Highly refined pure vegetable oil for all cooking needs.' },
    { id: 'g_milo', name: 'Milo Chocolate Drink 400g', price: 60.00, category: 'groceries', image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=400&fit=crop&q=80', description: 'Fortified chocolate malt beverage mix.' },
    { id: 'g_nido', name: 'Nido Milk Powder 400g', price: 75.00, category: 'groceries', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&fit=crop&q=80', description: 'Rich and creamy instant full cream milk powder.' }
  ],
  // Electronics & Gadgets (Game, Melcom)
  electronics: [
    { id: 'e_samsung', name: 'Samsung Galaxy A15 128GB', price: 2100.00, category: 'electronics', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&fit=crop&q=80', description: '6.5-inch smartphone with Triple Camera and 5000mAh battery.' },
    { id: 'e_sony', name: 'Sony Bluetooth Headphones', price: 650.00, category: 'electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&fit=crop&q=80', description: 'Over-ear wireless headphones with active noise cancellation.' },
    { id: 'e_tv', name: 'Nasco 32 Inch LED Smart TV', price: 1500.00, category: 'electronics', image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&fit=crop&q=80', description: 'High definition LED TV with built-in Wi-Fi and HDMI inputs.' },
    { id: 'e_powerbank', name: 'Oraimo 20000mAh Power Bank', price: 220.00, category: 'electronics', image: 'https://images.unsplash.com/photo-1609592424089-8d76b1f2ef31?w=400&fit=crop&q=80', description: 'High-speed fast charging portable power bank.' }
  ],
  // Fashion & Apparel (Palace Store, Game)
  fashion: [
    { id: 'f_kente', name: 'Ghana Kente Muffler', price: 150.00, category: 'fashion', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&fit=crop&q=80', description: 'Handwoven traditional Ghanaian kente sash.' },
    { id: 'f_tshirt', name: 'Iconic Black T-Shirt', price: 120.00, category: 'fashion', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&fit=crop&q=80', description: 'Premium cotton designer crewneck tee.' },
    { id: 'f_sandals', name: 'Handmade Leather Men Sandals', price: 250.00, category: 'fashion', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&fit=crop&q=80', description: 'Durable and stylish authentic leather hand-crafted slippers.' },
    { id: 'f_wristband', name: 'Ghana Flag Beaded Wristband', price: 15.00, category: 'fashion', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&fit=crop&q=80', description: 'Beaded patriotic armlet with national colors.' }
  ]
};

export const initialOrders = [
  {
    id: 'ORD-1001',
    status: 'Payment Confirmed',
    customerName: 'Kwasi Mensah',
    phone: '0244123456',
    location: 'Spintex Road, Accra',
    mallName: 'Accra Mall',
    storeName: 'Shoprite',
    items: [
      { name: 'Gazzaz Perfumed Rice 5kg', price: 120.00, quantity: 1, picked: false },
      { name: 'Gino Tomato Paste 400g', price: 25.00, quantity: 2, picked: false },
      { name: 'Frytol Cooking Oil 1L', price: 45.00, quantity: 1, picked: false }
    ],
    subtotal: 215.00,
    deliveryFee: 25.00,
    serviceFee: 10.75, // 5% of 215
    total: 250.75,
    momoProvider: 'MTN MoMo',
    shopper: '',
    rider: '',
    flagged: false,
    flagNote: '',
    createdAt: '2026-07-27T18:30:00Z'
  },
  {
    id: 'ORD-1002',
    status: 'Shopper Assigned & Shopping',
    customerName: 'Abena Osei',
    phone: '0555678901',
    location: 'Tema Community 6, Tema',
    mallName: 'Accra Mall',
    storeName: 'Game',
    items: [
      { name: 'Sony Bluetooth Headphones', price: 650.00, quantity: 1, picked: true },
      { name: 'Oraimo 20000mAh Power Bank', price: 220.00, quantity: 1, picked: false }
    ],
    subtotal: 870.00,
    deliveryFee: 25.00,
    serviceFee: 43.50, // 5% of 870
    total: 938.50,
    momoProvider: 'Telecel Cash',
    shopper: 'Ekow Appiah',
    rider: '',
    flagged: false,
    flagNote: '',
    createdAt: '2026-07-27T19:15:00Z'
  },
  {
    id: 'ORD-1003',
    status: 'Paid at Mall',
    customerName: 'John Boateng',
    phone: '0201122334',
    location: 'Dansoman, Accra',
    mallName: 'West Hills Mall',
    storeName: 'Melcom',
    items: [
      { name: 'Nasco 32 Inch LED TV', price: 1500.00, quantity: 1, picked: true }
    ],
    subtotal: 1500.00,
    deliveryFee: 25.00,
    serviceFee: 75.00, // 5% of 1500
    total: 1600.00,
    momoProvider: 'MTN MoMo',
    shopper: 'Adjoa Sarfo',
    rider: '',
    flagged: false,
    flagNote: '',
    createdAt: '2026-07-27T20:00:00Z'
  },
  {
    id: 'ORD-1004',
    status: 'Waiting for Rider',
    customerName: 'Fatima Bello',
    phone: '0243445566',
    location: 'East Legon, Accra',
    mallName: 'West Hills Mall',
    storeName: 'Palace Store',
    items: [
      { name: 'Handmade Leather Men Sandals', price: 250.00, quantity: 1, picked: true },
      { name: 'Ghana Kente Muffler', price: 150.00, quantity: 2, picked: true }
    ],
    subtotal: 550.00,
    deliveryFee: 25.00,
    serviceFee: 27.50, // 5% of 550
    total: 602.50,
    momoProvider: 'AirtelTigo Money',
    shopper: 'Kofi Owusu',
    rider: '',
    flagged: false,
    flagNote: '',
    createdAt: '2026-07-27T20:30:00Z'
  },
  {
    id: 'ORD-1005',
    status: 'Out for Delivery',
    customerName: 'Samuel Dogbe',
    phone: '0549988776',
    location: 'Airport Residential, Accra',
    mallName: 'A&C Mall',
    storeName: 'Game',
    items: [
      { name: 'Oraimo 20000mAh Power Bank', price: 220.00, quantity: 2, picked: true }
    ],
    subtotal: 440.00,
    deliveryFee: 25.00,
    serviceFee: 22.00, // 5% of 440
    total: 487.00,
    momoProvider: 'MTN MoMo',
    shopper: 'Ama Koomson',
    rider: 'Yaw Preko',
    flagged: true,
    flagNote: 'Rider delayed due to heavy rain on Spintex Road.',
    createdAt: '2026-07-27T21:00:00Z'
  },
  {
    id: 'ORD-1006',
    status: 'Delivered',
    customerName: 'Dr. Grace Osei',
    phone: '0244111222',
    location: 'Legon Campus, Accra',
    mallName: 'A&C Mall',
    storeName: 'Shoprite',
    items: [
      { name: 'Milo Chocolate Drink 400g', price: 60.00, quantity: 2, picked: true },
      { name: 'Nido Milk Powder 400g', price: 75.00, quantity: 2, picked: true }
    ],
    subtotal: 270.00,
    deliveryFee: 25.00,
    serviceFee: 13.50, // 5% of 270
    total: 308.50,
    momoProvider: 'Telecel Cash',
    shopper: 'Kofi Owusu',
    rider: 'Yaw Preko',
    flagged: false,
    flagNote: '',
    createdAt: '2026-07-27T21:45:00Z'
  }
];
