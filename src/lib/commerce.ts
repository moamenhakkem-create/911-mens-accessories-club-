import type { CategorySlug, Order, Product } from './types';

export const EGYPT_GOVERNORATES = [
  { name: 'Cairo', shippingEgp: 120 },
  { name: 'Giza & 6th of October / Sheikh Zayed', shippingEgp: 120 },
  { name: 'Alexandria', shippingEgp: 150 },
  { name: 'North Coast / El Alamein', shippingEgp: 190 },
  { name: 'Delta Governorates', shippingEgp: 170 },
  { name: 'Suez Canal & Sinai', shippingEgp: 185 },
  { name: 'Red Sea & Hurghada / El Gouna', shippingEgp: 210 },
  { name: 'Upper Egypt', shippingEgp: 220 },
] as const;

export const FREE_SHIPPING_THRESHOLD_EGP = 15000;

export function formatEgp(amount: number): string {
  const rounded = Math.round(Number.isFinite(amount) ? amount : 0);
  return `EGP ${rounded.toLocaleString('en-US')}`;
}

export function isValidEgyptianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(\+20|0020|0)?1[0125][0-9]{8}$/.test(cleaned);
}

export function normalizeEgyptianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+20')) return cleaned;
  if (cleaned.startsWith('0020')) return `+20${cleaned.slice(4)}`;
  if (cleaned.startsWith('0')) return `+20${cleaned.slice(1)}`;
  if (/^1[0125][0-9]{8}$/.test(cleaned)) return `+20${cleaned}`;
  return cleaned;
}

export function calculateShippingEgp(governorate: string, subtotalEgp: number): number {
  if (subtotalEgp <= 0) return 0;
  if (subtotalEgp >= FREE_SHIPPING_THRESHOLD_EGP) return 0;
  const matched = EGYPT_GOVERNORATES.find((g) => g.name === governorate);
  return matched ? matched.shippingEgp : 150;
}

export interface ProductFilterOptions {
  category?: CategorySlug | 'all' | 'new-arrivals';
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'bestselling';
  salesCountMap?: Record<string, number>;
}

export function filterAndSortProducts(
  products: Product[],
  options: ProductFilterOptions
): Product[] {
  const {
    category = 'all',
    search = '',
    minPrice,
    maxPrice,
    sort = 'featured',
    salesCountMap = {},
  } = options;

  const query = search.trim().toLowerCase();

  const filtered = products.filter((p) => {
    if (category === 'new-arrivals') {
      if (!p.isNewArrival) return false;
    } else if (category !== 'all') {
      if (p.category !== category) return false;
    }

    if (typeof minPrice === 'number' && !Number.isNaN(minPrice) && p.priceEgp < minPrice) {
      return false;
    }
    if (typeof maxPrice === 'number' && !Number.isNaN(maxPrice) && p.priceEgp > maxPrice) {
      return false;
    }

    if (query) {
      const haystack = `${p.name} ${p.category} ${p.shortDescription} ${p.materials.join(' ')}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  const sorted = [...filtered];
  switch (sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.priceEgp - b.priceEgp);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.priceEgp - a.priceEgp);
      break;
    case 'newest':
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'bestselling':
      sorted.sort((a, b) => (salesCountMap[b.id] || 0) - (salesCountMap[a.id] || 0));
      break;
    case 'featured':
    default:
      sorted.sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      break;
  }
  return sorted;
}

export function computeSalesRanking(orders: Order[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const order of orders) {
    if (order.orderStatus === 'Cancelled') continue;
    for (const item of order.items) {
      counts[item.productId] = (counts[item.productId] || 0) + item.quantity;
    }
  }
  return counts;
}

export function getStockLabel(stock: number): {
  label: string;
  tone: 'available' | 'low' | 'out';
} {
  if (stock <= 0) {
    return { label: 'Out of Stock', tone: 'out' };
  }
  if (stock <= 3) {
    return { label: `Only ${stock} remaining`, tone: 'low' };
  }
  return { label: 'Available', tone: 'available' };
}
