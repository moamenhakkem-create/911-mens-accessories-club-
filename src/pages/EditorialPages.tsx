import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { EGYPT_GOVERNORATES, formatEgp, FREE_SHIPPING_THRESHOLD_EGP } from '../lib/commerce';

export const CollectionsPage: React.FC = () => {
  const { collections, products, navigate } = useStore();

  return (
    <main className="bg-[#FFFFFF] py-12 md:py-16 px-6 md:px-10">
      <div className="mx-auto max-w-[1440px]">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-2">
          911.EG · House Directory
        </p>
        <h1 className="font-editorial text-4xl md:text-5xl text-[#242424] mb-4">
          The Six Collections
        </h1>
        <p className="text-sm text-[#242424]/75 max-w-xl mb-12">
          One clear house. Six disciplined categories engineered for quiet confidence from fairway to evening.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((col) => {
            const count = products.filter((p) => p.category === col.slug).length;
            return (
              <a
                key={col.slug}
                href={`/shop/${col.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/shop/${col.slug}`);
                }}
                className="group border border-[#D8D6D1] bg-[#F5F3EF] flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#FFFFFF]">
                  <img
                    src={col.editorialImage}
                    alt={col.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] tracking-[0.16em] uppercase text-[#A8A29A] mb-2">
                      <span>{col.subtitle}</span>
                      <span className="tabular-nums">{count} Pieces</span>
                    </div>
                    <h2 className="font-editorial text-3xl text-[#242424]">{col.name}</h2>
                    <p className="mt-2 text-sm text-[#242424]/75 leading-relaxed">
                      {col.description}
                    </p>
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-[#242424]">
                    Explore {col.name}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export const StoryPage: React.FC = () => {
  const { navigate } = useStore();

  return (
    <main className="bg-[#FFFFFF]">
      <section className="bg-[#F5F3EF] border-b border-[#D8D6D1] py-16 md:py-24 px-6 md:px-10">
        <div className="mx-auto max-w-4xl text-center space-y-5">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#A8A29A]">
            The 911 Story · Brand Philosophy
          </p>
          <h1 className="font-editorial text-4xl md:text-6xl text-[#242424] leading-[1.08]">
            WHERE HERITAGE MEETS MODERN PRECISION.
          </h1>
          <p className="text-base text-[#242424]/80 max-w-2xl mx-auto leading-relaxed">
            911 Men&apos;s Accessories Club was founded in Egypt to replace loud, overpriced options with one focused house of timeless silhouettes, honest craftsmanship, and gift-ready detail.
          </p>
        </div>
      </section>

      <section id="philosophy" className="mx-auto max-w-[1200px] py-16 md:py-24 px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 flex justify-center bg-[#F5F3EF] border border-[#D8D6D1] p-10">
          <img
            src="/assets/911/crest-trim.png"
            alt="The 911 Heritage Crest"
            className="h-64 w-auto object-contain"
          />
        </div>
        <div className="lg:col-span-7 space-y-6">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A]">
            The Dual Identity
          </p>
          <h2 className="font-editorial text-3xl md:text-4xl text-[#242424]">
            The Six Emblems of the 911 Crest
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              ['01. Crown', 'Exclusivity & elevated standards'],
              ['02. Laurel Wreath', 'Achievement & personal discipline'],
              ['03. Shield', 'Protection & lasting legacy'],
              ['04. Star', 'Distinction without noise'],
              ['05. Tree', 'Deep roots & steady growth'],
              ['06. Eagle', 'Quiet authority & perspective'],
            ].map(([title, desc]) => (
              <div key={title} className="border border-[#D8D6D1] p-4">
                <p className="text-xs font-medium tracking-[0.14em] uppercase text-[#242424]">
                  {title}
                </p>
                <p className="text-xs text-[#A8A29A] mt-1">{desc}</p>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="bg-[#242424] text-[#FFFFFF] px-7 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase"
            >
              Explore the Collection
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export const ClubPage: React.FC = () => {
  const { user, token, setUser } = useStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; msg?: string }>({
    type: 'idle',
  });

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'idle' });
    const res = await fetch('/api/club/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ name, email, phone }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus({ type: 'error', msg: data.error || 'Unable to join right now.' });
      return;
    }
    if (data.user) setUser(data.user);
    setStatus({ type: 'success', msg: data.message });
  };

  return (
    <main className="bg-[#FFFFFF] py-14 md:py-20 px-6 md:px-10">
      <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A]">
            911 Men&apos;s Accessories Club
          </p>
          <h1 className="font-editorial text-4xl md:text-5xl text-[#242424] leading-[1.1]">
            WELCOME TO THE 911 CLUB.
          </h1>
          <p className="text-sm text-[#242424]/80 leading-relaxed">
            Confidence runs deep. Joining the 911 Club connects you directly to Drop 001 releases, private lookbooks, and numbered member benefits.
          </p>

          <ul className="space-y-3 border-t border-[#D8D6D1] pt-5 text-sm text-[#242424]">
            <li>· Early access to selected collections before public release</li>
            <li>· Priority dispatch on limited-quantity pieces</li>
            <li>· Private 911 Club dispatches and styling lookbooks</li>
            <li>· Numbered digital Club Membership identity</li>
          </ul>
        </div>

        <div className="lg:col-span-6 bg-[#F5F3EF] border border-[#D8D6D1] p-8 md:p-10">
          {user?.isClubMember ? (
            <div className="text-center space-y-4 py-6">
              <img
                src="/assets/911/crest-trim.png"
                alt="911 Crest"
                className="h-24 mx-auto object-contain"
              />
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A]">
                Active Membership Confirmed
              </p>
              <h2 className="font-editorial text-3xl text-[#242424]">
                MEMBER · NO. {user.clubNumber}
              </h2>
              <p className="text-sm text-[#242424]/75">
                Registered to {user.email}. You have early access to all upcoming drops.
              </p>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <h2 className="font-editorial text-2xl text-[#242424] mb-2">
                Request Your Club Number
              </h2>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-4 py-3 text-sm focus:border-[#242424] focus:outline-none"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-4 py-3 text-sm focus:border-[#242424] focus:outline-none"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Egyptian Mobile (Optional, e.g. 010...)"
                className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-4 py-3 text-sm focus:border-[#242424] focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-[#242424] text-[#FFFFFF] py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-[#3A3A3A]"
              >
                Join the 911 Club
              </button>

              {status.msg && (
                <p
                  className={`text-xs flex items-center gap-2 pt-1 ${
                    status.type === 'error' ? 'text-red-700' : 'text-[#242424]'
                  }`}
                >
                  {status.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  <span>{status.msg}</span>
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </main>
  );
};

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Product & Gifting Inquiry');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, subject, message }),
    });
    const data = await res.json();
    if (res.ok) {
      setNotice(data.message);
      setMessage('');
    } else {
      setNotice(data.error || 'Could not send message.');
    }
  };

  return (
    <main className="bg-[#FFFFFF] py-14 px-6 md:px-10">
      <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-5">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A]">
            Client Concierge · Cairo
          </p>
          <h1 className="font-editorial text-4xl text-[#242424]">Contact Us</h1>
          <p className="text-sm text-[#242424]/80 leading-relaxed">
            For sizing advice, private gifting orders, corporate requests, or courier assistance anywhere in Egypt.
          </p>

          <div className="border-t border-[#D8D6D1] pt-5 space-y-3 text-sm">
            <p>
              <strong className="font-medium">Concierge Email:</strong> concierge@911.eg
            </p>
            <p>
              <strong className="font-medium">Hours:</strong> Daily, 10:00 AM – 10:00 PM (Cairo Time)
            </p>
            <a
              href="https://wa.me/201000000911"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-[#242424] px-5 py-3 text-[11px] font-medium tracking-[0.16em] uppercase hover:bg-[#F5F3EF]"
            >
              <MessageCircle className="h-4 w-4" />
              Message on WhatsApp
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-[#F5F3EF] border border-[#D8D6D1] p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name *"
              className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-3.5 py-3 text-sm focus:border-[#242424] focus:outline-none"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address *"
              className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-3.5 py-3 text-sm focus:border-[#242424] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone / WhatsApp"
              className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-3.5 py-3 text-sm focus:border-[#242424] focus:outline-none"
            />
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-3.5 py-3 text-sm focus:border-[#242424] focus:outline-none"
            />
          </div>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we assist you?"
            className="w-full border border-[#D8D6D1] bg-[#FFFFFF] px-3.5 py-3 text-sm focus:border-[#242424] focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#242424] text-[#FFFFFF] px-8 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-[#3A3A3A]"
          >
            Send Inquiry
          </button>
          {notice && <p className="text-xs text-[#242424] pt-1">{notice}</p>}
        </form>
      </div>
    </main>
  );
};

export const FaqPage: React.FC = () => {
  const faqs = [
    [
      'How long does delivery take across Egypt?',
      'Cairo and Giza orders arrive within 24–48 hours. Alexandria, North Coast, Delta, Red Sea, and Upper Egypt deliveries arrive within 2–3 business days.',
    ],
    [
      'Which payment methods are currently active?',
      'Cash on Delivery (in EGP) is active nationwide. Online card and mobile wallet gateways (Paymob / Fawry) are integrated in the checkout architecture and will activate once live merchant credentials are configured.',
    ],
    [
      'Are all pieces delivered in gift-ready packaging?',
      'Yes. Every order includes the official 911 foil-crest presentation box, protective cotton dust pouch, and our "Wear your statement." card.',
    ],
    [
      'What is your return and exchange policy?',
      'Unworn accessories in original sealed packaging with tags and box may be returned or exchanged within 14 days of delivery.',
    ],
    [
      'Are the listed EGP prices final?',
      'Seeded launch pieces currently display sample catalog pricing (from EGP 4,200 to EGP 148,000) clearly labeled until final Drop 001 inventory is published.',
    ],
  ];

  return (
    <main className="bg-[#FFFFFF] py-14 px-6 md:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-2">
          Customer Care
        </p>
        <h1 className="font-editorial text-4xl md:text-5xl text-[#242424] mb-10">
          Frequently Asked Questions
        </h1>
        <div className="divide-y divide-[#D8D6D1] border-y border-[#D8D6D1]">
          {faqs.map(([q, a]) => (
            <div key={q} className="py-6 space-y-2">
              <h2 className="text-base font-medium text-[#242424]">{q}</h2>
              <p className="text-sm text-[#242424]/75 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export const ShippingPage: React.FC = () => {
  return (
    <main className="bg-[#FFFFFF] py-14 px-6 md:px-10">
      <div className="mx-auto max-w-3xl space-y-10">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-2">
            911.EG · Fulfillment
          </p>
          <h1 className="font-editorial text-4xl md:text-5xl text-[#242424]">
            Shipping, Returns &amp; Payment
          </h1>
        </div>

        <section className="space-y-4">
          <h2 className="font-editorial text-2xl text-[#242424]">
            Egypt Courier Rates (Complimentary above {formatEgp(FREE_SHIPPING_THRESHOLD_EGP)})
          </h2>
          <div className="border border-[#D8D6D1] divide-y divide-[#D8D6D1]">
            {EGYPT_GOVERNORATES.map((g) => (
              <div key={g.name} className="flex justify-between px-4 py-3 text-sm">
                <span>{g.name}</span>
                <span className="tabular-nums font-medium">{formatEgp(g.shippingEgp)}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="returns" className="space-y-3 border-t border-[#D8D6D1] pt-8">
          <h2 className="font-editorial text-2xl text-[#242424]">Returns &amp; Exchanges</h2>
          <p className="text-sm text-[#242424]/80 leading-relaxed">
            Clients may inspect sealed presentation packaging upon courier arrival. Unworn items returned within 14 days in original foil-crest packaging with cotton pouch and card qualify for full exchange or refund.
          </p>
        </section>

        <section id="payment" className="space-y-3 border-t border-[#D8D6D1] pt-8">
          <h2 className="font-editorial text-2xl text-[#242424]">Payment Security</h2>
          <p className="text-sm text-[#242424]/80 leading-relaxed">
            Cash on Delivery (EGP) is immediately available across all governorates. 911 never collects or stores sensitive card numbers directly on application servers.
          </p>
        </section>
      </div>
    </main>
  );
};

export const LegalPage: React.FC<{ type: 'privacy' | 'terms' }> = ({ type }) => {
  const isPrivacy = type === 'privacy';
  return (
    <main className="bg-[#FFFFFF] py-14 px-6 md:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A]">
          911 Men&apos;s Accessories Club · Legal
        </p>
        <h1 className="font-editorial text-4xl text-[#242424]">
          {isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}
        </h1>
        <p className="text-sm text-[#242424]/80 leading-relaxed">
          {isPrivacy
            ? '911 Men\'s Accessories Club collects only the contact, delivery address, and account preference details required to fulfill your orders across Egypt, track shipments, and deliver optional Club communications. We never sell client information or store raw payment card numbers.'
            : 'All orders placed through 911.EG are subject to real-time stock verification and Egyptian courier coverage. Sample catalog pricing shown prior to Drop 001 is transparently labeled; confirmed order totals in EGP include itemized shipping prior to submission.'}
        </p>
      </div>
    </main>
  );
};
