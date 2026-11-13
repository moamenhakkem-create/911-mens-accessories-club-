import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchOverlay } from './components/SearchOverlay';
import { BagDrawer } from './components/BagDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ReelsPage } from './pages/ReelsPage';
import { BagPage } from './pages/BagPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AccountPage } from './pages/AccountPage';
import { WishlistPage } from './pages/WishlistPage';
import {
  ClubPage,
  CollectionsPage,
  ContactPage,
  FaqPage,
  LegalPage,
  ShippingPage,
  StoryPage,
} from './pages/EditorialPages';
import { AdminPage } from './pages/AdminPage';
import type { CategorySlug } from './lib/types';

const CATEGORY_SLUGS: CategorySlug[] = [
  'watches',
  'bracelets',
  'bags',
  'wallets',
  'sunglasses',
  'caps',
];

const RouterView: React.FC = () => {
  const { route } = useStore();
  const pathname = route.split('?')[0].replace(/\/+$/, '') || '/';

  if (pathname === '/') return <HomePage />;
  if (pathname === '/shop') return <ShopPage initialCategory="all" />;
  if (pathname === '/new-arrivals') return <ShopPage initialCategory="new-arrivals" />;

  if (pathname.startsWith('/shop/')) {
    const cat = pathname.slice('/shop/'.length) as CategorySlug;
    if (CATEGORY_SLUGS.includes(cat)) {
      return <ShopPage initialCategory={cat} />;
    }
    return <ShopPage initialCategory="all" />;
  }

  if (pathname.startsWith('/product/')) {
    const slug = pathname.slice('/product/'.length);
    return <ProductDetailPage slug={slug} />;
  }

  if (pathname === '/collections') return <CollectionsPage />;
  if (pathname === '/reels') return <ReelsPage />;
  if (pathname === '/story') return <StoryPage />;
  if (pathname === '/club') return <ClubPage />;
  if (pathname === '/wishlist') return <WishlistPage />;
  if (pathname === '/bag') return <BagPage />;
  if (pathname === '/checkout') return <CheckoutPage />;
  if (pathname === '/account' || pathname === '/orders') return <AccountPage />;
  if (pathname === '/orders/track') return <OrderTrackingPage />;
  if (pathname === '/contact') return <ContactPage />;
  if (pathname === '/faq') return <FaqPage />;
  if (pathname === '/shipping') return <ShippingPage />;
  if (pathname === '/privacy') return <LegalPage type="privacy" />;
  if (pathname === '/terms') return <LegalPage type="terms" />;
  if (pathname === '/admin') return <AdminPage />;

  return <HomePage />;
};

export function App() {
  return (
    <StoreProvider>
      <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#242424]">
        <Header />
        <div className="flex-1">
          <RouterView />
        </div>
        <Footer />
        <SearchOverlay />
        <BagDrawer />
        <QuickViewModal />
      </div>
    </StoreProvider>
  );
}

export default App;
