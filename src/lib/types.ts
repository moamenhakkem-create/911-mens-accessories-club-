export type CategorySlug =
  | 'watches'
  | 'bracelets'
  | 'bags'
  | 'wallets'
  | 'sunglasses'
  | 'caps';

export interface ProductVariation {
  name: string;
  hex: string;
  image?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  priceEgp: number;
  isSamplePrice: boolean;
  shortDescription: string;
  story: string;
  images: string[];
  videoUrl?: string;
  variations: ProductVariation[];
  sizes?: string[];
  stock: number;
  isNewArrival: boolean;
  isLimitedEdition: boolean;
  isFeatured: boolean;
  materials: string[];
  specifications: ProductSpec[];
  dimensions?: string;
  careInstructions: string;
  warrantyInfo?: string;
  views: number;
  createdAt: string;
}

export interface CollectionInfo {
  slug: CategorySlug;
  name: string;
  subtitle: string;
  description: string;
  editorialImage: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  isSample?: boolean;
  createdAt: string;
}

export interface ReelComment {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface Reel {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  coverImage: string;
  productId: string;
  published: boolean;
  sortOrder: number;
  views: number;
  likedBy: string[];
  savedBy: string[];
  shares: number;
  productClicks: number;
  addToCartCount: number;
  attributedPurchases: number;
  comments: ReelComment[];
  createdAt: string;
  product?: Product | null;
}

export interface CartItem {
  productId: string;
  variation: string;
  size?: string;
  quantity: number;
  reelId?: string;
}

export type OrderStatus = 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending COD' | 'Paid' | 'Refunded';
export type PaymentMethod = 'cod' | 'card_pending';

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  slug: string;
  image: string;
  variation: string;
  size?: string;
  unitPriceEgp: number;
  quantity: number;
  reelId?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  email: string;
  phone: string;
  governorate: string;
  city: string;
  addressLine: string;
  notes?: string;
  giftWrap: boolean;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items: OrderItemSnapshot[];
  subtotalEgp: number;
  shippingEgp: number;
  totalEgp: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  wishlist: string[];
  isClubMember: boolean;
  clubNumber?: string;
  createdAt: string;
}

export interface SiteSettings {
  heroHeadline: string;
  heroSubheadline: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  bannerText: string;
  showAnnouncementBanner: boolean;
  lifestyleHeadline: string;
  lifestyleSubheadline: string;
  featuredProductIds: string[];
}

export interface AdminOverview {
  totalRevenueEgp: number;
  totalOrders: number;
  averageOrderValueEgp: number;
  totalProductViews: number;
  conversionRatePct: number;
  bestSellers: Array<{
    productId: string;
    name: string;
    unitsSold: number;
    revenueEgp: number;
  }>;
  orders: Order[];
  customers: Array<Omit<UserProfile, 'passwordHash'> & { orderCount: number; totalSpentEgp: number }>;
  newsletterSubscribers: Array<{ email: string; subscribedAt: string }>;
  clubMembersCount: number;
  reelsAnalytics: Array<{
    id: string;
    title: string;
    productName: string;
    views: number;
    likes: number;
    saves: number;
    shares: number;
    productClicks: number;
    addToCartCount: number;
    attributedPurchases: number;
  }>;
}
