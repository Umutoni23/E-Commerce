import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import type { Product } from '../types';
import toast from 'react-hot-toast';
import { getFallbackProductImage, getProductImage } from '../utils/productImage';

function getProductsFromResponse(body: unknown): Product[] {
  if (Array.isArray(body)) return body as Product[];
  if (!body || typeof body !== 'object') return [];

  const source = body as Record<string, unknown>;

  if (Array.isArray(source.data)) return source.data as Product[];

  if (source.data && typeof source.data === 'object') {
    const nested = source.data as Record<string, unknown>;
    if (Array.isArray(nested.all)) return nested.all as Product[];
    if (Array.isArray(nested.products)) return nested.products as Product[];
    if (Array.isArray(nested.items)) return nested.items as Product[];
  }

  if (Array.isArray(source.products)) return source.products as Product[];
  if (Array.isArray(source.items)) return source.items as Product[];

  return [];
}

export default function AdminDashboard() {
  const qc = useQueryClient();
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/public/products');
      return getProductsFromResponse(res.data);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
      setDeleteProductId(null);
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.stock || 0), 0),
    [products]
  );

  const averagePrice = useMemo(() => {
    if (products.length === 0) return 0;
    const total = products.reduce((sum, product) => sum + Number(product.price || 0), 0);
    return total / products.length;
  }, [products]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <section className="mb-8 overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-700 px-6 py-8 text-white shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Admin Dashboard</p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">All products in one place</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
              Review every product, check pricing and stock, and use the action buttons to edit, update, or delete products smoothly.
            </p>
          </div>

          <Link
            to="/admin/product/new"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-100"
          >
            + Add New Product
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Total Products</p>
            <p className="mt-2 text-3xl font-bold">{products.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Total Stock</p>
            <p className="mt-2 text-3xl font-bold">{totalStock}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Average Price</p>
            <p className="mt-2 text-3xl font-bold">${averagePrice.toFixed(2)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Products</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Product Management</h2>
            <p className="mt-2 text-sm text-slate-500">Each product card includes full information and direct actions.</p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-slate-500">Loading products...</p>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-700">No products available yet.</p>
            <p className="mt-2 text-sm text-slate-500">Add your first product to start managing your catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative">
                  <img
                    src={getProductImage(product)}
                    alt={product.title}
                    className="h-56 w-full object-cover"
                    onError={(e) => ((e.target as HTMLImageElement).src = getFallbackProductImage())}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{product.brand || 'Brand not set'}</p>
                    <h3 className="mt-1 text-xl font-bold text-white">{product.title}</h3>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Price</p>
                      <p className="mt-2 text-xl font-bold text-slate-900">${Number(product.price).toFixed(2)}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Stock</p>
                      <p className="mt-2 text-xl font-bold text-slate-900">{product.stock}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-900 p-4 text-white">
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Category</p>
                    <p className="mt-2 text-sm font-medium">{product.category?.name ?? product.categoryId ?? 'Not assigned'}</p>
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-cyan-200">Product ID</p>
                    <p className="mt-2 break-all text-xs text-slate-300">{product.id}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Description</p>
                    <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-600">{product.description || 'No description provided.'}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <Link
                      to={`/admin/product/${product.id}`}
                      className="rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/admin/product/${product.id}`}
                      className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-center text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                    >
                      Update
                    </Link>
                    <button
                      onClick={() => setDeleteProductId(product.id)}
                      className="rounded-2xl bg-red-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {deleteProductId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">Delete Product</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Are you sure?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              This product will be removed from the dashboard. This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteProductId(null)}
                className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteProductMutation.mutate(deleteProductId)}
                disabled={deleteProductMutation.isPending}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
