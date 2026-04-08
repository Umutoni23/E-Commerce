import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';
import FormInput from '../Components/FormInput';
import type { Category, Product } from '../types';
import toast from 'react-hot-toast';
import { getProductFromBody } from '../utils/productModel';

const schema = z.object({
  title: z.string().min(1, 'Title is required').refine((v) => v.trim().length > 0, 'Cannot be empty spaces'),
  description: z.string().min(20, 'Description must be at least 20 characters').refine((v) => v.trim().length > 0, 'Cannot be empty spaces'),
  brand: z.string().min(1, 'Brand is required').refine((v) => v.trim().length > 0, 'Cannot be empty spaces'),
  price: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Price must be greater than 0'),
  stock: z.string().refine((v) => !isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) >= 0, 'Stock must be a non-negative integer'),
  categoryId: z.string().min(1, 'Category is required'),
  images: z.array(z.object({ url: z.string().optional() })),
});

type ProductFormData = z.infer<typeof schema>;

function normalizeImageUrl(image: unknown): string | null {
  if (typeof image === 'string' && image.trim()) return image.trim();
  if (image && typeof image === 'object') {
    const candidate = (image as { url?: unknown; imageUrl?: unknown; src?: unknown }).url
      ?? (image as { url?: unknown; imageUrl?: unknown; src?: unknown }).imageUrl
      ?? (image as { url?: unknown; imageUrl?: unknown; src?: unknown }).src;
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return null;
}

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id && id !== 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      const body = res.data;
      return Array.isArray(body) ? body : (body.data ?? body.items ?? body.categories ?? []);
    },
  });

  const { data: product, isLoading: loadingProduct } = useQuery<Product | null>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/public/products/${id}`);
      return getProductFromBody(res.data);
    },
    enabled: isEdit,
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', brand: '', price: '', stock: '', categoryId: '', images: [{ url: '' }] },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'images' });

  useEffect(() => {
    if (product) {
      const normalizedImages = Array.isArray(product.images)
        ? product.images.map(normalizeImageUrl).filter((url): url is string => Boolean(url))
        : [];

      reset({
        title: product.title,
        description: product.description,
        brand: product.brand,
        price: String(product.price),
        stock: String(product.stock),
        categoryId: String(product.categoryId ?? product.category?.id ?? ''),
        images: normalizedImages.length > 0 ? normalizedImages.map((url) => ({ url })) : [{ url: '' }],
      });
    }
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: (payload: ProductFormData) => {
      const imageUrls = payload.images
        .map((i) => i.url?.trim() ?? '')
        .filter(Boolean);

      const body: {
        name: string;
        description: string;
        brand: string;
        price: number;
        stock: number;
        categoryId: string;
      } = {
        name: payload.title.trim(),
        description: payload.description,
        brand: payload.brand,
        price: Number(payload.price),
        stock: Number(payload.stock),
        categoryId: payload.categoryId,
      };

      if (imageUrls.length > 0) {
        toast('Image URLs are not updated by this API, so the product details will save without changing images.', {
          icon: 'ℹ',
        });
      }

      return isEdit ? api.patch(`/admin/products/${id}`, body) : api.post('/admin/products', body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product', id] });
      toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully');
      navigate('/admin');
    },
    onError: (error) => {
      console.error('Failed to save product', error);
      const responseData = axios.isAxiosError(error) ? error.response?.data as { message?: string; error?: string } | undefined : undefined;
      toast.error(responseData?.message ?? responseData?.error ?? 'Failed to save product');
    },
  });

  if (isEdit && loadingProduct) {
    return <main className="max-w-2xl mx-auto px-4 py-8 text-gray-500">Loading product...</main>;
  }

  if (isEdit && !loadingProduct && !product) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-red-500 mb-4">We could not load that product for editing.</p>
        <button onClick={() => navigate('/admin')} className="text-blue-600 hover:underline text-sm">
          Back to dashboard
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
        <FormInput label="Title" {...register('title')} error={errors.title?.message} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 transition resize-none ${errors.description ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'}`}
          />
          {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
        </div>
        <FormInput label="Brand" {...register('brand')} error={errors.brand?.message} />
        <FormInput label="Price" type="number" step="0.01" {...register('price')} error={errors.price?.message} />
        <FormInput label="Stock Quantity" type="number" step="1" {...register('stock')} error={errors.stock?.message} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value || ''}
                className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          />
          {errors.categoryId && <p className="text-red-500 text-xs">{errors.categoryId.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Images (optional)</label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`images.${index}.url`)}
                placeholder="https://example.com/image.jpg"
                className={`flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ${errors.images?.[index]?.url ? 'border-red-500' : 'border-gray-300'}`}
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700 text-sm px-2"
                  aria-label={`Remove image ${index + 1}`}
                >
                  x
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => append({ url: '' })} className="text-blue-600 text-sm hover:underline self-start">+ Add Image</button>
        </div>

        <div className="flex gap-3 mt-2">
          <button type="button" onClick={() => navigate('/admin')} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition">
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </main>
  );
}
