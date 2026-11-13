import React, { useEffect, useState } from 'react';
import {
  Check,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
  ZoomIn,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatEgp, getStockLabel } from '../lib/commerce';
import type { Product, Review } from '../lib/types';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const {
    products,
    wishlist,
    toggleWishlist,
    addToCart,
    recordRecentView,
    recentlyViewed,
    user,
    token,
    navigate,
  } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [completeLook, setCompleteLook] = useState<Product[]>([]);
  const [salesCount, setSalesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState('');
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  // Review form
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setActiveMediaIndex(0);
    setQuantity(1);
    setZoomed(false);

    fetch(`/api/products/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.product) {
          setProduct(data.product);
          setReviews(data.reviews || []);
          setRelated(data.related || []);
          setCompleteLook(data.completeTheLook || []);
          setSalesCount(data.salesCount || 0);
          setSelectedVariation(data.product.variations?.[0]?.name || 'Signature');
          setSelectedSize(data.product.sizes?.[0]);
          recordRecentView(data.product.id);
        } else {
          setProduct(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, recordRecentView]);

  useEffect(() => {
    if (user) {
      setReviewerName(user.name);
      setReviewerEmail(user.email);
    }
  }, [user]);

  if (loading) {
    return (
      <main className="mx-auto max-w-[1440px] px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
          <div className="lg:col-span-7 aspect-[4/3] bg-[#F5F3EF]" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-4 w-32 bg-[#F5F3EF]" />
            <div className="h-10 w-3/4 bg-[#F5F3EF]" />
            <div className="h-6 w-40 bg-[#F5F3EF]" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-editorial text-4xl text-[#242424]">Piece Not Found</h1>
        <p className="mt-3 text-sm text-[#A8A29A]">
          This item may have been archived or moved. Explore the active 911 catalog below.
        </p>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="mt-6 bg-[#242424] text-[#FFFFFF] px-7 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase"
        >
          Return to Shop
        </button>
      </main>
    );
  }

  const isSaved = wishlist.includes(product.id);
  const stockInfo = getStockLabel(product.stock);
  const mediaItems: Array<{ type: 'image' | 'video'; src: string }> = [
    ...product.images.map((src) => ({ type: 'image' as const, src })),
    ...(product.videoUrl ? [{ type: 'video' as const, src: product.videoUrl }] : []),
  ];
  const currentMedia = mediaItems[activeMediaIndex] || mediaItems[0];

  const recentProducts = recentlyViewed
    .filter((id) => id !== product.id)
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewNotice(null);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        productId: product.id,
        customerName: reviewerName,
        email: reviewerEmail,
        rating: reviewRating,
        comment: reviewComment,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setReviewNotice(data.error || 'Could not submit review.');
      return;
    }
    setReviews((prev) => [data.review, ...prev]);
    setReviewComment('');
    setReviewNotice(
      data.review.verifiedPurchase
        ? 'Thank you. Your Verified Purchase review has been published.'
        : 'Thank you. Your review has been published.'
    );
  };

  return (
    <main className="bg-[#FFFFFF]">
      {/* Breadcrumb */}
      <div className="border-b border-[#D8D6D1]/70 px-6 md:px-10 py-3.5 text-[11px] tracking-[0.16em] uppercase text-[#A8A29A]">
        <div className="mx-auto max-w-[1440px] flex items-center gap-2">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="hover:text-[#242424]"
          >
            Home
          </a>
          <span>/</span>
          <a
            href={`/shop/${product.category}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/shop/${product.category}`);
            }}
            className="hover:text-[#242424]"
          >
            {product.category}
          </a>
          <span>/</span>
          <span className="text-[#242424] truncate">{product.name}</span>
        </div>
      </div>

      {/* Main Purchase Split */}
      <section className="mx-auto max-w-[1440px] px-6 md:px-10 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-[#F5F3EF] border border-[#D8D6D1]/70">
              {currentMedia?.type === 'video' ? (
                <video
                  src={currentMedia.src}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={currentMedia?.src}
                  alt={product.name}
                  onClick={() => setZoomed((z) => !z)}
                  className={`h-full w-full object-cover transition-transform duration-500 cursor-zoom-in ${
                    zoomed ? 'scale-150 cursor-zoom-out' : 'scale-100'
                  }`}
                />
              )}

              {currentMedia?.type === 'image' && (
                <button
                  type="button"
                  onClick={() => setZoomed((z) => !z)}
                  aria-label={zoomed ? 'Reset zoom' : 'Zoom image'}
                  className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-[#FFFFFF]/90 border border-[#D8D6D1] px-3 py-1.5 text-[11px] tracking-[0.14em] uppercase text-[#242424]"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                  {zoomed ? 'Reset' : 'Zoom'}
                </button>
              )}
            </div>

            {mediaItems.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {mediaItems.map((m, idx) => (
                  <button
                    key={`${m.src}-${idx}`}
                    type="button"
                    onClick={() => {
                      setActiveMediaIndex(idx);
                      setZoomed(false);
                    }}
                    aria-label={`View media ${idx + 1}`}
                    className={`h-20 w-20 shrink-0 overflow-hidden border transition-colors bg-[#F5F3EF] ${
                      idx === activeMediaIndex ? 'border-[#242424]' : 'border-[#D8D6D1]'
                    }`}
                  >
                    {m.type === 'video' ? (
                      <div className="flex h-full w-full items-center justify-center bg-[#242424] text-[#FFFFFF] text-[10px] tracking-[0.14em] uppercase">
                        Film
                      </div>
                    ) : (
                      <img src={m.src} alt="" className="h-full w-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Contiguous Purchase Module */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-[#A8A29A] mb-2">
                <span>{product.category}</span>
                {product.isLimitedEdition && (
                  <>
                    <span>·</span>
                    <span>Limited Edition</span>
                  </>
                )}
                {salesCount > 0 && (
                  <>
                    <span>·</span>
                    <span>
                      {salesCount} {salesCount === 1 ? 'Client Order' : 'Client Orders'}
                    </span>
                  </>
                )}
              </div>

              <h1 className="font-editorial text-3xl md:text-4xl text-[#242424] leading-tight">
                {product.name}
              </h1>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-xl font-medium text-[#242424] tabular-nums">
                  {formatEgp(product.priceEgp)}
                </span>
                {product.isSamplePrice && (
                  <span className="text-xs text-[#A8A29A]">
                    Sample catalog price (final EGP MSRP confirmed on Drop 001)
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#242424]/80">{product.shortDescription}</p>

            {/* Real Inventory Status */}
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`font-medium ${
                  stockInfo.tone === 'out'
                    ? 'text-red-700'
                    : stockInfo.tone === 'low'
                    ? 'text-[#242424]'
                    : 'text-[#242424]/80'
                }`}
              >
                {stockInfo.label}
              </span>
              <span className="text-[#A8A29A]">·</span>
              <span className="text-[#A8A29A] tabular-nums">{product.stock} units in Cairo vault</span>
            </div>

            {/* Variations */}
            {product.variations.length > 0 && (
              <div>
                <p className="text-[11px] tracking-[0.16em] uppercase text-[#A8A29A] mb-2.5">
                  Finish / Color: <span className="text-[#242424]">{selectedVariation}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variations.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setSelectedVariation(v.name)}
                      className={`flex items-center gap-2 border px-3.5 py-2 text-xs transition-colors ${
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

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-[11px] tracking-[0.16em] uppercase text-[#A8A29A] mb-2.5">
                  Size / Fit
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`border px-3.5 py-2 text-xs transition-colors ${
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

            {/* Quantity + Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-[#D8D6D1]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="p-3.5 text-[#242424] hover:bg-[#F5F3EF]"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-4 text-sm tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    aria-label="Increase quantity"
                    className="p-3.5 text-[#242424] hover:bg-[#F5F3EF] disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() =>
                    addToCart({
                      productId: product.id,
                      variation: selectedVariation,
                      size: selectedSize,
                      quantity,
                    })
                  }
                  className="flex-1 bg-[#242424] text-[#FFFFFF] py-3.5 px-6 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-[#3A3A3A] disabled:opacity-40 transition-colors"
                >
                  {product.stock <= 0 ? 'Out of Stock' : 'ADD TO BAG'}
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                  className="border border-[#D8D6D1] p-3.5 text-[#242424] hover:border-[#242424] transition-colors"
                >
                  <Heart className={`h-4 w-4 ${isSaved ? 'fill-[#242424]' : ''}`} />
                </button>
              </div>

              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={() => {
                  addToCart({
                    productId: product.id,
                    variation: selectedVariation,
                    size: selectedSize,
                    quantity,
                  });
                  navigate('/checkout');
                }}
                className="w-full border border-[#242424] bg-[#FFFFFF] text-[#242424] py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-[#F5F3EF] disabled:opacity-40 transition-colors"
              >
                BUY NOW
              </button>
            </div>

            {/* Trust & Egypt Delivery Assurance */}
            <div className="border-t border-[#D8D6D1] pt-5 space-y-3 text-xs text-[#242424]/80">
              <div className="flex items-start gap-3">
                <Truck className="h-4 w-4 shrink-0 mt-0.5 stroke-[1.5]" />
                <span>
                  24–72 hour courier delivery across Egypt. Complimentary delivery on orders over{' '}
                  {formatEgp(15000)}.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 stroke-[1.5]" />
                <span>
                  Delivered in signature 911 foil-crest presentation box with cotton dust pouch. Cash on Delivery active.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="h-4 w-4 shrink-0 mt-0.5 stroke-[1.5]" />
                <span>
                  14-day return &amp; exchange eligibility on unworn pieces in original packaging.{' '}
                  <a
                    href="https://wa.me/201000000911"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-[#242424] hover:text-[#A8A29A]"
                  >
                    Ask WhatsApp Concierge
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Below Purchase Area: Story, Materials & Specs, Care, Shipping */}
        <div className="mt-16 pt-14 border-t border-[#D8D6D1] grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#A8A29A]">
              Craft &amp; Purpose
            </p>
            <h2 className="font-editorial text-3xl text-[#242424]">The Piece in Detail</h2>
            <p className="text-sm leading-relaxed text-[#242424]/80">{product.story}</p>
            {product.dimensions && (
              <p className="text-xs text-[#242424]/70 pt-2">
                <span className="uppercase tracking-[0.14em] text-[#A8A29A] mr-2">Dimensions:</span>
                {product.dimensions}
              </p>
            )}
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-[#F5F3EF] border border-[#D8D6D1]/80 p-6 space-y-4">
              <h3 className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#242424]">
                Materials &amp; Specifications
              </h3>
              <ul className="space-y-2 text-xs text-[#242424]/85">
                {product.materials.map((m) => (
                  <li key={m} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#A8A29A] shrink-0" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
              {product.specifications.length > 0 && (
                <dl className="pt-3 border-t border-[#D8D6D1] space-y-2 text-xs">
                  {product.specifications.map((s) => (
                    <div key={s.label} className="flex justify-between gap-4">
                      <dt className="text-[#A8A29A]">{s.label}</dt>
                      <dd className="text-[#242424] text-right">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            <div className="bg-[#F5F3EF] border border-[#D8D6D1]/80 p-6 space-y-4">
              <h3 className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#242424]">
                Care, Delivery &amp; Warranty
              </h3>
              <p className="text-xs leading-relaxed text-[#242424]/80">
                <strong className="font-medium text-[#242424]">Care:</strong> {product.careInstructions}
              </p>
              <p className="text-xs leading-relaxed text-[#242424]/80">
                <strong className="font-medium text-[#242424]">Egypt Courier:</strong> Same-day or next-day in Cairo &amp; Giza; 2–3 business days to Alexandria, Delta, Red Sea, and Upper Egypt.
              </p>
              {product.warrantyInfo && (
                <p className="text-xs leading-relaxed text-[#242424]/80">
                  <strong className="font-medium text-[#242424]">Coverage:</strong> {product.warrantyInfo}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Client Reviews for this Product */}
        <div className="mt-16 pt-14 border-t border-[#D8D6D1] grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#A8A29A]">
              Client Feedback
            </p>
            <h2 className="font-editorial text-3xl text-[#242424]">Share Your Experience</h2>
            <form onSubmit={handleReviewSubmit} className="space-y-3 pt-2">
              <input
                type="text"
                required
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Your Name"
                className="w-full border border-[#D8D6D1] px-3.5 py-2.5 text-sm focus:border-[#242424] focus:outline-none"
              />
              <input
                type="email"
                value={reviewerEmail}
                onChange={(e) => setReviewerEmail(e.target.value)}
                placeholder="Order Email (verifies purchase status)"
                className="w-full border border-[#D8D6D1] px-3.5 py-2.5 text-sm focus:border-[#242424] focus:outline-none"
              />
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[#A8A29A] uppercase tracking-[0.14em]">Rating:</span>
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReviewRating(r)}
                    aria-label={`Rate ${r} stars`}
                    className="p-1"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        r <= reviewRating ? 'fill-[#242424] text-[#242424]' : 'text-[#D8D6D1]'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                required
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Write an honest note on fit, materials, and unboxing..."
                className="w-full border border-[#D8D6D1] px-3.5 py-2.5 text-sm focus:border-[#242424] focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#242424] text-[#FFFFFF] px-6 py-3 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-[#3A3A3A]"
              >
                Submit Review
              </button>
              {reviewNotice && <p className="text-xs text-[#242424]">{reviewNotice}</p>}
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-[#A8A29A] py-6">
                No reviews yet for this piece. Submit your impressions after delivery.
              </p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-[#F5F3EF] border border-[#D8D6D1]/70 p-6">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-medium text-[#242424]">{rev.customerName}</span>
                    <span className="text-[11px] uppercase tracking-[0.12em] text-[#A8A29A]">
                      {rev.verifiedPurchase ? 'Verified Purchase' : 'Submitted Review'}
                      {rev.isSample ? ' · Sample' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-[#242424]" />
                    ))}
                  </div>
                  <p className="text-sm text-[#242424]/85">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Complete the Look */}
        {completeLook.length > 0 && (
          <div className="mt-16 pt-14 border-t border-[#D8D6D1]">
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#A8A29A] mb-2">
              Curated Pairing
            </p>
            <h2 className="font-editorial text-3xl text-[#242424] mb-8">Complete the Look</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {completeLook.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}

        {/* You May Also Like */}
        {related.length > 0 && (
          <div className="mt-16 pt-14 border-t border-[#D8D6D1]">
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#A8A29A] mb-2">
              From the Same Collection
            </p>
            <h2 className="font-editorial text-3xl text-[#242424] mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentProducts.length > 0 && (
          <div className="mt-16 pt-14 border-t border-[#D8D6D1]">
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#A8A29A] mb-2">
              Your Session History
            </p>
            <h2 className="font-editorial text-3xl text-[#242424] mb-8">Recently Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
              {recentProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
