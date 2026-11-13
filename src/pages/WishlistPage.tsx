import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

export const WishlistPage: React.FC = () => {
  const { products, wishlist, navigate } = useStore();
  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <main className="bg-[#FFFFFF] min-h-[70vh] py-12 md:py-16 px-6 md:px-10">
      <div className="mx-auto max-w-[1440px]">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-2">
          Saved Selection
        </p>
        <h1 className="font-editorial text-4xl md:text-5xl text-[#242424] mb-10">
          Wishlist ({savedProducts.length})
        </h1>

        {savedProducts.length === 0 ? (
          <div className="border border-[#D8D6D1] bg-[#F5F3EF] p-12 text-center">
            <p className="font-editorial text-2xl text-[#242424]">No saved pieces yet</p>
            <p className="mt-2 text-sm text-[#A8A29A]">
              Tap the heart icon on any piece to curate your personal 911 shortlist.
            </p>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="mt-6 bg-[#242424] text-[#FFFFFF] px-7 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase"
            >
              Explore Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {savedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
