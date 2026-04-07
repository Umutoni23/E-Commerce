import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product?: { id: string; title: string; price: number; images: string[] };
}

export default function CartPage() {
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/auth/cart');
      const body = res.data;
      if (Array.isArray(body)) return body;
      if (Array.isArray(body.data)) return body.data;
      if (Array.isArray(body.data?.items)) return body.data.items;
      if (Array.isArray(body.items)) return body.items;
      return [];
    },
  });

  const updateQtyMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      api.patch(`/auth/cart/items/${itemId}`, { quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
    onError: () => toast.error('Failed to update quantity'),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => api.delete(`/auth/cart/items/${itemId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
    onError: () => toast.error('Failed to remove item'),
  });

  if (isLoading) return <div className="flex justify-center py-20 text-gray-500">Loading cart...</div>;

  const total = items.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Cart</h1>
      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="mb-4">Your cart is empty.</p>
          <Link to="/" className="text-blue-600 hover:underline">Continue Shopping</Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
                <img
                  src={item.product?.images?.[0] ?? 'https://placehold.co/80x80?text=?'}
                  alt={item.product?.title}
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=?')}
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.product?.title ?? `Product #${item.productId}`}</p>
                  <p className="text-blue-600 font-bold">${Number(item.product?.price ?? 0).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQtyMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold disabled:opacity-40"
                  >-</button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQtyMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold"
                  >+</button>
                </div>
                <button onClick={() => removeMutation.mutate(item.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-white rounded-xl shadow p-4 flex items-center justify-between">
            <span className="font-bold text-gray-800 text-lg">Total: ${total.toFixed(2)}</span>
            <Link to="/checkout" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
              Checkout
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
