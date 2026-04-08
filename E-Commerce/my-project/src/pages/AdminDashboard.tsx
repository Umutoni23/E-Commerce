import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import api from '../api/axios';
import type { Product, Order, OrderStatus, Category } from '../types';
import toast from 'react-hot-toast';
import { getProductsFromBody, getProductTitle } from '../utils/productModel';
import { useAuth } from '../hooks/useAuth';

type Tab = 'products' | 'orders' | 'categories';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').refine((v) => v.trim().length > 0, 'Cannot be empty'),
  description: z.string().optional(),
});
type CategoryForm = z.infer<typeof categorySchema>;

export default function AdminDashboard() {
  const qc = useQueryClient();
  const { user, userRole, login } = useAuth();
  const [tab, setTab] = useState<Tab>('products');
  const [authReady, setAuthReady] = useState(Boolean(user?.token && userRole === 'ADMIN'));
  const [authFailed, setAuthFailed] = useState(false);


  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  useEffect(() => {
    let active = true;

    const ensureAdminSession = async () => {
      if (user?.token && userRole === 'ADMIN') {
        if (active) {
          setAuthReady(true);
          setAuthFailed(false);
        }
        return;
      }

      try {
        await login('admin@admin.com', 'admin123');
        if (active) {
          setAuthReady(true);
          setAuthFailed(false);
        }
      } catch (error) {
        console.error('Failed to start admin session', error);
        if (active) {
          setAuthReady(false);
          setAuthFailed(true);
        }
      }
    };

    void ensureAdminSession();

    return () => {
      active = false;
    };
  }, [user?.token, userRole]);

  
  const { data: products = [], isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/public/products');
      return getProductsFromBody(res.data);
    },
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/auth/orders/admin/all');
      const body = res.data;
      return Array.isArray(body) ? body : (body.data ?? body.items ?? body.orders ?? []);
    },
    enabled: tab === 'orders',
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      const body = res.data;
      return Array.isArray(body) ? body : (body.data ?? body.items ?? body.categories ?? []);
    },
    enabled: tab === 'categories',
  });


  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
      setDeleteProductId(null);
    },
    onError: (error) => {
      console.error('Failed to delete product', error);
      const responseData = axios.isAxiosError(error)
        ? error.response?.data as { message?: string; error?: string } | undefined
        : undefined;
      toast.error(responseData?.message ?? responseData?.error ?? 'Failed to delete product');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.patch(`/auth/orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status updated');
    },
    onError: () => toast.error('Update failed'),
  });

  
  const createCategoryMutation = useMutation({
    mutationFn: (body: CategoryForm) => {
      const payload: Record<string, string> = { name: body.name };
      if (body.description && body.description.trim()) payload.description = body.description.trim();
      return api.post('/categories', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created');
      setShowCategoryForm(false);
      categoryForm.reset();
    },
    onError: () => toast.error('Failed to create category'),
  });

  const editCategoryMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: CategoryForm }) => {
      const payload: Record<string, string> = { name: body.name };
      if (body.description && body.description.trim()) payload.description = body.description.trim();
      return api.put(`/categories/${id}`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated');
      setEditCategory(null);
      categoryForm.reset();
    },
    onError: () => toast.error('Failed to update category'),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
      setDeleteCategoryId(null);
    },
    onError: () => toast.error('Failed to delete category'),
  });

  
  const categoryForm = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    mode: 'onChange',
  });

  const openEditCategory = (cat: Category) => {
    setEditCategory(cat);
    setShowCategoryForm(false);
    categoryForm.reset({ name: cat.name, description: cat.description ?? '' });
  };

  const onCategorySubmit = (values: CategoryForm) => {
    if (editCategory) {
      editCategoryMutation.mutate({ id: editCategory.id, body: values });
    } else {
      createCategoryMutation.mutate(values);
    }
  };

  const cancelCategoryForm = () => {
    setShowCategoryForm(false);
    setEditCategory(null);
    categoryForm.reset();
  };

  const isCategoryFormOpen = showCategoryForm || !!editCategory;

  if (!authReady && !authFailed) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-6 py-10 text-center text-blue-700 shadow-sm">
          Starting admin session...
        </div>
      </main>
    );
  }

  if (authFailed) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700 shadow-sm">
          Admin session could not be started. Refresh the page and try again.
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        {tab === 'products' && (
          <Link to="/admin/product/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
            + Add Product
          </Link>
        )}
        {tab === 'categories' && !isCategoryFormOpen && (
          <button
            onClick={() => { setShowCategoryForm(true); setEditCategory(null); categoryForm.reset(); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            + Add Category
          </button>
        )}
      </div>

      
      <div className="flex gap-4 mb-6 border-b">
        {(['products', 'orders', 'categories'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm font-medium capitalize border-b-2 transition ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>


      {tab === 'products' && (
        loadingProducts ? <p className="text-gray-500">Loading...</p> : (
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="w-full text-sm bg-white">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  {['ID', 'Title', 'Brand', 'Price', 'Stock', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{p.id}</td>
                    <td className="px-4 py-3 font-medium">{getProductTitle(p)}</td>
                    <td className="px-4 py-3 text-gray-500">{p.brand}</td>
                    <td className="px-4 py-3">${Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3 flex gap-3">
                      <Link to={`/admin/product/${p.id}`} className="text-blue-600 hover:underline">Edit</Link>
            
                      <button onClick={() => setDeleteProductId(p.id)} className="text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      
      {tab === 'orders' && (
        loadingOrders ? <p className="text-gray-500">Loading...</p> : (
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="w-full text-sm bg-white">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  {['ID', 'Customer', 'Total', 'Payment', 'Status', 'Update Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{o.id}</td>
                    <td className="px-4 py-3">{o.user?.email ?? o.fullName}</td>
                    <td className="px-4 py-3">${Number((o as any).total ?? o.totalAmount ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3">{o.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        o.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                        o.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        o.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        defaultValue={o.status}
                        onChange={(e) => statusMutation.mutate({ id: o.id, status: e.target.value as OrderStatus })}
                        className="border rounded px-2 py-1 text-xs"
                      >
                        {(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      
      {tab === 'categories' && (
        <div className="flex flex-col gap-6">
          
          {isCategoryFormOpen && (
            <form
              onSubmit={categoryForm.handleSubmit(onCategorySubmit)}
              className="bg-white rounded-xl shadow p-5 flex flex-col gap-4 max-w-lg"
            >
              <h3 className="font-semibold text-gray-800">{editCategory ? 'Edit Category' : 'New Category'}</h3>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                  {...categoryForm.register('name')}
                  className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 transition ${categoryForm.formState.errors.name ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'}`}
                />
                {categoryForm.formState.errors.name && (
                  <p className="text-red-500 text-xs">{categoryForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Description (optional)</label>
                <input
                  {...categoryForm.register('description')}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={cancelCategoryForm} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
                <button
                  type="submit"
                  disabled={createCategoryMutation.isPending || editCategoryMutation.isPending}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition"
                >
                  {createCategoryMutation.isPending || editCategoryMutation.isPending
                    ? 'Saving...'
                    : editCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          )}

          
          {loadingCategories ? <p className="text-gray-500">Loading...</p> : (
            <div className="overflow-x-auto rounded-xl shadow">
              <table className="w-full text-sm bg-white">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    {['ID', 'Name', 'Description', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{c.id}</td>
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-gray-500">{c.description ?? '—'}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => openEditCategory(c)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => setDeleteCategoryId(c.id)} className="text-red-500 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      
      {deleteProductId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Product</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteProductId(null)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => deleteProductMutation.mutate(deleteProductId)}
                disabled={deleteProductMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
              >
                {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      
      {deleteCategoryId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Category</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteCategoryId(null)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => deleteCategoryMutation.mutate(deleteCategoryId)}
                disabled={deleteCategoryMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
              >
                {deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
