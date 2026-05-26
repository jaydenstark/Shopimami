export const products = [
  // RETAIL PRODUCTS
  {
    id: 1,
    name: "Neat All Purpose Cleaner - Floral",
    brand: "Neat Product",
    category: "Cleaning",
    type: "retail",
    description: "Multi-surface cleaner with a long-lasting floral fragrance. Perfect for household and office use.",
    sizes: [
      { size: "2L", price: 35.00 }
    ],
    image: "/PRODUCTS /Neat/all-neat-all-purpose-cleaner-floral-2l.png",
    specs: "Highly Concentrated | Multi-Surface"
  },
  {
    id: 2,
    name: "Neat Dish Wash - Lemon",
    brand: "Neat Product",
    category: "Cleaning",
    type: "retail",
    description: "Tough on grease, gentle on hands. Refreshing lemon scent for sparkling clean dishes.",
    sizes: [
      { size: "400ml", price: 12.00 }
    ],
    image: "/PRODUCTS /Neat/all-neat-dish-wash-lemon-400ml.png",
    specs: "Anti-Bacterial | High Suds"
  },
  {
    id: 3,
    name: "Neat Fabric Softener - Spring Fresh",
    brand: "Neat Product",
    category: "Cleaning",
    type: "retail",
    description: "Premium fabric softener that leaves clothes soft and smelling like spring flowers.",
    sizes: [
      { size: "2L", price: 45.00 }
    ],
    image: "/PRODUCTS /Neat/all-neat-fabric-softener-springfresh-2l.png",
    specs: "Long-lasting Fragrance | Easy Iron"
  },
  {
    id: 4,
    name: "Neat Shower Gel - Coconut Joy",
    brand: "Neat Product",
    category: "Hygiene",
    type: "retail",
    description: "Indulgent shower gel with moisturizing coconut extract for a tropical bathing experience.",
    sizes: [
      { size: "800ml", price: 28.00 }
    ],
    image: "/PRODUCTS /Neat/all-neat-shower-gel-coconut-joy-800ml.png",
    specs: "PH Balanced | Vitamin E"
  },
  {
    id: 5,
    name: "Neat Hand Wash - Aloe Vera",
    brand: "Neat Product",
    category: "Hygiene",
    type: "retail",
    description: "Gentle hand wash with aloe vera to keep hands clean and hydrated.",
    sizes: [
      { size: "500ml", price: 18.00 }
    ],
    image: "/PRODUCTS /Neat/neat-hand-wash-aloevera-500ml.png",
    specs: "Moisturizing | Daily Use"
  },
  {
    id: 6,
    name: "Deva Air Freshener - Empress",
    brand: "Deva Products",
    category: "Hygiene",
    type: "retail",
    description: "Premium air freshener with a sophisticated 'Empress' scent. Neutralizes odors instantly.",
    sizes: [
      { size: "300ml", price: 22.00 }
    ],
    image: "/PRODUCTS /Deva/Air-Freshener-Empress .png",
    specs: "Odor Neutralizer | Fine Mist"
  },
  {
    id: 7,
    name: "Deva Surface Cleaner - Lavender",
    brand: "Deva Products",
    category: "Cleaning",
    type: "retail",
    description: "Deep cleaning solution for all hard surfaces with a calming lavender aroma.",
    sizes: [
      { size: "1L", price: 25.00 }
    ],
    image: "/PRODUCTS /Deva/Surface Cleaner Lavender .jpg.png",
    specs: "Non-Toxic | Rapid Dry"
  },
  {
    id: 8,
    name: "Deva Washing Powder - Ultra",
    brand: "Deva Products",
    category: "Cleaning",
    type: "retail",
    description: "High-performance washing powder for both hand and machine wash.",
    sizes: [
      { size: "3kg", price: 85.00 }
    ],
    image: "/PRODUCTS /Deva/WASHING-POWDER-3kg 1.png",
    specs: "Advanced Stain Removal | Bio-Enzymes"
  },

  // INDUSTRIAL SOLUTIONS
  {
    id: 101,
    name: "Neat Industrial Degreaser",
    brand: "Neat Product",
    category: "Cleaning",
    type: "industrial",
    description: "Heavy-duty degreaser for industrial machinery, warehouses, and factories.",
    sizes: [
      { size: "5L", price: 75.00 },
      { size: "25L", price: 320.00 },
      { size: "1000L (Ton)", price: 8500.00 }
    ],
    image: "/images/hero.png",
    specs: "Chemical Ratio 1:20 | Heavy Duty"
  },
  {
    id: 102,
    name: "Deva Industrial Sanitizer",
    brand: "Deva Products",
    category: "Hygiene",
    type: "industrial",
    description: "Bulk alcohol-based sanitizer for corporate offices, hospitals, and schools.",
    sizes: [
      { size: "5L", price: 120.00 },
      { size: "25L", price: 550.00 },
      { size: "1000L (Ton)", price: 18500.00 }
    ],
    image: "/PRODUCTS /Deva/Sanitizer 5Lt.png",
    specs: "WHO Standard | Bulk Logistics"
  },
  {
    id: 103,
    name: "Neat Bulk Floor Wash",
    brand: "Neat Product",
    category: "Cleaning",
    type: "industrial",
    description: "Concentrated floor cleaning solution for large scale industrial cleaning.",
    sizes: [
      { size: "25L", price: 420.00 },
      { size: "1000L (Ton)", price: 12000.00 }
    ],
    image: "/PRODUCTS /Neat/all-neat-all-purpose-cleaner-floral-2l.png",
    specs: "High Coverage | Economical"
  },
  {
    id: 104,
    name: "Deva Food-Grade Citric Solution",
    brand: "Deva Products",
    category: "Food Grade Chemical",
    type: "industrial",
    description: "Pure citric acid solution for food processing and preservation.",
    sizes: [
      { size: "25L", price: 650.00 },
      { size: "1000L (Ton)", price: 22000.00 }
    ],
    image: "/images/hero.png",
    specs: "Food Grade | High Purity"
  }
];

export const brands = ["Neat Product", "Deva Products"];
export const categories = ["Hygiene", "Cleaning", "Food Grade Chemical"];
