import React from 'react';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { formatEgp, getStockLabel } from '../lib/commerce';
import type { Product } from '../lib/types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  badgeText?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, badgeText }) => {
  const { navigate, wishlist, toggleWishlist, setQuickViewProduct, addToCart } = useStore();
  const isSaved = wishlist.includes(product.id);
  const stockInfo = getStockLabel(product.stock);
  const primaryImage = product.images[0] || '/assets/911/crest.jpg';

  const label =
    badgeText ||
    (product.isLimitedEdition
      ? 'Limited Edition'
      : product.isNewArrival
      ? 'New Arrival'
      : undefined);

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F3EF] border border-[#D8D6D1]/50">
        <a
          href={`/product/${product.slug}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/product/${product.slug}`);
          }}
          className="block h-full w-full"
          aria-label={`View ${product.name}`}
        >
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </a>

        {/* Top-right subtle wishlist icon */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center bg-[#FFFFFF]/90 text-[#242424] transition-colors hover:bg-[#FFFFFF]"
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-[#242424] text-[#242424]' : 'stroke-[1.5]'}`} />
        </button>

        {/* Bottom quick action tray visible on hover / focus-within on desktop */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-2 items-center gap-px bg-[#FFFFFF]/95 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 md:flex border-t border-[#D8D6D1]">
          <button
            type="button"
            onClick={() => setQuickViewProduct(product)}
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium tracking-[0.12em] uppercase text-[#242424] hover:bg-[#F5F3EF] transition-colors whitespace-nowrap"
          >
            <Eye className="h-3.5 w-3.5 stroke-[1.5]" />
            Quick View
          </button>
          <span className="h-5 w-px bg-[#D8D6D1]" aria-hidden="true" />
          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={() =>
              addToCart({
                productId: product.id,
                variation: product.variations[0]?.name || 'Signature',
                size: product.sizes?.[0],
                quantity: 1,
              })
            }
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium tracking-[0.12em] uppercase text-[#242424] hover:bg-[#F5F3EF] disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            <ShoppingBag className="h-3.5 w-3.5 stroke-[1.5]" />
            {product.stock <= 0 ? 'Sold Out' : 'Quick Add'}
          </button>
        </div>
      </div>

      {/* Clean unboxed editorial metadata */}
      <div className="pt-3.5 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2 text-[11px] tracking-[0.12em] uppercase text-[#A8A29A]">
          <span>
            {product.category}
            {label ? ` · ${label}` : ''}
          </span>
          {stockInfo.tone === 'low' && (
            <span className="text-[#242424] font-medium">{stockInfo.label}</span>
          )}
        </div>

        <a
          href={`/product/${product.slug}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/product/${product.slug}`);
          }}
          className="text-[15px] font-medium text-[#242424] hover:text-[#A8A29A] transition-colors leading-snug"
        >
          {product.name}
        </a>

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="text-[14px] font-normal text-[#242424] tabular-nums">
            {formatEgp(product.priceEgp)}
            {product.isSamplePrice && (
              <span className="ml-1.5 text-[11px] text-[#A8A29A]" title="Sample catalog placeholder price">
                (Sample)
              </span>
            )}
          </span>

          {product.variations.length > 0 && (
            <div className="flex items-center gap-1.5" aria-label="Available finishes">
              {product.variations.slice(0, 3).map((v) => (
                <span
                  key={v.name}
                  title={v.name}
                  className="h-2.5 w-2.5 rounded-full border border-[#D8D6D1]"
                  style={{ backgroundColor: v.hex }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
