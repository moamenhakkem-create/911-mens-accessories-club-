import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatEgp } from '../lib/commerce';
import type {
  AdminOverview,
  CategorySlug,
  OrderStatus,
  PaymentStatus,
  Product,
  Reel,
  SiteSettings,
} from '../lib/types';

type AdminTab = 'analytics' | 'products' | 'reels' | 'orders' | 'customers' | 'marketing';

export const AdminPage: React.FC = () => {
  const { user, token, login, refreshStorefront } = useStore();
  const [tab, setTab] = useState<AdminTab>('analytics');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Login state if not admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // New Product Form
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState<CategorySlug>('watches');
  const [newProdPrice, setNewProdPrice] = useState('12500');
  const [newProdStock, setNewProdStock] = useState('8');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('/assets/911/watch_heritage_auto.jpg');

  // New Reel Form
  const [newReelTitle, setNewReelTitle] = useState('');
  const [newReelDesc, setNewReelDesc] = useState('');
  const [newReelVideo, setNewReelVideo] = useState('/assets/911/reels/reel_golf_fairway.mp4');
  const [newReelCover, setNewReelCover] = useState('/assets/911/cap_fairway_white.jpg');
  const [newReelProdId, setNewReelProdId] = useState('');

  const loadAdmin = useCallback(async () => {
    if (!token || user?.role !== 'admin') return;
    const res = await fetch('/api/admin/overview', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setOverview(data.overview);
      setProducts(data.products);
      setReels(data.reels);
      setSettings(data.settings);
      if (data.products.length > 0 && !newReelProdId) {
        setNewReelProdId(data.products[0].id);
      }
    }
  }, [token, user?.role]);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  const handleFileUpload = async (
    file: File,
    onDone: (url: string) => void
  ) => {
    if (!token) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filename: file.name, dataUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        onDone(data.url);
        setNotice(`Uploaded ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!user || user.role !== 'admin') {
    return (
      <main className="bg-[#FFFFFF] min-h-[75vh] py-16 px-6">
        <div className="mx-auto max-w-md border border-[#D8D6D1] bg-[#F5F3EF] p-8 space-y-5">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A]">
            911 House Operations
          </p>
          <h1 className="font-editorial text-3xl text-[#242424]">Admin Portal Sign In</h1>
          <p className="text-xs text-[#242424]/75">
            Authorized administrator credentials required to manage inventory, orders, 911 Reels, and analytics.
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoginError(null);
              const res = await login(email, password);
              if (!res.ok) setLoginError(res.error || 'Authentication failed');
            }}
            className="space-y-3"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
              className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-3.5 py-3 text-sm"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-3.5 py-3 text-sm"
            />
            {loginError && <p className="text-xs text-red-700">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-[#242424] text-[#FFFFFF] py-3 text-[11px] font-medium tracking-[0.18em] uppercase"
            >
              Sign In to Admin
            </button>
          </form>

          <div className="pt-4 border-t border-[#D8D6D1]">
            <button
              type="button"
              onClick={() => login('admin@911.eg', 'Club911Admin!')}
              className="w-full border border-[#242424] bg-[#FFFFFF] py-2.5 text-[11px] font-medium tracking-[0.16em] uppercase text-[#242424]"
            >
              Use Demo Admin Account (admin@911.eg)
            </button>
          </div>
        </div>
      </main>
    );
  }

  const updateProductField = async (id: string, patch: Partial<Product>) => {
    if (!token) return;
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setNotice('Product updated across Storefront and 911 Reels.');
      await Promise.all([loadAdmin(), refreshStorefront()]);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: newProdName,
        category: newProdCat,
        priceEgp: Number(newProdPrice),
        stock: Number(newProdStock),
        shortDescription: newProdDesc || 'Signature 911 release.',
        images: [newProdImage],
        isNewArrival: true,
        isSamplePrice: false,
      }),
    });
    if (res.ok) {
      setNewProdName('');
      setNewProdDesc('');
      setNotice('New product published to catalog.');
      await Promise.all([loadAdmin(), refreshStorefront()]);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!token) return;
    await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotice('Product removed.');
    await Promise.all([loadAdmin(), refreshStorefront()]);
  };

  const handleCreateReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const res = await fetch('/api/admin/reels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: newReelTitle,
        description: newReelDesc,
        videoUrl: newReelVideo,
        coverImage: newReelCover,
        productId: newReelProdId,
        published: true,
      }),
    });
    if (res.ok) {
      setNewReelTitle('');
      setNewReelDesc('');
      setNotice('Reel published and linked to live product inventory.');
      await Promise.all([loadAdmin(), refreshStorefront()]);
    }
  };

  const handleReorderReel = async (idx: number, dir: -1 | 1) => {
    if (!token) return;
    const sorted = [...reels].sort((a, b) => a.sortOrder - b.sortOrder);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    [sorted[idx], sorted[swapIdx]] = [sorted[swapIdx], sorted[idx]];
    await fetch('/api/admin/reels/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderedIds: sorted.map((r) => r.id) }),
    });
    await Promise.all([loadAdmin(), refreshStorefront()]);
  };

  const handleUpdateOrder = async (
    orderId: string,
    orderStatus: OrderStatus,
    paymentStatus: PaymentStatus
  ) => {
    if (!token) return;
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderStatus, paymentStatus }),
    });
    setNotice('Order status updated.');
    await Promise.all([loadAdmin(), refreshStorefront()]);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !settings) return;
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      setNotice('Storefront marketing copy updated.');
      await refreshStorefront();
    }
  };

  return (
    <main className="bg-[#FFFFFF] min-h-[80vh] py-10 px-6 md:px-10">
      <div className="mx-auto max-w-[1440px] space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#D8D6D1] pb-6">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-1">
              911.EG · Operations Console
            </p>
            <h1 className="font-editorial text-3xl md:text-4xl text-[#242424]">
              Admin Dashboard
            </h1>
          </div>
          {notice && (
            <p className="text-xs bg-[#F5F3EF] border border-[#D8D6D1] px-4 py-2 text-[#242424]">
              {notice}
            </p>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-[#D8D6D1] pb-3">
          {(
            [
              ['analytics', 'Analytics'],
              ['products', 'Products'],
              ['reels', '911 Reels Manager'],
              ['orders', 'Orders'],
              ['customers', 'Customers & Club'],
              ['marketing', 'Marketing & Banners'],
            ] as Array<[AdminTab, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-4 py-2 text-[11px] font-medium tracking-[0.16em] uppercase whitespace-nowrap transition-colors ${
                tab === id
                  ? 'bg-[#242424] text-[#FFFFFF]'
                  : 'bg-[#F5F3EF] text-[#242424] hover:bg-[#D8D6D1]/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ANALYTICS TAB */}
        {tab === 'analytics' && overview && (
          <div className="space-y-10">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                ['Revenue (Active)', formatEgp(overview.totalRevenueEgp)],
                ['Confirmed Orders', String(overview.totalOrders)],
                ['Average Order Value', formatEgp(overview.averageOrderValueEgp)],
                ['Product Views', String(overview.totalProductViews)],
                ['Conversion Rate', `${overview.conversionRatePct}%`],
              ].map(([label, val]) => (
                <div key={label} className="bg-[#F5F3EF] border border-[#D8D6D1] p-5">
                  <p className="text-[11px] tracking-[0.14em] uppercase text-[#A8A29A]">{label}</p>
                  <p className="text-2xl font-medium text-[#242424] tabular-nums mt-2">{val}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="border border-[#D8D6D1] p-6">
                <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-[#242424] mb-4">
                  Best-Selling Pieces (By Real Orders)
                </h2>
                <div className="divide-y divide-[#D8D6D1]/70 text-sm">
                  {overview.bestSellers.map((bs) => (
                    <div key={bs.productId} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#242424]">{bs.name}</p>
                        <p className="text-xs text-[#A8A29A] tabular-nums">
                          {bs.unitsSold} units sold
                        </p>
                      </div>
                      <span className="tabular-nums font-medium">{formatEgp(bs.revenueEgp)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-[#D8D6D1] p-6 overflow-x-auto">
                <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-[#242424] mb-4">
                  911 Reels Attribution &amp; Engagement
                </h2>
                <table className="w-full text-xs text-left">
                  <thead className="border-b border-[#D8D6D1] text-[#A8A29A] uppercase">
                    <tr>
                      <th className="py-2 pr-3">Reel</th>
                      <th className="py-2 px-2">Views</th>
                      <th className="py-2 px-2">Likes</th>
                      <th className="py-2 px-2">Saves</th>
                      <th className="py-2 px-2">Clicks</th>
                      <th className="py-2 px-2">Bag</th>
                      <th className="py-2 pl-2">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8D6D1]/50 tabular-nums">
                    {overview.reelsAnalytics.map((ra) => (
                      <tr key={ra.id}>
                        <td className="py-2.5 pr-3 font-medium text-[#242424] max-w-[160px] truncate">
                          {ra.title}
                        </td>
                        <td className="py-2.5 px-2">{ra.views}</td>
                        <td className="py-2.5 px-2">{ra.likes}</td>
                        <td className="py-2.5 px-2">{ra.saves}</td>
                        <td className="py-2.5 px-2">{ra.productClicks}</td>
                        <td className="py-2.5 px-2">{ra.addToCartCount}</td>
                        <td className="py-2.5 pl-2 font-medium">{ra.attributedPurchases}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div className="space-y-10">
            <form
              onSubmit={handleAddProduct}
              className="bg-[#F5F3EF] border border-[#D8D6D1] p-6 space-y-4"
            >
              <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-[#242424] flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add New Product
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Product Name"
                  className="border border-[#D8D6D1] bg-[#FFFFFF] px-3 py-2.5 text-sm"
                />
                <select
                  value={newProdCat}
                  onChange={(e) => setNewProdCat(e.target.value as CategorySlug)}
                  className="border border-[#D8D6D1] bg-[#FFFFFF] px-3 py-2.5 text-sm"
                >
                  <option value="watches">Watches</option>
                  <option value="bracelets">Bracelets</option>
                  <option value="bags">Bags</option>
                  <option value="wallets">Wallets</option>
                  <option value="sunglasses">Sunglasses</option>
                  <option value="caps">Caps</option>
                </select>
                <input
                  type="number"
                  required
                  min={100}
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  placeholder="Price (EGP)"
                  className="border border-[#D8D6D1] bg-[#FFFFFF] px-3 py-2.5 text-sm"
                />
                <input
                  type="number"
                  required
                  min={0}
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(e.target.value)}
                  placeholder="Stock"
                  className="border border-[#D8D6D1] bg-[#FFFFFF] px-3 py-2.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Short Factual Description"
                  className="border border-[#D8D6D1] bg-[#FFFFFF] px-3 py-2.5 text-sm"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    placeholder="Image URL"
                    className="flex-1 border border-[#D8D6D1] bg-[#FFFFFF] px-3 py-2.5 text-sm"
                  />
                  <label className="cursor-pointer border border-[#242424] bg-[#FFFFFF] px-3.5 py-2.5 text-[11px] uppercase tracking-[0.14em] inline-flex items-center gap-1.5 whitespace-nowrap">
                    <Upload className="h-3.5 w-3.5" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, setNewProdImage);
                      }}
                    />
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="bg-[#242424] text-[#FFFFFF] px-6 py-2.5 text-[11px] font-medium tracking-[0.18em] uppercase"
              >
                Publish Product
              </button>
            </form>

            <div className="border border-[#D8D6D1] overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F5F3EF] border-b border-[#D8D6D1] text-[11px] uppercase tracking-[0.14em] text-[#A8A29A]">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Price (EGP)</th>
                    <th className="py-3 px-3">Stock</th>
                    <th className="py-3 px-3">New Arrival</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D6D1]/70">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="h-11 w-10 object-cover bg-[#F5F3EF]"
                          />
                          <span className="font-medium text-[#242424]">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs uppercase text-[#A8A29A]">{p.category}</td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          aria-label={`Price for ${p.name}`}
                          defaultValue={p.priceEgp}
                          onBlur={(e) => {
                            const val = Number(e.target.value);
                            if (val > 0 && val !== p.priceEgp) {
                              updateProductField(p.id, { priceEgp: val, isSamplePrice: false });
                            }
                          }}
                          className="w-28 border border-[#D8D6D1] px-2.5 py-1 text-xs tabular-nums"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          aria-label={`Stock for ${p.name}`}
                          defaultValue={p.stock}
                          onBlur={(e) => {
                            const val = Number(e.target.value);
                            if (val >= 0 && val !== p.stock) {
                              updateProductField(p.id, { stock: val });
                            }
                          }}
                          className="w-20 border border-[#D8D6D1] px-2.5 py-1 text-xs tabular-nums"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={p.isNewArrival}
                          aria-label={`New arrival toggle for ${p.name}`}
                          onChange={(e) =>
                            updateProductField(p.id, { isNewArrival: e.target.checked })
                          }
                          className="accent-[#242424]"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          aria-label={`Delete ${p.name}`}
                          className="p-1.5 text-[#A8A29A] hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REELS MANAGER TAB */}
        {tab === 'reels' && (
          <div className="space-y-10">
            <form
              onSubmit={handleCreateReel}
              className="bg-[#F5F3EF] border border-[#D8D6D1] p-6 space-y-4"
            >
              <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-[#242424]">
                Publish New 911 Reel
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  required
                  value={newReelTitle}
                  onChange={(e) => setNewReelTitle(e.target.value)}
                  placeholder="Reel Title"
                  className="border border-[#D8D6D1] bg-[#FFFFFF] px-3 py-2.5 text-sm"
                />
                <select
                  value={newReelProdId}
                  onChange={(e) => setNewReelProdId(e.target.value)}
                  className="border border-[#D8D6D1] bg-[#FFFFFF] px-3 py-2.5 text-sm"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      Linked Product: {p.name} ({formatEgp(p.priceEgp)})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newReelDesc}
                  onChange={(e) => setNewReelDesc(e.target.value)}
                  placeholder="Short Description"
                  className="border border-[#D8D6D1] bg-[#FFFFFF] px-3 py-2.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={newReelVideo}
                    onChange={(e) => setNewReelVideo(e.target.value)}
                    placeholder="Video URL (.mp4)"
                    className="flex-1 border border-[#D8D6D1] bg-[#FFFFFF] px-3 py-2.5 text-sm"
                  />
                  <label className="cursor-pointer border border-[#242424] bg-[#FFFFFF] px-3 py-2.5 text-[11px] uppercase tracking-[0.14em] inline-flex items-center gap-1.5 whitespace-nowrap">
                    <Upload className="h-3.5 w-3.5" />
                    Video
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, setNewReelVideo);
                      }}
                    />
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newReelCover}
                    onChange={(e) => setNewReelCover(e.target.value)}
                    placeholder="Cover Image URL"
                    className="flex-1 border border-[#D8D6D1] bg-[#FFFFFF] px-3 py-2.5 text-sm"
                  />
                  <label className="cursor-pointer border border-[#242424] bg-[#FFFFFF] px-3 py-2.5 text-[11px] uppercase tracking-[0.14em] inline-flex items-center gap-1.5 whitespace-nowrap">
                    <Upload className="h-3.5 w-3.5" />
                    Cover
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, setNewReelCover);
                      }}
                    />
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="bg-[#242424] text-[#FFFFFF] px-6 py-2.5 text-[11px] font-medium tracking-[0.18em] uppercase"
              >
                Publish Reel
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reels
                .slice()
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((r, idx, arr) => {
                  const linked = products.find((p) => p.id === r.productId);
                  return (
                    <div key={r.id} className="border border-[#D8D6D1] p-5 flex gap-4">
                      <video
                        src={r.videoUrl}
                        poster={r.coverImage}
                        muted
                        loop
                        playsInline
                        controls
                        className="h-44 w-24 shrink-0 object-cover bg-[#242424]"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] uppercase tracking-[0.14em] text-[#A8A29A]">
                              #{r.sortOrder} · {r.published ? 'Published' : 'Unpublished'}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleReorderReel(idx, -1)}
                                aria-label="Move reel up"
                                className="p-1 border border-[#D8D6D1] disabled:opacity-30"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === arr.length - 1}
                                onClick={() => handleReorderReel(idx, 1)}
                                aria-label="Move reel down"
                                className="p-1 border border-[#D8D6D1] disabled:opacity-30"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <h3 className="font-medium text-sm text-[#242424] mt-1">{r.title}</h3>
                          <p className="text-xs text-[#A8A29A] mt-1">
                            Product: {linked ? `${linked.name} (${formatEgp(linked.priceEgp)})` : 'None'}
                          </p>
                          <p className="text-[11px] text-[#242424]/75 tabular-nums mt-2">
                            {r.views} views · {r.likedBy.length} likes · {r.productClicks} clicks ·{' '}
                            {r.attributedPurchases} orders
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-3">
                          <button
                            type="button"
                            onClick={async () => {
                              await fetch(`/api/admin/reels/${r.id}`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ published: !r.published }),
                              });
                              await Promise.all([loadAdmin(), refreshStorefront()]);
                            }}
                            className="border border-[#D8D6D1] px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] inline-flex items-center gap-1.5"
                          >
                            {r.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            {r.published ? 'Unpublish' : 'Publish'}
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              await fetch(`/api/admin/reels/${r.id}`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              await Promise.all([loadAdmin(), refreshStorefront()]);
                            }}
                            className="border border-[#D8D6D1] px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && overview && (
          <div className="space-y-4">
            {overview.orders.map((ord) => (
              <div key={ord.id} className="border border-[#D8D6D1] p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium tabular-nums">
                      Order #{ord.orderNumber} · {ord.customerName}
                    </p>
                    <p className="text-xs text-[#A8A29A]">
                      {ord.phone} · {ord.city}, {ord.governorate} · {ord.addressLine}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      aria-label={`Order status for ${ord.orderNumber}`}
                      value={ord.orderStatus}
                      onChange={(e) =>
                        handleUpdateOrder(
                          ord.id,
                          e.target.value as OrderStatus,
                          ord.paymentStatus
                        )
                      }
                      className="border border-[#D8D6D1] px-3 py-1.5 text-xs"
                    >
                      {['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        )
                      )}
                    </select>
                    <select
                      aria-label={`Payment status for ${ord.orderNumber}`}
                      value={ord.paymentStatus}
                      onChange={(e) =>
                        handleUpdateOrder(
                          ord.id,
                          ord.orderStatus,
                          e.target.value as PaymentStatus
                        )
                      }
                      className="border border-[#D8D6D1] px-3 py-1.5 text-xs"
                    >
                      {['Pending COD', 'Paid', 'Refunded'].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm font-medium tabular-nums ml-2">
                      {formatEgp(ord.totalEgp)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-[#242424]/80 border-t border-[#D8D6D1]/60 pt-2 flex flex-wrap gap-x-6 gap-y-1">
                  {ord.items.map((it, idx) => (
                    <span key={idx}>
                      {it.name} ({it.variation}) × {it.quantity}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CUSTOMERS & SUBSCRIBERS TAB */}
        {tab === 'customers' && overview && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 border border-[#D8D6D1] p-6 overflow-x-auto">
              <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-[#242424] mb-4">
                Customer Accounts ({overview.customers.length}) · Club Members: {overview.clubMembersCount}
              </h2>
              <table className="w-full text-xs text-left">
                <thead className="border-b border-[#D8D6D1] text-[#A8A29A] uppercase">
                  <tr>
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3">Club #</th>
                    <th className="py-2 px-3">Orders</th>
                    <th className="py-2 pl-3 text-right">Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D6D1]/50 tabular-nums">
                  {overview.customers.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2.5 pr-3 font-medium">{c.name}</td>
                      <td className="py-2.5 px-3">{c.email}</td>
                      <td className="py-2.5 px-3">{c.clubNumber || '—'}</td>
                      <td className="py-2.5 px-3">{c.orderCount}</td>
                      <td className="py-2.5 pl-3 text-right">{formatEgp(c.totalSpentEgp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:col-span-4 border border-[#D8D6D1] p-6">
              <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-[#242424] mb-4">
                Newsletter Subscribers ({overview.newsletterSubscribers.length})
              </h2>
              <ul className="divide-y divide-[#D8D6D1]/50 text-xs">
                {overview.newsletterSubscribers.map((sub) => (
                  <li key={sub.email} className="py-2.5 flex justify-between gap-2">
                    <span className="truncate">{sub.email}</span>
                    <span className="text-[#A8A29A] shrink-0">
                      {new Date(sub.subscribedAt).toLocaleDateString('en-EG')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* MARKETING TAB */}
        {tab === 'marketing' && settings && (
          <form onSubmit={handleSaveSettings} className="max-w-2xl bg-[#F5F3EF] border border-[#D8D6D1] p-7 space-y-5">
            <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-[#242424]">
              Homepage Hero &amp; Announcement Controls
            </h2>
            <div>
              <label className="block text-xs text-[#A8A29A] mb-1">Announcement Banner</label>
              <input
                type="text"
                value={settings.bannerText}
                onChange={(e) => setSettings({ ...settings, bannerText: e.target.value })}
                className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-3.5 py-2.5 text-sm"
              />
              <label className="flex items-center gap-2 text-xs mt-2">
                <input
                  type="checkbox"
                  checked={settings.showAnnouncementBanner}
                  onChange={(e) =>
                    setSettings({ ...settings, showAnnouncementBanner: e.target.checked })
                  }
                  className="accent-[#242424]"
                />
                Display announcement bar above header
              </label>
            </div>
            <div>
              <label className="block text-xs text-[#A8A29A] mb-1">Hero Headline</label>
              <input
                type="text"
                value={settings.heroHeadline}
                onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A8A29A] mb-1">Hero Supporting Copy</label>
              <textarea
                rows={2}
                value={settings.heroSubheadline}
                onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
                className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A8A29A] mb-1">Brand Experience Headline</label>
              <input
                type="text"
                value={settings.lifestyleHeadline}
                onChange={(e) => setSettings({ ...settings, lifestyleHeadline: e.target.value })}
                className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-3.5 py-2.5 text-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-[#242424] text-[#FFFFFF] px-7 py-3 text-[11px] font-medium tracking-[0.18em] uppercase"
            >
              Save Storefront Copy
            </button>
          </form>
        )}
      </div>
    </main>
  );
};
