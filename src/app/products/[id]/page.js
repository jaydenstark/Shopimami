import ProductDetailClientPage from './ProductDetailClientPage';
import Papa from 'papaparse';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1pHzmSNsXpPdrJcGQ5kI4ZNsAaUNVeXt6knle7C_sNG0/export?format=csv&gid=1847675030';
    const response = await fetch(sheetUrl, { next: { revalidate: 60 } });
    const csvText = await response.text();
    const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    return results.data
      .filter(row => row.Name)
      .map(row => ({
        id: encodeURIComponent(row.Name.replace(/\s+/g, '-').toLowerCase()),
      }));
  } catch {
    return [];
  }
}

async function getAllProducts() {
  try {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1pHzmSNsXpPdrJcGQ5kI4ZNsAaUNVeXt6knle7C_sNG0/export?format=csv&gid=1847675030';
    const response = await fetch(sheetUrl, { next: { revalidate: 60 } });
    const csvText = await response.text();
    const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    const products = [];
    for (const row of results.data) {
      if (!row.Name) continue;
      products.push({
        id: `sheet_${row.Name}_${row.Size}`,
        slug: row.Name.replace(/\s+/g, '-').toLowerCase(),
        name: row.Name,
        brand: row.Brand || 'Neat Product',
        type: row.Type?.toLowerCase() === 'industrial' ? 'industrial' : 'retail',
        category: row.Category || 'General',
        description: row.Description || '',
        image: row.Image || '/PRODUCTS%20/Neat/neat-all-purpose-floral-2l.png',
        sizes: [{ size: row.Size || '1L', price: parseFloat(row.Price) || 0, qtyInBox: parseInt(row.QtyInBox) || 1 }],
      });
    }
    return products;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const products = await getAllProducts();
  const decoded = decodeURIComponent(id).replace(/-/g, ' ');
  const product = products.find(p => p.slug === decodeURIComponent(id)) ||
    products.find(p => p.name.toLowerCase() === decoded.toLowerCase());
  if (!product) return { title: 'Product | Neat Brand Trade' };
  return {
    title: `${product.name} | ${product.brand} | Neat Brand Trade`,
    description: product.description || `Buy ${product.name} by ${product.brand}. Premium cleaning & hygiene formulation available in multiple sizes.`,
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const allProducts = await getAllProducts();
  const decoded = decodeURIComponent(id).replace(/-/g, ' ');
  const product = allProducts.find(p => p.slug === decodeURIComponent(id)) ||
    allProducts.find(p => p.name.toLowerCase() === decoded.toLowerCase()) ||
    null;

  // Related: same category, excluding self
  const related = product
    ? allProducts.filter(p => p.category === product.category && p.slug !== product.slug).slice(0, 4)
    : [];

  return <ProductDetailClientPage product={product} allProducts={allProducts} related={related} />;
}
