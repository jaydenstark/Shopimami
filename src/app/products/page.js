import ProductsClientPage from './ProductsClientPage';
import Papa from 'papaparse';

// Revalidate the data every 60 seconds (incremental static regeneration)
export const revalidate = 60;

export const metadata = {
  title: 'Chemical Catalog | Buy Premium Cleaning & Industrial Chemicals | Neat Brand Trade',
  description: 'Browse our complete catalog of precision-formulated cleaning products and raw industrial chemicals. Filter by brand (Neat, Deva, NBT Global) or category.',
  keywords: 'cleaning product catalog, industrial chemical catalog, liquid detergents, disinfectants, laundry detergents, household cleaners, Neat, Deva, NBT Global',
};

export default async function ProductsPage() {
  let initialProducts = [];

  try {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1pHzmSNsXpPdrJcGQ5kI4ZNsAaUNVeXt6knle7C_sNG0/export?format=csv&gid=1847675030';
    
    // Fetch the CSV text on the server
    const response = await fetch(sheetUrl, { next: { revalidate: 60 } });
    const csvText = await response.text();

    // Parse the CSV
    const results = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    for (const row of results.data) {
      if (!row.Name) continue;
      
      initialProducts.push({
        id: `sheet_${row.Name}_${row.Size}`,
        slug: row.Name.replace(/\s+/g, '-').toLowerCase(),
        name: row.Name,
        brand: row.Brand || 'Neat Product',
        type: row.Type?.toLowerCase() === 'industrial' ? 'industrial' : 'retail',
        category: row.Category || 'General',
        description: row.Description || '',
        image: row.Image || '/PRODUCTS%20/Neat/neat-all-purpose-floral-2l.png',
        sizes: [
          {
            size: row.Size || '1L',
            price: parseFloat(row.Price) || 0,
            qtyInBox: parseInt(row.QtyInBox) || 1
          }
        ]
      });
    }
  } catch (error) {
    console.error("Failed to fetch initial products for products page:", error);
  }

  return <ProductsClientPage initialProducts={initialProducts} />;
}
