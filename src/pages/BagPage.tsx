import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatEgp, FREE_SHIPPING_THRESHOLD_EGP } from '../lib/commerce';

export const BagPage: React.FC = () => {
  const { cart, products, updateCartQuantity, removeFromCart, navigate } = useStore();

  const resolved = cart
    .map((item, idx) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { item, idx, product } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = resolved.reduce((sum, r) => sum + r.product.priceEgp * r.item.quantity, 0);

  return (
    <main className="bg-[#FFFFFF] min-h-[70vh] py-12 md:py-16 px-6 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-2">911.EG</p>
        <h1 className="font-editorial text-4xl md:text-5xl text-[#242424] mb-10">Shopping Bag</h1>

        {resolved.length === 0 ? (
          <div className="border border-[#D8D6D1] bg-[#F5F3EF] p-12 text-center">
            <p className="font-editorial text-2xl text-[#242424]">Your bag is currently empty</p>
            <p className="mt-2 text-sm text-[#A8A29A]">
              Explore watches, bracelets, briefcases, small leather goods, sunglasses, and caps.
            </p>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="mt-6 bg-[#242424] text-[#FFFFFF] px-8 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase"
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 divide-y divide-[#D8D6D1] border-y border-[#D8D6D1]">
              {resolved.map(({ item, idx, product }) => (
                <div
                  key={`${item.productId}-${item.variation}-${item.size || ''}`}
                  className="py-6 flex gap-5"
                >
                  <a
                    href={`/product/${product.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/product/${product.slug}`);
                    }}
                    className="h-32 w-24 shrink-0 bg-[#F5F3EF] border border-[#D8D6D1]/70 overflow-hidden"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </a>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <a
                          href={`/product/${product.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/product/${product.slug}`);
                          }}
                          className="text-base font-medium text-[#242424] hover:text-[#A8A29A]"
                        >
                          {product.name}
                        </a>
                        <p className="text-xs text-[#A8A29A] mt-1">
                          {item.variation}
                          {item.size ? ` · ${item.size}` : ''}
                        </p>
                        <p className="text-xs text-[#242424]/75 mt-1 tabular-nums">
                          Unit: {formatEgp(product.priceEgp)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(idx)}
                        aria-label={`Remove ${product.name}`}
                        className="text-[#A8A29A] hover:text-[#242424] p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="inline-flex items-center border border-[#D8D6D1]">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(idx, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${product.name}`}
                          className="p-2 hover:bg-[#F5F3EF]"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-4 text-xs tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          disabled={item.quantity >= product.stock}
                          onClick={() => updateCartQuantity(idx, item.quantity + 1)}
                          aria-label={`Increase quantity of ${product.name}`}
                          className="p-2 hover:bg-[#F5F3EF] disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-medium text-[#242424] tabular-nums">
                        {formatEgp(product.priceEgp * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4">
              <div className="bg-[#F5F3EF] border border-[#D8D6D1] p-6 space-y-5">
                <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-[#242424]">
                  Order Summary
                </h2>
                <div className="space-y-3 text-sm border-b border-[#D8D6D1] pb-4">
                  <div className="flex justify-between">
                    <span className="text-[#A8A29A]">Subtotal</span>
                    <span className="tabular-nums">{formatEgp(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A8A29A]">Egypt Courier Shipping</span>
                    <span className="text-xs text-[#242424]">
                      {subtotal >= FREE_SHIPPING_THRESHOLD_EGP
                        ? 'Complimentary'
                        : 'Calculated at checkout'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-[0.16em] text-[#A8A29A]">
                    Estimated Total
                  </span>
                  <span className="text-lg font-medium tabular-nums">{formatEgp(subtotal)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-[#242424] text-[#FFFFFF] py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-[#3A3A3A] transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
