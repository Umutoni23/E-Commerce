import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import type { Order } from '../types';

export default function Orders() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('/auth/orders');
      const body = res.data;
      return Array.isArray(body) ? body : (body.data ?? body.items ?? body.orders ?? []);
    },
  });

  if (isLoading) return <div className="flex justify-center py-20 text-gray-500">Loading orders...</div>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">Order #{o.id}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  o.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                  o.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                  o.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{o.status}</span>
              </div>
              <p className="text-sm text-gray-500">Payment: {o.paymentMethod}</p>
              <p className="text-sm text-gray-500">Address: {o.shippingAddress}, {o.city}</p>
              <p className="text-blue-600 font-bold mt-2">${Number(o.totalAmount).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
