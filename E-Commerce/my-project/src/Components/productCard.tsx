import { Link } from 'react-router-dom';
import type { Product } from '../types';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col">
      <img
        src={product.images?.[0] ?? 'https://placehold.co/300x200?text=No+Image'}
        alt={product.title}
        className="w-full h-48 object-cover"
        onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/300x200?text=No+Image')}
      />
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-gray-800 truncate">{product.title}</h3>
        <p className="text-xs text-gray-500">{product.brand}</p>
        <p className="text-blue-600 font-bold">${Number(product.price).toFixed(2)}</p>
        <p className="text-xs text-gray-400">Stock: {product.stock}</p>
        <Link
          to={`/products/${product.id}`}
          className="mt-auto text-center bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
