import React, { useEffect, useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Header: React.FC = () => {
  const {
    route,
    navigate,
    collections,
    cart,
    wishlist,
    user,
    settings,
    setIsBagOpen,
    setIsSearchOpen,
  } = useStore();

  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState<'shop' | 'collections' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMegaOpen(null);
    setMobileMenuOpen(false);
  }, [route]);

  const bagCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setMegaOpen(null);
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      {settings.showAnnouncementBanner && !bannerDismissed && (
        <div className="relative bg-[#F5F3EF] border-b border-[#D8D6D1] px-8 py-1.5 text-center text-[10px] sm:text-[11px] tracking-[0.12em] uppercase text-[#242424] truncate">
          <span>{settings.bannerText}</span>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss announcement"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#A8A29A] hover:text-[#242424]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <header
        onMouseLeave={() => setMegaOpen(null)}
        className={`sticky top-0 z-40 w-full bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#D8D6D1]/80 transition-all duration-200 ${
          scrolled ? 'py-2.5' : 'py-3.5 md:py-4'
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 md:px-10">
          {/* LEFT: Desktop Navigation / Mobile Hamburger */}
          <div className="flex items-center md:w-[38%]">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-10 w-10 items-center justify-center text-[#242424] md:hidden"
            >
              <Menu className="h-5 w-5 stroke-[1.5]" />
            </button>

            <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6 lg:gap-7">
              <button
                type="button"
                onMouseEnter={() => setMegaOpen('shop')}
                onClick={() => {
                  setMegaOpen(null);
                  navigate('/shop');
                }}
                aria-expanded={megaOpen === 'shop'}
                className={`text-[11px] font-medium tracking-[0.18em] uppercase whitespace-nowrap shrink-0 transition-colors border-b pb-0.5 ${
                  route.startsWith('/shop')
                    ? 'border-[#242424] text-[#242424]'
                    : 'border-transparent text-[#242424] hover:border-[#C9BBA8]'
                }`}
              >
                SHOP
              </button>

              <a
                href="/new-arrivals"
                onClick={(e) => handleNav(e, '/new-arrivals')}
                className={`text-[11px] font-medium tracking-[0.18em] uppercase whitespace-nowrap shrink-0 transition-colors border-b pb-0.5 ${
                  route === '/new-arrivals'
                    ? 'border-[#242424] text-[#242424]'
                    : 'border-transparent text-[#242424] hover:border-[#C9BBA8]'
                }`}
              >
                NEW ARRIVALS
              </a>

              <button
                type="button"
                onMouseEnter={() => setMegaOpen('collections')}
                onClick={() => {
                  setMegaOpen(null);
                  navigate('/collections');
                }}
                aria-expanded={megaOpen === 'collections'}
                className={`text-[11px] font-medium tracking-[0.18em] uppercase whitespace-nowrap shrink-0 transition-colors border-b pb-0.5 ${
                  route === '/collections'
                    ? 'border-[#242424] text-[#242424]'
                    : 'border-transparent text-[#242424] hover:border-[#C9BBA8]'
                }`}
              >
                COLLECTIONS
              </button>

              <a
                href="/reels"
                onClick={(e) => handleNav(e, '/reels')}
                className={`text-[11px] font-medium tracking-[0.18em] uppercase whitespace-nowrap shrink-0 transition-colors border-b pb-0.5 ${
                  route === '/reels'
                    ? 'border-[#242424] text-[#242424]'
                    : 'border-transparent text-[#242424] hover:border-[#C9BBA8]'
                }`}
              >
                911 REELS
              </a>
            </nav>
          </div>

          {/* CENTER: Official 911 Logo Asset */}
          <div className="flex items-center justify-center md:w-[24%]">
            <a
              href="/"
              onClick={(e) => handleNav(e, '/')}
              aria-label="911 Men's Accessories Club Home"
              className="flex items-center justify-center py-0.5"
            >
              <img
                src="/assets/911/wordmark-trim.png"
                alt="911 Men's Accessories Club"
                className={`w-auto object-contain transition-all duration-200 ${
                  scrolled ? 'h-9 md:h-10' : 'h-10 md:h-12'
                }`}
              />
            </a>
          </div>

          {/* RIGHT: Search, Account, Wishlist, Bag */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 md:w-[38%]">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search products"
              className="flex h-10 w-10 items-center justify-center text-[#242424] hover:text-[#A8A29A] transition-colors"
            >
              <Search className="h-[18px] w-[18px] stroke-[1.5]" />
            </button>

            <a
              href="/account"
              onClick={(e) => handleNav(e, '/account')}
              aria-label={user ? `Account: ${user.name}` : 'Sign in or Account'}
              className="hidden sm:flex h-10 w-10 items-center justify-center text-[#242424] hover:text-[#A8A29A] transition-colors relative"
            >
              <User className="h-[18px] w-[18px] stroke-[1.5]" />
              {user && (
                <span className="sr-only">Signed in as {user.name}</span>
              )}
            </a>

            <a
              href="/wishlist"
              onClick={(e) => handleNav(e, '/wishlist')}
              aria-label={`Wishlist (${wishlist.length} items)`}
              className="hidden sm:flex h-10 items-center justify-center gap-1 px-2 text-[#242424] hover:text-[#A8A29A] transition-colors"
            >
              <Heart className="h-[18px] w-[18px] stroke-[1.5]" />
              {wishlist.length > 0 && (
                <span className="text-[11px] font-medium tabular-nums">{wishlist.length}</span>
              )}
            </a>

            <button
              type="button"
              onClick={() => setIsBagOpen(true)}
              aria-label={`Shopping bag (${bagCount} items)`}
              className="flex h-10 items-center justify-center gap-1.5 px-2 text-[#242424] hover:text-[#A8A29A] transition-colors"
            >
              <ShoppingBag className="h-[18px] w-[18px] stroke-[1.5]" />
              <span className="text-[11px] font-medium tabular-nums">{bagCount}</span>
            </button>
          </div>
        </div>

        {/* Luxury Mega Menu Dropdown (Desktop) */}
        {megaOpen && (
          <div className="hidden md:block absolute left-0 right-0 top-full bg-[#FFFFFF] border-b border-[#D8D6D1] shadow-sm">
            <div className="mx-auto max-w-[1440px] px-10 py-8">
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-3 flex flex-col justify-between border-r border-[#D8D6D1]/70 pr-6">
                  <div>
                    <p className="text-[11px] tracking-[0.18em] uppercase text-[#A8A29A] mb-4">
                      {megaOpen === 'shop' ? 'Curated Categories' : '911 Collections'}
                    </p>
                    <ul className="space-y-2.5">
                      <li>
                        <a
                          href="/shop"
                          onClick={(e) => handleNav(e, '/shop')}
                          className="text-sm font-medium text-[#242424] hover:text-[#A8A29A] transition-colors"
                        >
                          Shop All Pieces
                        </a>
                      </li>
                      <li>
                        <a
                          href="/new-arrivals"
                          onClick={(e) => handleNav(e, '/new-arrivals')}
                          className="text-sm text-[#242424] hover:text-[#A8A29A] transition-colors"
                        >
                          New Arrivals · Drop 001
                        </a>
                      </li>
                      {collections.map((c) => (
                        <li key={c.slug}>
                          <a
                            href={`/shop/${c.slug}`}
                            onClick={(e) => handleNav(e, `/shop/${c.slug}`)}
                            className="text-sm text-[#242424] hover:text-[#A8A29A] transition-colors"
                          >
                            {c.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-[#D8D6D1]/60 mt-6">
                    <a
                      href="/club"
                      onClick={(e) => handleNav(e, '/club')}
                      className="text-[11px] tracking-[0.16em] uppercase text-[#242424] hover:text-[#A8A29A]"
                    >
                      Enter the 911 Club →
                    </a>
                  </div>
                </div>

                <div className="col-span-9 grid grid-cols-6 gap-4">
                  {collections.map((c) => (
                    <a
                      key={c.slug}
                      href={`/shop/${c.slug}`}
                      onClick={(e) => handleNav(e, `/shop/${c.slug}`)}
                      className="group flex flex-col"
                    >
                      <div className="aspect-[3/4] w-full overflow-hidden bg-[#F5F3EF] border border-[#D8D6D1]/60 mb-2.5">
                        <img
                          src={c.editorialImage}
                          alt={c.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#242424]">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-[#A8A29A] mt-0.5">{c.subtitle}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Full-Height Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div
            className="fixed inset-0 bg-[#242424]/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex h-full w-full max-w-sm flex-col bg-[#FFFFFF] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D8D6D1] px-5 py-4">
              <img
                src="/assets/911/wordmark-trim.png"
                alt="911 Men's Accessories Club"
                className="h-9 w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 text-[#242424]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 px-6 py-6 space-y-6">
              <div>
                <p className="text-[11px] tracking-[0.18em] uppercase text-[#A8A29A] mb-3">
                  Explore
                </p>
                <ul className="space-y-3.5 text-base font-medium text-[#242424]">
                  <li>
                    <a href="/shop" onClick={(e) => handleNav(e, '/shop')} className="block py-1">
                      Shop All
                    </a>
                  </li>
                  <li>
                    <a
                      href="/new-arrivals"
                      onClick={(e) => handleNav(e, '/new-arrivals')}
                      className="block py-1"
                    >
                      New Arrivals
                    </a>
                  </li>
                  <li>
                    <a
                      href="/collections"
                      onClick={(e) => handleNav(e, '/collections')}
                      className="block py-1"
                    >
                      Collections
                    </a>
                  </li>
                  <li>
                    <a href="/reels" onClick={(e) => handleNav(e, '/reels')} className="block py-1">
                      911 Reels
                    </a>
                  </li>
                </ul>
              </div>

              <div className="border-t border-[#D8D6D1] pt-5">
                <p className="text-[11px] tracking-[0.18em] uppercase text-[#A8A29A] mb-3">
                  Categories
                </p>
                <ul className="grid grid-cols-2 gap-3 text-sm text-[#242424]">
                  {collections.map((c) => (
                    <li key={c.slug}>
                      <a
                        href={`/shop/${c.slug}`}
                        onClick={(e) => handleNav(e, `/shop/${c.slug}`)}
                        className="block py-1.5"
                      >
                        {c.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-[#D8D6D1] pt-5 space-y-3 text-sm text-[#242424]">
                <a
                  href="/account"
                  onClick={(e) => handleNav(e, '/account')}
                  className="flex items-center justify-between py-1.5"
                >
                  <span>{user ? `Account (${user.name})` : 'Sign In / Register'}</span>
                  <User className="h-4 w-4 stroke-[1.5]" />
                </a>
                <a
                  href="/wishlist"
                  onClick={(e) => handleNav(e, '/wishlist')}
                  className="flex items-center justify-between py-1.5"
                >
                  <span>Wishlist ({wishlist.length})</span>
                  <Heart className="h-4 w-4 stroke-[1.5]" />
                </a>
                <a
                  href="/orders/track"
                  onClick={(e) => handleNav(e, '/orders/track')}
                  className="block py-1.5"
                >
                  Order Tracking
                </a>
                <a
                  href="/club"
                  onClick={(e) => handleNav(e, '/club')}
                  className="block py-1.5"
                >
                  The 911 Club
                </a>
                <a
                  href="/story"
                  onClick={(e) => handleNav(e, '/story')}
                  className="block py-1.5"
                >
                  The 911 Story
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
