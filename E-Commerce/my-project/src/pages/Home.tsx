import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import type { Product } from '../types';
import ProductCard from '../Components/productCard';
import { getProductsFromBody } from '../utils/productModel';

export default function Home() {
  const { data: products = [], isLoading, isError } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/public/products');
      return getProductsFromBody(res.data);
    },
  });

  if (isLoading) return <div className="flex justify-center py-20 text-gray-500">Loading products...</div>;
  if (isError) return <div className="flex justify-center py-20 text-red-500">Failed to load products.</div>;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-700 px-6 py-10 text-white shadow-xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Welcome</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Welcome to Umutoni's shopping space</h1>
          <p className="mt-4 text-sm leading-7 text-slate-100 sm:text-base">
            New customers can explore fresh deals, and existing customers can continue shopping, review product details, and manage their orders with confidence. At Umutoni's Shopping place Customer is King!
          </p>
        </div>
      </section>
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
