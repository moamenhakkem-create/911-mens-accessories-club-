import React, { useEffect, useState } from 'react';
import { CheckCircle2, Lock, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  calculateShippingEgp,
  EGYPT_GOVERNORATES,
  formatEgp,
  isValidEgyptianPhone,
} from '../lib/commerce';
import type { Order, PaymentMethod } from '../lib/types';

export const CheckoutPage: React.FC = () => {
  const { cart, products, user, token, clearCart, refreshStorefront, navigate } = useStore();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [governorate, setGovernorate] = useState<string>(EGYPT_GOVERNORATES[0].name);
  const [city, setCity] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [notes, setNotes] = useState('');
  const [giftWrap, setGiftWrap] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  const resolved = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { item, product } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = resolved.reduce((sum, r) => sum + r.product.priceEgp * r.item.quantity, 0);
  const shipping = calculateShippingEgp(governorate, subtotal);
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !email.trim() || !phone.trim() || !city.trim() || !addressLine.trim()) {
      setError('Please complete all required Egyptian delivery details.');
      return;
    }
    if (!isValidEgyptianPhone(phone)) {
      setError('Enter a valid Egyptian mobile number (e.g. 01012345678 or +20 10 1234 5678).');
      return;
    }
    if (paymentMethod === 'card_pending') {
      setError(
        'Online card and mobile wallet payments require Paymob / Fawry merchant credentials to be configured. Please select Cash on Delivery.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          customerName,
          email,
          phone,
          governorate,
          city,
          addressLine,
          notes,
          giftWrap,
          paymentMethod,
          items: cart,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not complete your order.');
        return;
      }
      setConfirmedOrder(data.order);
      clearCart();
      refreshStorefront();
    } catch {
      setError('Network error while confirming your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <main className="bg-[#FFFFFF] py-16 px-6 md:px-10">
        <div className="mx-auto max-w-2xl bg-[#F5F3EF] border border-[#D8D6D1] p-8 md:p-12 space-y-6">
          <div className="flex items-center gap-3 text-[#242424]">
            <CheckCircle2 className="h-6 w-6 stroke-[1.5]" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A]">
              Order Confirmed · Egypt
            </span>
          </div>

          <h1 className="font-editorial text-3xl md:text-4xl text-[#242424]">
            Order #{confirmedOrder.orderNumber} Confirmed — Preparing Shipment
          </h1>

          <p className="text-sm text-[#242424]/80 leading-relaxed">
            Thank you, {confirmedOrder.customerName}. Your 911 foil-crest package is being prepared for delivery to{' '}
            <strong>
              {confirmedOrder.city}, {confirmedOrder.governorate}
            </strong>
            . Our courier team will contact you at <span className="tabular-nums">{confirmedOrder.phone}</span> prior to arrival.
          </p>

          <div className="border-y border-[#D8D6D1] py-4 space-y-3 text-sm">
            {confirmedOrder.items.map((item, i) => (
              <div key={i} className="flex justify-between gap-4">
                <span>
                  {item.name} ({item.variation}) × {item.quantity}
                </span>
                <span className="tabular-nums">{formatEgp(item.unitPriceEgp * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs text-[#A8A29A] pt-2 border-t border-[#D8D6D1]/60">
              <span>Shipping ({confirmedOrder.governorate})</span>
              <span className="tabular-nums">
                {confirmedOrder.shippingEgp === 0 ? 'Complimentary' : formatEgp(confirmedOrder.shippingEgp)}
              </span>
            </div>
            <div className="flex justify-between font-medium text-base pt-1">
              <span>Total ({confirmedOrder.paymentStatus})</span>
              <span className="tabular-nums">{formatEgp(confirmedOrder.totalEgp)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(`/orders/track?number=${confirmedOrder.orderNumber}`)}
              className="bg-[#242424] text-[#FFFFFF] px-6 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase"
            >
              Track Order
            </button>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="border border-[#242424] text-[#242424] px-6 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#FFFFFF] py-12 md:py-16 px-6 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-2">
          911.EG · Egypt Courier Checkout
        </p>
        <h1 className="font-editorial text-4xl text-[#242424] mb-10">Checkout</h1>

        {resolved.length === 0 ? (
          <div className="border border-[#D8D6D1] bg-[#F5F3EF] p-12 text-center">
            <p className="font-editorial text-2xl">Your shopping bag is empty</p>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="mt-5 bg-[#242424] text-[#FFFFFF] px-7 py-3 text-[11px] font-medium tracking-[0.18em] uppercase"
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* LEFT: Egyptian Address & Payment */}
            <div className="lg:col-span-7 space-y-8">
              <section className="space-y-4">
                <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-[#242424] border-b border-[#D8D6D1] pb-3">
                  01. Contact &amp; Recipient
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="chk-name" className="block text-xs text-[#A8A29A] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      id="chk-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Karim El-Shazly"
                      className="w-full border border-[#D8D6D1] px-3.5 py-3 text-sm focus:border-[#242424] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="chk-email" className="block text-xs text-[#A8A29A] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      id="chk-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full border border-[#D8D6D1] px-3.5 py-3 text-sm focus:border-[#242424] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="chk-phone" className="block text-xs text-[#A8A29A] mb-1.5">
                    Egyptian Mobile Number (+20 / 01X) *
                  </label>
                  <input
                    id="chk-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678 or +20 10 1234 5678"
                    className="w-full border border-[#D8D6D1] px-3.5 py-3 text-sm tabular-nums focus:border-[#242424] focus:outline-none"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-[#242424] border-b border-[#D8D6D1] pb-3">
                  02. Egypt Delivery Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="chk-gov" className="block text-xs text-[#A8A29A] mb-1.5">
                      Governorate *
                    </label>
                    <select
                      id="chk-gov"
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-3.5 py-3 text-sm focus:border-[#242424] focus:outline-none"
                    >
                      {EGYPT_GOVERNORATES.map((g) => (
                        <option key={g.name} value={g.name}>
                          {g.name} ({formatEgp(g.shippingEgp)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="chk-city" className="block text-xs text-[#A8A29A] mb-1.5">
                      District / City *
                    </label>
                    <input
                      id="chk-city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Zamalek, New Cairo, Sheikh Zayed"
                      className="w-full border border-[#D8D6D1] px-3.5 py-3 text-sm focus:border-[#242424] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="chk-addr" className="block text-xs text-[#A8A29A] mb-1.5">
                    Street Address, Building &amp; Apartment *
                  </label>
                  <input
                    id="chk-addr"
                    type="text"
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Street name, villa/building number, floor & apartment"
                    className="w-full border border-[#D8D6D1] px-3.5 py-3 text-sm focus:border-[#242424] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="chk-notes" className="block text-xs text-[#A8A29A] mb-1.5">
                    Courier Instructions (Optional)
                  </label>
                  <input
                    id="chk-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Preferred delivery window or landmark"
                    className="w-full border border-[#D8D6D1] px-3.5 py-3 text-sm focus:border-[#242424] focus:outline-none"
                  />
                </div>

                <label className="flex items-start gap-3 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                    className="mt-1 accent-[#242424]"
                  />
                  <span className="text-xs text-[#242424]/85">
                    Include complimentary 911 foil-crest gift box, cotton pouch, and &ldquo;Wear your statement.&rdquo; card.
                  </span>
                </label>
              </section>

              <section className="space-y-4">
                <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-[#242424] border-b border-[#D8D6D1] pb-3">
                  03. Payment Method (Egypt / EGP)
                </h2>

                <div className="space-y-3">
                  <label
                    className={`flex items-start gap-3 border p-4 cursor-pointer transition-colors ${
                      paymentMethod === 'cod' ? 'border-[#242424] bg-[#F5F3EF]' : 'border-[#D8D6D1]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 accent-[#242424]"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-[#242424]">Cash on Delivery (Active)</p>
                      <p className="text-xs text-[#A8A29A] mt-0.5">
                        Pay in EGP directly to the courier upon inspection of your sealed 911 box.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 border p-4 cursor-pointer transition-colors ${
                      paymentMethod === 'card_pending'
                        ? 'border-[#242424] bg-[#F5F3EF]'
                        : 'border-[#D8D6D1]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'card_pending'}
                      onChange={() => setPaymentMethod('card_pending')}
                      className="mt-1 accent-[#242424]"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-[#242424]">
                        Online Card / Mobile Wallet (Requires Gateway Setup)
                      </p>
                      <p className="text-xs text-[#A8A29A] mt-0.5">
                        Paymob / Fawry online payment processing is prepared in the architecture and activates once merchant credentials are configured. Use Cash on Delivery for immediate orders.
                      </p>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-[#F5F3EF] border border-[#D8D6D1] p-6 md:p-8 space-y-6 lg:sticky lg:top-24">
                <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-[#242424]">
                  Order Summary
                </h2>

                <ul className="divide-y divide-[#D8D6D1]">
                  {resolved.map(({ item, product }) => (
                    <li
                      key={`${item.productId}-${item.variation}-${item.size || ''}`}
                      className="py-3.5 flex items-center gap-3.5"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-16 w-14 object-cover bg-[#FFFFFF] border border-[#D8D6D1]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#242424] truncate">{product.name}</p>
                        <p className="text-xs text-[#A8A29A]">
                          {item.variation} · Qty {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm tabular-nums text-[#242424]">
                        {formatEgp(product.priceEgp * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2.5 text-sm border-t border-[#D8D6D1] pt-4">
                  <div className="flex justify-between">
                    <span className="text-[#A8A29A]">Subtotal</span>
                    <span className="tabular-nums">{formatEgp(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A8A29A]">Courier ({governorate})</span>
                    <span className="tabular-nums">
                      {shipping === 0 ? 'Complimentary' : formatEgp(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-medium pt-3 border-t border-[#D8D6D1]">
                    <span>Total (EGP)</span>
                    <span className="tabular-nums">{formatEgp(total)}</span>
                  </div>
                </div>

                {error && (
                  <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 p-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#242424] text-[#FFFFFF] py-4 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-[#3A3A3A] disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Confirming Order...' : `Place Order · ${formatEgp(total)}`}
                </button>

                <div className="space-y-2 text-[11px] text-[#A8A29A] pt-1">
                  <p className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    No card numbers are collected or stored on 911 servers.
                  </p>
                  <p className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 shrink-0" />
                    Free nationwide shipping on orders over {formatEgp(15000)}.
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};
