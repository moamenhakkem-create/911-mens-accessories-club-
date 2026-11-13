import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  CartItem,
  CollectionInfo,
  Product,
  Reel,
  Review,
  SiteSettings,
  UserProfile,
} from '../lib/types';

interface StoreContextValue {
  route: string;
  navigate: (to: string) => void;
  products: Product[];
  collections: CollectionInfo[];
  reels: Reel[];
  reviews: Review[];
  salesRanking: Record<string, number>;
  settings: SiteSettings;
  loading: boolean;
  user: UserProfile | null;
  token: string | null;
  sessionId: string;
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  isBagOpen: boolean;
  setIsBagOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (p: Product | null) => void;
  refreshStorefront: () => Promise<void>;
  addToCart: (item: CartItem) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => Promise<void>;
  recordRecentView: (productId: string) => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (payload: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    joinClub?: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const DEFAULT_SETTINGS: SiteSettings = {
  heroHeadline: 'WHERE HERITAGE MEETS MODERN PRECISION.',
  heroSubheadline:
    "Discover a considered collection of men's accessories designed for confidence, character, and timeless style.",
  heroPrimaryCta: 'EXPLORE COLLECTION',
  heroSecondaryCta: 'DISCOVER 911',
  bannerText: 'Complimentary courier delivery across Egypt on orders above EGP 15,000',
  showAnnouncementBanner: true,
  lifestyleHeadline: 'CONFIDENCE RUNS DEEP.',
  lifestyleSubheadline:
    'From morning tee times in New Cairo to evening engagements by the Nile, every detail is selected to speak quietly first.',
  featuredProductIds: [],
};

const StoreContext = createContext<StoreContextValue | null>(null);

function getOrCreateSessionId(): string {
  const key = '911_session_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `s_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<string>(() => window.location.pathname + window.location.search);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [salesRanking, setSalesRanking] = useState<Record<string, number>>({});
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('911_auth_token'));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessionId] = useState<string>(() => getOrCreateSessionId());

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('911_bag');
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [guestWishlist, setGuestWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('911_wishlist');
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('911_recent');
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [isBagOpen, setIsBagOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const onPopState = () => {
      setRoute(window.location.pathname + window.location.search);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to === window.location.pathname + window.location.search) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.history.pushState({}, '', to);
    setRoute(to);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    localStorage.setItem('911_bag', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('911_wishlist', JSON.stringify(guestWishlist));
  }, [guestWishlist]);

  useEffect(() => {
    localStorage.setItem('911_recent', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const refreshStorefront = useCallback(async () => {
    try {
      const [sfRes, prodRes, reelsRes, revRes] = await Promise.all([
        fetch('/api/storefront'),
        fetch('/api/products'),
        fetch('/api/reels'),
        fetch('/api/reviews'),
      ]);
      if (sfRes.ok) {
        const sf = await sfRes.json();
        setSettings(sf.settings);
        setCollections(sf.collections);
        setSalesRanking(sf.salesRanking || {});
      }
      if (prodRes.ok) {
        const pr = await prodRes.json();
        setProducts(pr.products || []);
        if (pr.salesRanking) setSalesRanking(pr.salesRanking);
      }
      if (reelsRes.ok) {
        const rl = await reelsRes.json();
        setReels(rl.reels || []);
      }
      if (revRes.ok) {
        const rv = await revRes.json();
        setReviews(rv.reviews || []);
      }
    } catch (err) {
      console.error('Storefront sync failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStorefront();
  }, [refreshStorefront]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('911_auth_token');
          setToken(null);
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, [token]);

  const wishlist = useMemo(() => {
    if (user) return user.wishlist;
    return guestWishlist;
  }, [user, guestWishlist]);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (c) =>
          c.productId === item.productId &&
          c.variation === item.variation &&
          (c.size || '') === (item.size || '')
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + item.quantity,
          reelId: item.reelId || next[idx].reelId,
        };
        return next;
      }
      return [...prev, item];
    });
    if (item.reelId) {
      fetch(`/api/reels/${item.reelId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addToCart' }),
      }).catch(() => {});
    }
    setIsBagOpen(true);
  }, []);

  const updateCartQuantity = useCallback((index: number, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      return prev.map((item, i) => (i === index ? { ...item, quantity } : item));
    });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (user && token) {
        try {
          const res = await fetch('/api/wishlist/toggle', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId }),
          });
          if (res.ok) {
            const data = await res.json();
            setUser((prev) => (prev ? { ...prev, wishlist: data.wishlist } : prev));
            return;
          }
        } catch {
          // fallback below
        }
      }
      setGuestWishlist((prev) =>
        prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
    },
    [user, token]
  );

  const recordRecentView = useCallback((productId: string) => {
    setRecentlyViewed((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, 6);
      return next;
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || 'Sign in failed' };
    }
    localStorage.setItem('911_auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return { ok: true };
  }, []);

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      phone?: string;
      password: string;
      joinClub?: boolean;
    }) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Registration failed' };
      }
      localStorage.setItem('911_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { ok: true };
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('911_auth_token');
    setToken(null);
    setUser(null);
  }, []);

  const value: StoreContextValue = {
    route,
    navigate,
    products,
    collections,
    reels,
    reviews,
    salesRanking,
    settings,
    loading,
    user,
    token,
    sessionId,
    cart,
    wishlist,
    recentlyViewed,
    isBagOpen,
    setIsBagOpen,
    isSearchOpen,
    setIsSearchOpen,
    quickViewProduct,
    setQuickViewProduct,
    refreshStorefront,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    recordRecentView,
    login,
    register,
    logout,
    setUser,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
