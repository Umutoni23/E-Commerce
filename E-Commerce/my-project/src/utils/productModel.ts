import type { Product } from '../types';

type ProductRecord = Record<string, unknown>;

function asRecord(value: unknown): ProductRecord | null {
  return value && typeof value === 'object' ? (value as ProductRecord) : null;
}

function normalizeImages(images: unknown): Product['images'] {
  if (!Array.isArray(images)) return [];
  return images
    .map((image) => {
      if (typeof image === 'string') return image;
      const record = asRecord(image);
      if (!record) return undefined;
      const url = record.url ?? record.imageUrl ?? record.src;
      return typeof url === 'string' ? { url } : undefined;
    })
    .filter((image): image is string | { url: string } => image !== undefined);
}

export function normalizeProduct(value: unknown): Product | null {
  const record = asRecord(value);
  if (!record) return null;

  const id = record.id;
  if (typeof id !== 'string') return null;

  const title = typeof record.title === 'string' && record.title.trim()
    ? record.title.trim()
    : typeof record.name === 'string' && record.name.trim()
      ? record.name.trim()
      : '';

  return {
    id,
    title,
    name: typeof record.name === 'string' && record.name.trim() ? record.name.trim() : title,
    description: typeof record.description === 'string' ? record.description : '',
    price: Number(record.price ?? 0),
    stock: Number(record.stock ?? 0),
    brand: typeof record.brand === 'string' ? record.brand : '',
    images: normalizeImages(record.images),
    category: asRecord(record.category) ? {
      id: typeof asRecord(record.category)?.id === 'string' ? String(asRecord(record.category)?.id) : '',
      name: typeof asRecord(record.category)?.name === 'string' ? String(asRecord(record.category)?.name) : '',
      description: typeof asRecord(record.category)?.description === 'string' ? String(asRecord(record.category)?.description) : undefined,
    } : undefined,
    categoryId: typeof record.categoryId === 'string' ? record.categoryId : undefined,
  };
}

export function getProductsFromBody(body: unknown): Product[] {
  if (Array.isArray(body)) return body.map(normalizeProduct).filter((product): product is Product => Boolean(product));
  const record = asRecord(body);
  if (!record) return [];

  const data = record.data;
  const nested = asRecord(data);
  const candidates = [
    body,
    data,
    nested?.all,
    nested?.products,
    nested?.items,
    record.products,
    record.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map(normalizeProduct).filter((product): product is Product => Boolean(product));
    }
  }

  return [];
}

export function getProductFromBody(body: unknown): Product | null {
  const record = asRecord(body);
  if (!record) return null;

  const data = record.data;
  const nested = asRecord(data);

  return normalizeProduct(nested?.product ?? data ?? record.product ?? body);
}

export function getProductTitle(product: Pick<Product, 'title' | 'name'>) {
  return product.title || product.name || 'Untitled product';
}
