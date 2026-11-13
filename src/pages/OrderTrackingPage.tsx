import React, { useEffect, useState } from 'react';
import { PackageCheck, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatEgp } from '../lib/commerce';
import type { Order } from '../lib/types';

export const OrderTrackingPage: React.FC = () => {
  const { route } = useStore();
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lookup = async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(num.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setOrder(null);
        setError(data.error || 'Order not found.');
      } else {
        setOrder(data.order);
      }
    } catch {
      setError('Unable to check order status right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const queryStr = route.includes('?') ? route.split('?')[1] : '';
    const num = new URLSearchParams(queryStr).get('number');
    if (num) {
      setOrderNumber(num);
      lookup(num);
    }
  }, [route]);

  const steps = ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
  const currentStepIdx = order ? steps.indexOf(order.orderStatus) : -1;

  return (
    <main className="bg-[#FFFFFF] min-h-[70vh] py-14 px-6 md:px-10">
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-2">
          Customer Care · 911.EG
        </p>
        <h1 className="font-editorial text-4xl text-[#242424] mb-3">Order Tracking</h1>
        <p className="text-sm text-[#242424]/75 mb-8">
          Enter your 911 order number (for example <span className="tabular-nums font-medium">911-260101</span>) to inspect real-time fulfillment status.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookup(orderNumber);
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="911-260101"
            aria-label="Order number"
            className="flex-1 border border-[#D8D6D1] px-4 py-3 text-sm focus:border-[#242424] focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#242424] text-[#FFFFFF] px-7 py-3 text-[11px] font-medium tracking-[0.18em] uppercase inline-flex items-center gap-2"
          >
            <Search className="h-3.5 w-3.5" />
            {loading ? 'Checking...' : 'Track'}
          </button>
        </form>

        {error && <p className="mt-4 text-xs text-red-700">{error}</p>}

        {order && (
          <div className="mt-10 bg-[#F5F3EF] border border-[#D8D6D1] p-7 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D8D6D1] pb-4">
              <div className="flex items-center gap-2.5">
                <PackageCheck className="h-5 w-5 stroke-[1.5]" />
                <span className="text-sm font-medium tabular-nums">Order #{order.orderNumber}</span>
              </div>
              <span className="text-xs uppercase tracking-[0.16em] text-[#242424]">
                {order.orderStatus} · {order.paymentStatus}
              </span>
            </div>

            {order.orderStatus !== 'Cancelled' && (
              <div className="grid grid-cols-4 gap-2 text-center">
                {steps.map((step, idx) => (
                  <div key={step} className="space-y-2">
                    <div
                      className={`h-1.5 w-full ${
                        idx <= currentStepIdx ? 'bg-[#242424]' : 'bg-[#D8D6D1]'
                      }`}
                    />
                    <p
                      className={`text-[10px] tracking-[0.12em] uppercase ${
                        idx <= currentStepIdx ? 'text-[#242424] font-medium' : 'text-[#A8A29A]'
                      }`}
                    >
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs space-y-1 text-[#242424]/80">
              <p>
                <strong>Recipient:</strong> {order.customerName}
              </p>
              <p>
                <strong>Destination:</strong> {order.city}, {order.governorate}
              </p>
              <p>
                <strong>Placed:</strong> {new Date(order.createdAt).toLocaleString('en-EG')}
              </p>
            </div>

            <div className="border-t border-[#D8D6D1] pt-4 space-y-2 text-sm">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {it.name} × {it.quantity}
                  </span>
                  <span className="tabular-nums">{formatEgp(it.unitPriceEgp * it.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium pt-2 border-t border-[#D8D6D1]">
                <span>Total</span>
                <span className="tabular-nums">{formatEgp(order.totalEgp)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
