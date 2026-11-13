import React, { useEffect, useState } from 'react';
import { LogOut, Shield, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatEgp } from '../lib/commerce';
import type { Order } from '../lib/types';

export const AccountPage: React.FC = () => {
  const { user, token, login, register, logout, navigate } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [joinClub, setJoinClub] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!token || !user) return;
    fetch('/api/orders/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.orders) setOrders(data.orders);
      })
      .catch(() => {});
  }, [token, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === 'login') {
      const res = await login(email, password);
      if (!res.ok) setError(res.error || 'Sign in failed.');
    } else {
      const res = await register({ name, email, phone, password, joinClub });
      if (!res.ok) setError(res.error || 'Registration failed.');
    }
  };

  if (!user) {
    return (
      <main className="bg-[#FFFFFF] min-h-[75vh] py-14 px-6">
        <div className="mx-auto max-w-md border border-[#D8D6D1] bg-[#F5F3EF] p-8 md:p-10">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-2">
            911 Men&apos;s Accessories Club
          </p>
          <h1 className="font-editorial text-3xl text-[#242424] mb-6">
            {mode === 'login' ? 'Member Sign In' : 'Create Club Account'}
          </h1>

          <div className="grid grid-cols-2 border border-[#D8D6D1] bg-[#FFFFFF] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2.5 text-[11px] font-medium tracking-[0.16em] uppercase ${
                mode === 'login' ? 'bg-[#242424] text-[#FFFFFF]' : 'text-[#242424]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-2.5 text-[11px] font-medium tracking-[0.16em] uppercase ${
                mode === 'register' ? 'bg-[#242424] text-[#FFFFFF]' : 'text-[#242424]'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-3.5 py-3 text-sm focus:border-[#242424] focus:outline-none"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Egyptian Mobile (e.g. 01012345678)"
                  className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-3.5 py-3 text-sm focus:border-[#242424] focus:outline-none"
                />
              </>
            )}

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-3.5 py-3 text-sm focus:border-[#242424] focus:outline-none"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min. 6 characters)"
              className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-3.5 py-3 text-sm focus:border-[#242424] focus:outline-none"
            />

            {mode === 'register' && (
              <label className="flex items-center gap-2.5 text-xs text-[#242424]/85 cursor-pointer">
                <input
                  type="checkbox"
                  checked={joinClub}
                  onChange={(e) => setJoinClub(e.target.checked)}
                  className="accent-[#242424]"
                />
                Enroll me in the 911 Club for early drop access
              </label>
            )}

            {error && <p className="text-xs text-red-700">{error}</p>}

            <button
              type="submit"
              className="w-full bg-[#242424] text-[#FFFFFF] py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-[#3A3A3A]"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Seeded Test Accounts Helper */}
          <div className="mt-6 pt-5 border-t border-[#D8D6D1] space-y-2 text-xs text-[#A8A29A]">
            <p className="uppercase tracking-[0.14em]">Quick Demo Access</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => login('member@911.eg', 'Club911Member!')}
                className="flex-1 border border-[#D8D6D1] bg-[#FFFFFF] py-2 text-[11px] text-[#242424] hover:border-[#242424]"
              >
                Demo Member
              </button>
              <button
                type="button"
                onClick={() => login('admin@911.eg', 'Club911Admin!')}
                className="flex-1 border border-[#D8D6D1] bg-[#FFFFFF] py-2 text-[11px] text-[#242424] hover:border-[#242424]"
              >
                Demo Admin
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#FFFFFF] min-h-[75vh] py-12 md:py-16 px-6 md:px-10">
      <div className="mx-auto max-w-[1200px] space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8D6D1] pb-6">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-1">
              {user.isClubMember ? `911 Club Member · No. ${user.clubNumber}` : '911 Client Account'}
            </p>
            <h1 className="font-editorial text-4xl text-[#242424]">{user.name}</h1>
            <p className="text-xs text-[#A8A29A] mt-1">{user.email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user.role === 'admin' && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="inline-flex items-center gap-2 bg-[#242424] text-[#FFFFFF] px-5 py-2.5 text-[11px] font-medium tracking-[0.16em] uppercase"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin Dashboard
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 border border-[#D8D6D1] px-5 py-2.5 text-[11px] font-medium tracking-[0.16em] uppercase text-[#242424] hover:border-[#242424]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Club Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#F5F3EF] border border-[#D8D6D1] p-7 space-y-5">
              <div className="flex items-center justify-between">
                <img
                  src="/assets/911/crest-trim.png"
                  alt="911 Crest"
                  className="h-14 w-auto object-contain"
                />
                <User className="h-4 w-4 text-[#A8A29A]" />
              </div>
              <div>
                <p className="text-[11px] tracking-[0.18em] uppercase text-[#A8A29A]">
                  {user.isClubMember ? 'Active Club Membership' : 'Standard Account'}
                </p>
                <p className="font-editorial text-2xl text-[#242424] mt-1">
                  {user.isClubMember ? `MEMBER · NO. ${user.clubNumber}` : user.name}
                </p>
              </div>
              <div className="pt-2 border-t border-[#D8D6D1] flex justify-between text-xs">
                <button
                  type="button"
                  onClick={() => navigate('/wishlist')}
                  className="underline text-[#242424]"
                >
                  Saved Wishlist ({user.wishlist.length})
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/orders/track')}
                  className="underline text-[#242424]"
                >
                  Track an Order
                </button>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="lg:col-span-8">
            <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-[#242424] mb-5">
              Order History ({orders.length})
            </h2>
            {orders.length === 0 ? (
              <div className="border border-[#D8D6D1] p-8 text-center text-sm text-[#A8A29A]">
                You have not placed any orders with this account yet.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="border border-[#D8D6D1] p-6 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-medium tabular-nums">Order #{ord.orderNumber}</span>
                      <span className="text-[#A8A29A]">
                        {new Date(ord.createdAt).toLocaleDateString('en-EG')} · {ord.orderStatus} ·{' '}
                        {ord.paymentStatus}
                      </span>
                    </div>
                    <div className="divide-y divide-[#D8D6D1]/50 text-sm">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="py-2 flex justify-between">
                          <span>
                            {it.name} ({it.variation}) × {it.quantity}
                          </span>
                          <span className="tabular-nums">
                            {formatEgp(it.unitPriceEgp * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#D8D6D1] text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => navigate(`/orders/track?number=${ord.orderNumber}`)}
                        className="text-xs underline font-normal text-[#242424]"
                      >
                        View Tracking
                      </button>
                      <span className="tabular-nums">{formatEgp(ord.totalEgp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
