import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatEgp, getStockLabel } from '../lib/commerce';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, navigate } = useStore();
  const [selectedVariation, setSelectedVariation] = useState('');
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedVariation(quickViewProduct.variations[0]?.name || 'Signature');
      setSelectedSize(quickViewProduct.sizes?.[0]);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const stockInfo = getStockLabel(quickViewProduct.stock);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${quickViewProduct.name}`}
    >
      <div
        className="fixed inset-0 bg-[#242424]/45"
        onClick={() => setQuickViewProduct(null)}
      />

      <div className="relative z-10 w-full max-w-3xl bg-[#FFFFFF] border border-[#D8D6D1] grid grid-cols-1 md:grid-cols-2 overflow-hidden max-h-[90vh]">
        <button
          type="button"
          onClick={() => setQuickViewProduct(null)}
          aria-label="Close quick view"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center bg-[#FFFFFF]/90 text-[#242424] hover:bg-[#F5F3EF]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="aspect-[3/4] bg-[#F5F3EF] overflow-hidden">
          <img
            src={quickViewProduct.images[0]}
            alt={quickViewProduct.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="text-[11px] tracking-[0.18em] uppercase text-[#A8A29A]">
              {quickViewProduct.category} · {stockInfo.label}
            </div>
            <h2 className="font-editorial text-2xl md:text-3xl text-[#242424] leading-tight">
              {quickViewProduct.name}
            </h2>
            <p className="text-lg font-normal text-[#242424] tabular-nums">
              {formatEgp(quickViewProduct.priceEgp)}
              {quickViewProduct.isSamplePrice && (
                <span className="ml-2 text-xs text-[#A8A29A]">(Sample catalog price)</span>
              )}
            </p>
            <p className="text-sm leading-relaxed text-[#242424]/80">
              {quickViewProduct.shortDescription}
            </p>

            {quickViewProduct.variations.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] tracking-[0.14em] uppercase text-[#A8A29A] mb-2">
                  Finish: <span className="text-[#242424]">{selectedVariation}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.variations.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setSelectedVariation(v.name)}
                      className={`flex items-center gap-2 border px-3 py-1.5 text-xs transition-colors ${
                        selectedVariation === v.name
                          ? 'border-[#242424] bg-[#F5F3EF]'
                          : 'border-[#D8D6D1] hover:border-[#242424]'
                      }`}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-[#D8D6D1]"
                        style={{ backgroundColor: v.hex }}
                      />
                      <span>{v.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
              <div className="pt-1">
                <p className="text-[11px] tracking-[0.14em] uppercase text-[#A8A29A] mb-2">
                  Specification / Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`border px-3 py-1.5 text-xs transition-colors ${
                        selectedSize === sz
                          ? 'border-[#242424] bg-[#242424] text-[#FFFFFF]'
                          : 'border-[#D8D6D1] text-[#242424] hover:border-[#242424]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 space-y-2.5">
            <button
              type="button"
              disabled={quickViewProduct.stock <= 0}
              onClick={() => {
                const target = quickViewProduct;
                setQuickViewProduct(null);
                addToCart({
                  productId: target.id,
                  variation: selectedVariation,
                  size: selectedSize,
                  quantity: 1,
                });
              }}
              className="w-full bg-[#242424] py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase text-[#FFFFFF] hover:bg-[#3A3A3A] disabled:opacity-40 transition-colors"
            >
              {quickViewProduct.stock <= 0 ? 'Out of Stock' : 'Add to Bag'}
            </button>
            <button
              type="button"
              onClick={() => {
                const slug = quickViewProduct.slug;
                setQuickViewProduct(null);
                navigate(`/product/${slug}`);
              }}
              className="w-full border border-[#D8D6D1] py-3 text-[11px] font-medium tracking-[0.18em] uppercase text-[#242424] hover:border-[#242424] transition-colors"
            >
              View Full Product Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
