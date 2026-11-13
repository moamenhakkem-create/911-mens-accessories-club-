import express from 'express';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { createServer as createViteServer } from 'vite';
import {
  calculateShippingEgp,
  computeSalesRanking,
  isValidEgyptianPhone,
  normalizeEgyptianPhone,
} from './src/lib/commerce.ts';
import type {
  AdminOverview,
  Order,
  OrderItemSnapshot,
  OrderStatus,
  PaymentStatus,
  Product,
  Reel,
  Review,
} from './src/lib/types.ts';
import { getStore, hashPassword, saveStore, verifyPassword, type StoredUser } from './src/server/store.ts';

const PORT = 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || '911-club-atelier-session-secret-key';

function signToken(payload: { userId: string; role: 'customer' | 'admin'; exp: number }): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token: string): { userId: string; role: 'customer' | 'admin'; exp: number } | null {
  try {
    const [data, sig] = token.split('.');
    if (!data || !sig) return null;
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const decoded = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8')) as {
      userId: string;
      role: 'customer' | 'admin';
      exp: number;
    };
    if (Date.now() > decoded.exp) return null;
    return decoded;
  } catch {
    return null;
  }
}

function getAuthUser(req: express.Request): StoredUser | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  const payload = verifyToken(token);
  if (!payload) return null;
  const store = getStore();
  return store.users.find((u) => u.id === payload.userId) || null;
}

function sanitizeUser(user: StoredUser) {
  const { passwordHash: _ignored, ...rest } = user;
  return rest;
}

function getActorKey(req: express.Request): string {
  const authUser = getAuthUser(req);
  if (authUser) return authUser.id;
  const sessionHeader = req.headers['x-session-id'];
  if (typeof sessionHeader === 'string' && sessionHeader.trim()) {
    return `session_${sessionHeader.trim().slice(0, 64)}`;
  }
  return `ip_${req.ip || 'anon'}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `piece-${Date.now()}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '35mb' }));

  const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });

  // Health
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, brand: "911 Men's Accessories Club" });
  });

  // Public bootstrap data: settings, collections, sales ranking
  app.get('/api/storefront', (_req, res) => {
    const store = getStore();
    const salesRanking = computeSalesRanking(store.orders);
    res.json({
      settings: store.settings,
      collections: store.collections,
      salesRanking,
    });
  });

  // Products
  app.get('/api/products', (_req, res) => {
    const store = getStore();
    const salesRanking = computeSalesRanking(store.orders);
    res.json({ products: store.products, salesRanking });
  });

  app.get('/api/products/:slug', (req, res) => {
    const store = getStore();
    const product = store.products.find(
      (p) => p.slug === req.params.slug || p.id === req.params.slug
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    product.views += 1;
    saveStore(store);

    const reviews = store.reviews.filter((r) => r.productId === product.id);
    const related = store.products
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 4);
    const completeTheLook = store.products
      .filter((p) => p.id !== product.id && p.category !== product.category)
      .slice(0, 3);

    res.json({
      product,
      reviews,
      related,
      completeTheLook,
      salesCount: computeSalesRanking(store.orders)[product.id] || 0,
    });
  });

  // Reviews
  app.get('/api/reviews', (req, res) => {
    const store = getStore();
    const productId = typeof req.query.productId === 'string' ? req.query.productId : undefined;
    const reviews = productId
      ? store.reviews.filter((r) => r.productId === productId)
      : store.reviews;
    res.json({ reviews });
  });

  app.post('/api/reviews', (req, res) => {
    const store = getStore();
    const { productId, customerName, email, rating, comment } = req.body as {
      productId?: string;
      customerName?: string;
      email?: string;
      rating?: number;
      comment?: string;
    };

    if (!productId || !customerName?.trim() || !comment?.trim() || !rating) {
      return res.status(400).json({ error: 'Please provide your name, rating, and review comment.' });
    }
    const product = store.products.find((p) => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const numericRating = Math.min(5, Math.max(1, Math.round(Number(rating))));
    const authUser = getAuthUser(req);
    const lookupEmail = (authUser?.email || email || '').trim().toLowerCase();

    const verifiedPurchase = Boolean(
      lookupEmail &&
        store.orders.some(
          (o) =>
            o.orderStatus !== 'Cancelled' &&
            o.email.toLowerCase() === lookupEmail &&
            o.items.some((item) => item.productId === product.id)
        )
    );

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      productId: product.id,
      productName: product.name,
      customerName: customerName.trim(),
      rating: numericRating,
      comment: comment.trim(),
      verifiedPurchase,
      isSample: false,
      createdAt: new Date().toISOString(),
    };
    store.reviews.unshift(newReview);
    saveStore(store);
    res.status(201).json({ review: newReview });
  });

  // 911 Reels
  app.get('/api/reels', (req, res) => {
    const store = getStore();
    const includeUnpublished =
      req.query.all === '1' && getAuthUser(req)?.role === 'admin';
    const reels = store.reels
      .filter((r) => includeUnpublished || r.published)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((reel) => ({
        ...reel,
        product: store.products.find((p) => p.id === reel.productId) || null,
      }));
    res.json({ reels });
  });

  app.post('/api/reels/:id/view', (req, res) => {
    const store = getStore();
    const reel = store.reels.find((r) => r.id === req.params.id);
    if (!reel) return res.status(404).json({ error: 'Reel not found' });
    reel.views += 1;
    saveStore(store);
    res.json({ views: reel.views });
  });

  app.post('/api/reels/:id/like', (req, res) => {
    const store = getStore();
    const reel = store.reels.find((r) => r.id === req.params.id);
    if (!reel) return res.status(404).json({ error: 'Reel not found' });
    const actor = getActorKey(req);
    const exists = reel.likedBy.includes(actor);
    if (exists) {
      reel.likedBy = reel.likedBy.filter((id) => id !== actor);
    } else {
      reel.likedBy.push(actor);
    }
    saveStore(store);
    res.json({ liked: !exists, likesCount: reel.likedBy.length, likedBy: reel.likedBy });
  });

  app.post('/api/reels/:id/save', (req, res) => {
    const store = getStore();
    const reel = store.reels.find((r) => r.id === req.params.id);
    if (!reel) return res.status(404).json({ error: 'Reel not found' });
    const actor = getActorKey(req);
    const exists = reel.savedBy.includes(actor);
    if (exists) {
      reel.savedBy = reel.savedBy.filter((id) => id !== actor);
    } else {
      reel.savedBy.push(actor);
    }
    saveStore(store);
    res.json({ saved: !exists, savesCount: reel.savedBy.length, savedBy: reel.savedBy });
  });

  app.post('/api/reels/:id/share', (req, res) => {
    const store = getStore();
    const reel = store.reels.find((r) => r.id === req.params.id);
    if (!reel) return res.status(404).json({ error: 'Reel not found' });
    reel.shares += 1;
    saveStore(store);
    res.json({ shares: reel.shares });
  });

  app.post('/api/reels/:id/track', (req, res) => {
    const store = getStore();
    const reel = store.reels.find((r) => r.id === req.params.id);
    if (!reel) return res.status(404).json({ error: 'Reel not found' });
    const { action } = req.body as { action?: 'productClick' | 'addToCart' };
    if (action === 'productClick') reel.productClicks += 1;
    if (action === 'addToCart') reel.addToCartCount += 1;
    saveStore(store);
    res.json({ ok: true });
  });

  app.post('/api/reels/:id/comment', (req, res) => {
    const store = getStore();
    const reel = store.reels.find((r) => r.id === req.params.id);
    if (!reel) return res.status(404).json({ error: 'Reel not found' });
    const authUser = getAuthUser(req);
    const { authorName, text } = req.body as { authorName?: string; text?: string };
    const cleanText = text?.trim();
    if (!cleanText) {
      return res.status(400).json({ error: 'Comment text is required.' });
    }
    const comment = {
      id: `cmt_${Date.now()}`,
      authorName: authUser?.name || authorName?.trim() || 'Guest Member',
      text: cleanText,
      createdAt: new Date().toISOString(),
    };
    reel.comments.unshift(comment);
    saveStore(store);
    res.status(201).json({ comment, comments: reel.comments });
  });

  // Orders & Egyptian Checkout
  app.post('/api/orders', (req, res) => {
    const store = getStore();
    const authUser = getAuthUser(req);
    const {
      customerName,
      email,
      phone,
      governorate,
      city,
      addressLine,
      notes,
      giftWrap,
      paymentMethod,
      items,
    } = req.body as {
      customerName?: string;
      email?: string;
      phone?: string;
      governorate?: string;
      city?: string;
      addressLine?: string;
      notes?: string;
      giftWrap?: boolean;
      paymentMethod?: 'cod' | 'card_pending';
      items?: Array<{
        productId: string;
        variation: string;
        size?: string;
        quantity: number;
        reelId?: string;
      }>;
    };

    if (!customerName?.trim() || !email?.trim() || !phone?.trim() || !governorate?.trim() || !city?.trim() || !addressLine?.trim()) {
      return res.status(400).json({ error: 'Please complete all required Egyptian delivery fields.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!isValidEgyptianPhone(phone)) {
      return res.status(400).json({
        error: 'Please enter a valid Egyptian mobile number (e.g. 01012345678 or +20 10 1234 5678).',
      });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your shopping bag is empty.' });
    }
    if (paymentMethod === 'card_pending') {
      return res.status(400).json({
        error:
          'Online card gateway requires Paymob / Fawry merchant credentials to be configured. Please select Cash on Delivery.',
      });
    }

    const orderItems: OrderItemSnapshot[] = [];
    let subtotalEgp = 0;

    for (const item of items) {
      const product = store.products.find((p) => p.id === item.productId);
      if (!product) {
        return res.status(400).json({ error: 'One or more products in your bag are no longer available.' });
      }
      const qty = Math.max(1, Math.round(Number(item.quantity)));
      if (product.stock < qty) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Only ${product.stock} remaining.`,
        });
      }
      subtotalEgp += product.priceEgp * qty;
      orderItems.push({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] || '/assets/911/crest.jpg',
        variation: item.variation || product.variations[0]?.name || 'Standard',
        size: item.size,
        unitPriceEgp: product.priceEgp,
        quantity: qty,
        reelId: item.reelId,
      });
    }

    // Deduct stock and attribute confirmed Reel purchases
    const attributedReels = new Set<string>();
    for (const snap of orderItems) {
      const product = store.products.find((p) => p.id === snap.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - snap.quantity);
      }
      if (snap.reelId && !attributedReels.has(snap.reelId)) {
        const reel = store.reels.find((r) => r.id === snap.reelId);
        if (reel) {
          reel.attributedPurchases += 1;
          attributedReels.add(snap.reelId);
        }
      }
    }

    const shippingEgp = calculateShippingEgp(governorate, subtotalEgp);
    const totalEgp = subtotalEgp + shippingEgp;
    const orderNumber = `911-${Math.floor(260105 + store.orders.length + Math.random() * 50)}`;

    const order: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      userId: authUser?.id,
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      phone: normalizeEgyptianPhone(phone),
      governorate: governorate.trim(),
      city: city.trim(),
      addressLine: addressLine.trim(),
      notes: notes?.trim() || undefined,
      giftWrap: Boolean(giftWrap),
      paymentMethod: 'cod',
      paymentStatus: 'Pending COD',
      orderStatus: 'Confirmed',
      items: orderItems,
      subtotalEgp,
      shippingEgp,
      totalEgp,
      createdAt: new Date().toISOString(),
    };

    store.orders.unshift(order);
    saveStore(store);
    res.status(201).json({ order });
  });

  app.get('/api/orders/track/:orderNumber', (req, res) => {
    const store = getStore();
    const query = req.params.orderNumber.trim().toUpperCase();
    const order = store.orders.find((o) => o.orderNumber.toUpperCase() === query);
    if (!order) {
      return res.status(404).json({ error: 'No order matched that tracking number.' });
    }
    res.json({ order });
  });

  app.get('/api/orders/my', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Please sign in to view order history.' });
    }
    const store = getStore();
    const orders = store.orders.filter(
      (o) => o.userId === authUser.id || o.email.toLowerCase() === authUser.email.toLowerCase()
    );
    res.json({ orders });
  });

  // Authentication & Accounts
  app.post('/api/auth/register', (req, res) => {
    const store = getStore();
    const { name, email, phone, password, joinClub } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      joinClub?: boolean;
    };
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Name, valid email, and a password of at least 6 characters are required.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (store.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const clubCount = store.users.filter((u) => u.isClubMember).length + 912;
    const newUser: StoredUser = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() ? normalizeEgyptianPhone(phone) : undefined,
      role: 'customer',
      wishlist: [],
      isClubMember: Boolean(joinClub),
      clubNumber: joinClub ? String(clubCount).padStart(4, '0') : undefined,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    store.users.push(newUser);
    saveStore(store);

    const token = signToken({
      userId: newUser.id,
      role: newUser.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ token, user: sanitizeUser(newUser) });
  });

  app.post('/api/auth/login', (req, res) => {
    const store = getStore();
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = store.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = signToken({
      userId: user.id,
      role: user.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ token, user: sanitizeUser(user) });
  });

  app.get('/api/auth/me', (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ user: sanitizeUser(user) });
  });

  app.post('/api/wishlist/toggle', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Sign in to sync wishlist across devices.' });
    }
    const { productId } = req.body as { productId?: string };
    if (!productId) return res.status(400).json({ error: 'productId required' });
    const store = getStore();
    const target = store.users.find((u) => u.id === user.id);
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.wishlist.includes(productId)) {
      target.wishlist = target.wishlist.filter((id) => id !== productId);
    } else {
      target.wishlist.push(productId);
    }
    saveStore(store);
    res.json({ wishlist: target.wishlist });
  });

  // Club & Newsletter & Contact
  app.post('/api/club/join', (req, res) => {
    const store = getStore();
    const authUser = getAuthUser(req);
    const { name, email, phone } = req.body as { name?: string; email?: string; phone?: string };
    if (authUser) {
      const target = store.users.find((u) => u.id === authUser.id);
      if (target) {
        if (!target.isClubMember) {
          target.isClubMember = true;
          target.clubNumber = String(store.users.filter((u) => u.isClubMember).length + 912).padStart(
            4,
            '0'
          );
        }
        saveStore(store);
        return res.json({ user: sanitizeUser(target), message: 'Welcome to the 911 Club.' });
      }
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!store.newsletterSubscribers.some((s) => s.email === normalizedEmail)) {
      store.newsletterSubscribers.unshift({
        email: normalizedEmail,
        subscribedAt: new Date().toISOString(),
      });
    }
    let member = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!member) {
      const clubNumber = String(store.users.filter((u) => u.isClubMember).length + 912).padStart(
        4,
        '0'
      );
      member = {
        id: `user_${Date.now()}`,
        name: name?.trim() || '911 Club Member',
        email: normalizedEmail,
        phone: phone?.trim() ? normalizeEgyptianPhone(phone) : undefined,
        role: 'customer',
        wishlist: [],
        isClubMember: true,
        clubNumber,
        passwordHash: hashPassword(crypto.randomBytes(12).toString('hex')),
        createdAt: new Date().toISOString(),
      };
      store.users.push(member);
    } else if (!member.isClubMember) {
      member.isClubMember = true;
      member.clubNumber = String(store.users.filter((u) => u.isClubMember).length + 912).padStart(
        4,
        '0'
      );
    }
    saveStore(store);
    res.status(201).json({
      clubNumber: member.clubNumber,
      message: `Club Membership #${member.clubNumber} confirmed for ${normalizedEmail}.`,
    });
  });

  app.post('/api/newsletter/subscribe', (req, res) => {
    const store = getStore();
    const { email } = req.body as { email?: string };
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    const normalized = email.trim().toLowerCase();
    if (store.newsletterSubscribers.some((s) => s.email === normalized)) {
      return res.json({ message: 'You are already subscribed to the 911 World.' });
    }
    store.newsletterSubscribers.unshift({
      email: normalized,
      subscribedAt: new Date().toISOString(),
    });
    saveStore(store);
    res.status(201).json({ message: 'Welcome to the 911 World.' });
  });

  app.post('/api/contact', (req, res) => {
    const store = getStore();
    const { name, email, phone, subject, message } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
    };
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    store.contactSubmissions.unshift({
      id: `msg_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      subject: subject?.trim() || 'Client Concierge Inquiry',
      message: message.trim(),
      createdAt: new Date().toISOString(),
    });
    saveStore(store);
    res.status(201).json({ message: 'Your inquiry has been received by the 911 Client Concierge.' });
  });

  // Admin Middleware
  const requireAdmin: express.RequestHandler = (req, res, next) => {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
  };

  // Admin Media Upload (supports base64 data URLs from admin file pickers)
  app.post('/api/admin/upload', requireAdmin, (req, res) => {
    const { filename, dataUrl } = req.body as { filename?: string; dataUrl?: string };
    if (!filename || !dataUrl || !dataUrl.includes('base64,')) {
      return res.status(400).json({ error: 'Valid file payload required.' });
    }
    const [meta, b64] = dataUrl.split('base64,');
    const extMatch = filename.match(/\.(jpg|jpeg|png|webp|mp4|webm)$/i);
    const ext = extMatch ? extMatch[0].toLowerCase() : meta.includes('video') ? '.mp4' : '.png';
    const safeName = `${Date.now()}-${slugify(filename.replace(/\.[^/.]+$/, ''))}${ext}`;
    const targetPath = path.join(uploadsDir, safeName);
    fs.writeFileSync(targetPath, Buffer.from(b64, 'base64'));
    res.status(201).json({ url: `/uploads/${safeName}` });
  });

  // Admin Overview & Analytics
  app.get('/api/admin/overview', requireAdmin, (_req, res) => {
    const store = getStore();
    const activeOrders = store.orders.filter((o) => o.orderStatus !== 'Cancelled');
    const totalRevenueEgp = activeOrders.reduce((sum, o) => sum + o.totalEgp, 0);
    const totalOrders = activeOrders.length;
    const averageOrderValueEgp = totalOrders > 0 ? Math.round(totalRevenueEgp / totalOrders) : 0;
    const totalProductViews = store.products.reduce((sum, p) => sum + (p.views || 0), 0);
    const conversionRatePct =
      totalProductViews > 0 ? Number(((totalOrders / totalProductViews) * 100).toFixed(2)) : 0;

    const salesUnits: Record<string, number> = {};
    const salesRev: Record<string, number> = {};
    for (const order of activeOrders) {
      for (const item of order.items) {
        salesUnits[item.productId] = (salesUnits[item.productId] || 0) + item.quantity;
        salesRev[item.productId] = (salesRev[item.productId] || 0) + item.unitPriceEgp * item.quantity;
      }
    }

    const bestSellers = Object.keys(salesUnits)
      .map((productId) => {
        const prod = store.products.find((p) => p.id === productId);
        return {
          productId,
          name: prod?.name || 'Archived Piece',
          unitsSold: salesUnits[productId],
          revenueEgp: salesRev[productId],
        };
      })
      .sort((a, b) => b.unitsSold - a.unitsSold);

    const customers = store.users.map((u) => {
      const userOrders = activeOrders.filter(
        (o) => o.userId === u.id || o.email.toLowerCase() === u.email.toLowerCase()
      );
      return {
        ...sanitizeUser(u),
        orderCount: userOrders.length,
        totalSpentEgp: userOrders.reduce((sum, o) => sum + o.totalEgp, 0),
      };
    });

    const reelsAnalytics = store.reels
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((r) => {
        const prod = store.products.find((p) => p.id === r.productId);
        return {
          id: r.id,
          title: r.title,
          productName: prod?.name || 'Unlinked',
          views: r.views,
          likes: r.likedBy.length,
          saves: r.savedBy.length,
          shares: r.shares,
          productClicks: r.productClicks,
          addToCartCount: r.addToCartCount,
          attributedPurchases: r.attributedPurchases,
        };
      });

    const overview: AdminOverview = {
      totalRevenueEgp,
      totalOrders,
      averageOrderValueEgp,
      totalProductViews,
      conversionRatePct,
      bestSellers,
      orders: store.orders,
      customers,
      newsletterSubscribers: store.newsletterSubscribers,
      clubMembersCount: store.users.filter((u) => u.isClubMember).length,
      reelsAnalytics,
    };

    res.json({ overview, settings: store.settings, products: store.products, reels: store.reels });
  });

  // Admin Products CRUD
  app.post('/api/admin/products', requireAdmin, (req, res) => {
    const store = getStore();
    const body = req.body as Partial<Product>;
    if (!body.name?.trim() || !body.category || !body.priceEgp) {
      return res.status(400).json({ error: 'Name, category, and price in EGP are required.' });
    }
    const id = `prod_${Date.now()}`;
    const baseSlug = slugify(body.name);
    const slug = store.products.some((p) => p.slug === baseSlug) ? `${baseSlug}-${Date.now()}` : baseSlug;
    const product: Product = {
      id,
      slug,
      name: body.name.trim(),
      category: body.category,
      priceEgp: Math.max(100, Math.round(Number(body.priceEgp))),
      isSamplePrice: Boolean(body.isSamplePrice),
      shortDescription: body.shortDescription?.trim() || 'Crafted for quiet confidence.',
      story: body.story?.trim() || body.shortDescription?.trim() || '911 signature piece.',
      images:
        Array.isArray(body.images) && body.images.length > 0
          ? body.images
          : ['/assets/911/crest.jpg'],
      videoUrl: body.videoUrl?.trim() || undefined,
      variations:
        Array.isArray(body.variations) && body.variations.length > 0
          ? body.variations
          : [{ name: 'Signature', hex: '#242424' }],
      sizes: body.sizes && body.sizes.length > 0 ? body.sizes : undefined,
      stock: Math.max(0, Math.round(Number(body.stock ?? 5))),
      isNewArrival: Boolean(body.isNewArrival),
      isLimitedEdition: Boolean(body.isLimitedEdition),
      isFeatured: Boolean(body.isFeatured),
      materials:
        Array.isArray(body.materials) && body.materials.length > 0
          ? body.materials
          : ['911 Selected Materials'],
      specifications: Array.isArray(body.specifications) ? body.specifications : [],
      dimensions: body.dimensions?.trim() || undefined,
      careInstructions: body.careInstructions?.trim() || 'Store in the 911 cotton pouch.',
      warrantyInfo: body.warrantyInfo?.trim() || undefined,
      views: 0,
      createdAt: new Date().toISOString(),
    };
    store.products.unshift(product);
    saveStore(store);
    res.status(201).json({ product });
  });

  app.patch('/api/admin/products/:id', requireAdmin, (req, res) => {
    const store = getStore();
    const product = store.products.find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const patch = req.body as Partial<Product>;
    if (patch.name !== undefined) product.name = patch.name.trim();
    if (patch.category !== undefined) product.category = patch.category;
    if (patch.priceEgp !== undefined) product.priceEgp = Math.max(100, Math.round(Number(patch.priceEgp)));
    if (patch.isSamplePrice !== undefined) product.isSamplePrice = Boolean(patch.isSamplePrice);
    if (patch.stock !== undefined) product.stock = Math.max(0, Math.round(Number(patch.stock)));
    if (patch.shortDescription !== undefined) product.shortDescription = patch.shortDescription;
    if (patch.story !== undefined) product.story = patch.story;
    if (patch.images !== undefined) product.images = patch.images;
    if (patch.videoUrl !== undefined) product.videoUrl = patch.videoUrl || undefined;
    if (patch.variations !== undefined) product.variations = patch.variations;
    if (patch.materials !== undefined) product.materials = patch.materials;
    if (patch.isNewArrival !== undefined) product.isNewArrival = Boolean(patch.isNewArrival);
    if (patch.isLimitedEdition !== undefined) product.isLimitedEdition = Boolean(patch.isLimitedEdition);
    if (patch.isFeatured !== undefined) product.isFeatured = Boolean(patch.isFeatured);
    saveStore(store);
    res.json({ product });
  });

  app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
    const store = getStore();
    store.products = store.products.filter((p) => p.id !== req.params.id);
    saveStore(store);
    res.json({ ok: true });
  });

  // Admin Orders
  app.patch('/api/admin/orders/:id', requireAdmin, (req, res) => {
    const store = getStore();
    const order = store.orders.find((o) => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const { orderStatus, paymentStatus } = req.body as {
      orderStatus?: OrderStatus;
      paymentStatus?: PaymentStatus;
    };
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    saveStore(store);
    res.json({ order });
  });

  // Admin Reels CRUD & Reorder
  app.post('/api/admin/reels', requireAdmin, (req, res) => {
    const store = getStore();
    const { title, description, videoUrl, coverImage, productId, published } = req.body as Partial<Reel>;
    if (!title?.trim() || !videoUrl?.trim() || !productId) {
      return res.status(400).json({ error: 'Title, video source, and linked product are required.' });
    }
    const maxOrder = store.reels.reduce((max, r) => Math.max(max, r.sortOrder), 0);
    const reel: Reel = {
      id: `reel_${Date.now()}`,
      title: title.trim(),
      description: description?.trim() || '',
      videoUrl: videoUrl.trim(),
      coverImage: coverImage?.trim() || '/assets/911/crest.jpg',
      productId,
      published: published ?? true,
      sortOrder: maxOrder + 1,
      views: 0,
      likedBy: [],
      savedBy: [],
      shares: 0,
      productClicks: 0,
      addToCartCount: 0,
      attributedPurchases: 0,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    store.reels.push(reel);
    saveStore(store);
    res.status(201).json({ reel });
  });

  app.patch('/api/admin/reels/:id', requireAdmin, (req, res) => {
    const store = getStore();
    const reel = store.reels.find((r) => r.id === req.params.id);
    if (!reel) return res.status(404).json({ error: 'Reel not found' });
    const patch = req.body as Partial<Reel>;
    if (patch.title !== undefined) reel.title = patch.title;
    if (patch.description !== undefined) reel.description = patch.description;
    if (patch.videoUrl !== undefined) reel.videoUrl = patch.videoUrl;
    if (patch.coverImage !== undefined) reel.coverImage = patch.coverImage;
    if (patch.productId !== undefined) reel.productId = patch.productId;
    if (patch.published !== undefined) reel.published = Boolean(patch.published);
    if (patch.sortOrder !== undefined) reel.sortOrder = Number(patch.sortOrder);
    saveStore(store);
    res.json({ reel });
  });

  app.post('/api/admin/reels/reorder', requireAdmin, (req, res) => {
    const store = getStore();
    const { orderedIds } = req.body as { orderedIds?: string[] };
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds array required' });
    }
    orderedIds.forEach((id, idx) => {
      const reel = store.reels.find((r) => r.id === id);
      if (reel) reel.sortOrder = idx + 1;
    });
    saveStore(store);
    res.json({ ok: true });
  });

  app.delete('/api/admin/reels/:id', requireAdmin, (req, res) => {
    const store = getStore();
    store.reels = store.reels.filter((r) => r.id !== req.params.id);
    saveStore(store);
    res.json({ ok: true });
  });

  // Admin Marketing / Site Settings
  app.patch('/api/admin/settings', requireAdmin, (req, res) => {
    const store = getStore();
    store.settings = { ...store.settings, ...(req.body as Record<string, unknown>) };
    saveStore(store);
    res.json({ settings: store.settings });
  });

  const httpServer = http.createServer(app);

  // Vite middleware in dev / static dist in prod
  if (process.env.NODE_ENV !== 'production') {
    const hmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
        watch: hmrDisabled ? null : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`911 Men's Accessories Club listening on http://localhost:${PORT}`);
  });
}

startServer();
