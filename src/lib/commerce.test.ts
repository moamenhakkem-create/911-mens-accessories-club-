import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateShippingEgp,
  computeSalesRanking,
  filterAndSortProducts,
  formatEgp,
  getStockLabel,
  isValidEgyptianPhone,
  normalizeEgyptianPhone,
} from './commerce';
import type { Order, Product } from './types';

test('formatEgp formats Egyptian Pounds with comma grouping', () => {
  assert.equal(formatEgp(4000), 'EGP 4,000');
  assert.equal(formatEgp(12500), 'EGP 12,500');
  assert.equal(formatEgp(150000), 'EGP 150,000');
});

test('isValidEgyptianPhone accepts valid local and +20 mobile numbers', () => {
  assert.equal(isValidEgyptianPhone('01012345678'), true);
  assert.equal(isValidEgyptianPhone('+20 11 2345 6789'), true);
  assert.equal(isValidEgyptianPhone('01298765432'), true);
  assert.equal(isValidEgyptianPhone('01555555555'), true);
  assert.equal(isValidEgyptianPhone('01912345678'), false);
  assert.equal(isValidEgyptianPhone('12345'), false);
});

test('normalizeEgyptianPhone converts local numbers to +20 format', () => {
  assert.equal(normalizeEgyptianPhone('010 1234 5678'), '+201012345678');
  assert.equal(normalizeEgyptianPhone('+201123456789'), '+201123456789');
});

test('calculateShippingEgp applies free threshold at EGP 15,000 and governorate rates below', () => {
  assert.equal(calculateShippingEgp('Cairo', 6500), 120);
  assert.equal(calculateShippingEgp('Alexandria', 6500), 150);
  assert.equal(calculateShippingEgp('Cairo', 15000), 0);
  assert.equal(calculateShippingEgp('Upper Egypt', 25000), 0);
  assert.equal(calculateShippingEgp('Cairo', 0), 0);
});

test('computeSalesRanking excludes cancelled orders and sums item quantities', () => {
  const orders: Order[] = [
    {
      id: 'o1',
      orderNumber: '911-1001',
      customerName: 'Karim',
      email: 'k@example.com',
      phone: '+201000000001',
      governorate: 'Cairo',
      city: 'Zamalek',
      addressLine: '12 Brazil St',
      giftWrap: true,
      paymentMethod: 'cod',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      subtotalEgp: 12000,
      shippingEgp: 120,
      totalEgp: 12120,
      createdAt: '2026-10-01T10:00:00Z',
      items: [
        {
          productId: 'p1',
          name: 'Watch',
          slug: 'watch',
          image: '',
          variation: 'Navy',
          unitPriceEgp: 12000,
          quantity: 2,
        },
      ],
    },
    {
      id: 'o2',
      orderNumber: '911-1002',
      customerName: 'Omar',
      email: 'o@example.com',
      phone: '+201000000002',
      governorate: 'Cairo',
      city: 'Maadi',
      addressLine: '8 Road 9',
      giftWrap: false,
      paymentMethod: 'cod',
      paymentStatus: 'Pending COD',
      orderStatus: 'Cancelled',
      subtotalEgp: 4000,
      shippingEgp: 120,
      totalEgp: 4120,
      createdAt: '2026-10-02T10:00:00Z',
      items: [
        {
          productId: 'p2',
          name: 'Cap',
          slug: 'cap',
          image: '',
          variation: 'White',
          unitPriceEgp: 4000,
          quantity: 5,
        },
      ],
    },
  ];
  const ranking = computeSalesRanking(orders);
  assert.equal(ranking.p1, 2);
  assert.equal(ranking.p2, undefined);
});

test('filterAndSortProducts filters by category, price, and sorts accurately', () => {
  const sample: Product[] = [
    {
      id: 'a',
      slug: 'a',
      name: 'Alpha Watch',
      category: 'watches',
      priceEgp: 48000,
      isSamplePrice: true,
      shortDescription: 'Automatic timepiece',
      story: '',
      images: [],
      variations: [],
      stock: 5,
      isNewArrival: true,
      isLimitedEdition: false,
      isFeatured: true,
      materials: ['Stainless Steel'],
      specifications: [],
      careInstructions: '',
      views: 10,
      createdAt: '2026-10-01T00:00:00Z',
    },
    {
      id: 'b',
      slug: 'b',
      name: 'Beta Cap',
      category: 'caps',
      priceEgp: 4200,
      isSamplePrice: true,
      shortDescription: 'Cotton twill cap',
      story: '',
      images: [],
      variations: [],
      stock: 1,
      isNewArrival: false,
      isLimitedEdition: false,
      isFeatured: false,
      materials: ['Cotton'],
      specifications: [],
      careInstructions: '',
      views: 5,
      createdAt: '2026-10-02T00:00:00Z',
    },
  ];
  assert.equal(filterAndSortProducts(sample, { category: 'watches' }).length, 1);
  assert.equal(filterAndSortProducts(sample, { maxPrice: 10000 })[0].id, 'b');
  assert.equal(filterAndSortProducts(sample, { sort: 'price-asc' })[0].id, 'b');
  assert.equal(getStockLabel(1).tone, 'low');
  assert.equal(getStockLabel(0).tone, 'out');
});
