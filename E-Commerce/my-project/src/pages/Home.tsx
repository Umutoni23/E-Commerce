import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import type { Product } from '../types';
import ProductCard from '../Components/productCard';

export default function Home() {
  const { data: products = [], isLoading, isError } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/public/products');
      const body = res.data;
      // API returns { data: { all: [], grouped: {} } }
      if (Array.isArray(body)) return body;
      if (Array.isArray(body.data)) return body.data;
      if (body.data?.all) return body.data.all;
      return [];
    },
  });

  if (isLoading) return <div className="flex justify-center py-20 text-gray-500">Loading products...</div>;
  if (isError) return <div className="flex justify-center py-20 text-red-500">Failed to load products.</div>;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Product Catalog</h1>
      {products.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </main>
  );
}
