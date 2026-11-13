import React from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatEgp, FREE_SHIPPING_THRESHOLD_EGP } from '../lib/commerce';

export const BagDrawer: React.FC = () => {
  const {
    isBagOpen,
    setIsBagOpen,
    cart,
    products,
    updateCartQuantity,
    removeFromCart,
    navigate,
  } = useStore();

  if (!isBagOpen) return null;

  const resolved = cart
    .map((item, idx) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { item, idx, product } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = resolved.reduce((sum, r) => sum + r.product.priceEgp * r.item.quantity, 0);
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD_EGP - subtotal);
  const progressPct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD_EGP) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div
        className="fixed inset-0 bg-[#242424]/40 transition-opacity"
        onClick={() => setIsBagOpen(false)}
      />

      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#FFFFFF] border-l border-[#D8D6D1]">
        <div className="flex items-center justify-between border-b border-[#D8D6D1] px-6 py-5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-4 w-4 stroke-[1.5]" />
            <h2 className="font-editorial text-xl font-medium tracking-wide">Shopping Bag</h2>
            <span className="text-xs text-[#A8A29A] tabular-nums">({resolved.length})</span>
          </div>
          <button
            type="button"
            onClick={() => setIsBagOpen(false)}
            aria-label="Close shopping bag"
            className="p-2 text-[#242424] hover:text-[#A8A29A]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Complimentary shipping threshold */}
        <div className="bg-[#F5F3EF] px-6 py-3 border-b border-[#D8D6D1]/70">
          <p className="text-xs text-[#242424]">
            {remainingForFree === 0
              ? 'Your order qualifies for complimentary courier delivery across Egypt.'
              : `Add ${formatEgp(remainingForFree)} more for complimentary Egypt delivery.`}
          </p>
          <div className="mt-2 h-1 w-full bg-[#D8D6D1]">
            <div
              className="h-full bg-[#242424] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Bag Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {resolved.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <p className="font-editorial text-2xl text-[#242424] mb-2">Your bag is empty</p>
              <p className="text-sm text-[#A8A29A] max-w-xs mb-6">
                Explore considered timepieces, leather goods, eyewear, and headwear.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsBagOpen(false);
                  navigate('/shop');
                }}
                className="bg-[#242424] text-[#FFFFFF] px-7 py-3 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-[#3A3A3A] transition-colors"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#D8D6D1]/70">
              {resolved.map(({ item, idx, product }) => (
                <li key={`${item.productId}-${item.variation}-${item.size || ''}`} className="py-5 first:pt-0">
                  <div className="flex gap-4">
                    <a
                      href={`/product/${product.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsBagOpen(false);
                        navigate(`/product/${product.slug}`);
                      }}
                      className="h-28 w-22 shrink-0 overflow-hidden bg-[#F5F3EF] border border-[#D8D6D1]/60"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </a>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <a
                            href={`/product/${product.slug}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setIsBagOpen(false);
                              navigate(`/product/${product.slug}`);
                            }}
                            className="text-sm font-medium text-[#242424] hover:text-[#A8A29A]"
                          >
                            {product.name}
                          </a>
                          <button
                            type="button"
                            onClick={() => removeFromCart(idx)}
                            aria-label={`Remove ${product.name}`}
                            className="text-[#A8A29A] hover:text-[#242424] p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-[#A8A29A] mt-0.5">
                          {item.variation}
                          {item.size ? ` · ${item.size}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <div className="inline-flex items-center border border-[#D8D6D1]">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(idx, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${product.name}`}
                            className="p-1.5 text-[#242424] hover:bg-[#F5F3EF]"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-xs tabular-nums">{item.quantity}</span>
                          <button
                            type="button"
                            disabled={item.quantity >= product.stock}
                            onClick={() => updateCartQuantity(idx, item.quantity + 1)}
                            aria-label={`Increase quantity of ${product.name}`}
                            className="p-1.5 text-[#242424] hover:bg-[#F5F3EF] disabled:opacity-40"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-medium text-[#242424] tabular-nums">
                          {formatEgp(product.priceEgp * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {resolved.length > 0 && (
          <div className="border-t border-[#D8D6D1] bg-[#FFFFFF] px-6 py-5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#A8A29A]">Subtotal</span>
              <span className="font-medium text-[#242424] tabular-nums">{formatEgp(subtotal)}</span>
            </div>
            <p className="text-[11px] text-[#A8A29A]">
              Delivered in official 911 foil-crest gift packaging. Shipping calculated at checkout.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsBagOpen(false);
                  navigate('/bag');
                }}
                className="border border-[#242424] py-3 text-[11px] font-medium tracking-[0.16em] uppercase text-[#242424] hover:bg-[#F5F3EF] transition-colors"
              >
                View Bag
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsBagOpen(false);
                  navigate('/checkout');
                }}
                className="bg-[#242424] py-3 text-[11px] font-medium tracking-[0.16em] uppercase text-[#FFFFFF] hover:bg-[#3A3A3A] transition-colors"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
