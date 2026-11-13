import React, { useMemo, useRef, useState } from 'react';
import { ArrowRight, Pause, Play, Star, Volume2, VolumeX } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { formatEgp } from '../lib/commerce';

export const HomePage: React.FC = () => {
  const {
    products,
    collections,
    reels,
    reviews,
    salesRanking,
    settings,
    navigate,
  } = useStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState<{
    status: 'idle' | 'submitting' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });

  const newArrivals = useMemo(
    () => products.filter((p) => p.isNewArrival).slice(0, 4),
    [products]
  );

  const bestSellers = useMemo(() => {
    return [...products]
      .filter((p) => (salesRanking[p.id] || 0) > 0)
      .sort((a, b) => (salesRanking[b.id] || 0) - (salesRanking[a.id] || 0))
      .slice(0, 4);
  }, [products, salesRanking]);

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      setNewsletterState({ status: 'error', message: 'Please enter your email address.' });
      return;
    }
    setNewsletterState({ status: 'submitting' });
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNewsletterState({ status: 'error', message: data.error || 'Subscription failed.' });
      } else {
        setNewsletterState({ status: 'success', message: data.message });
        setNewsletterEmail('');
      }
    } catch {
      setNewsletterState({ status: 'error', message: 'Network error. Please try again.' });
    }
  };

  return (
    <main>
      {/* 1. HERO SECTION — THE GOLF CAMPAIGN VIDEO */}
      <section className="relative w-full h-[78vh] min-h-[540px] max-h-[860px] overflow-hidden bg-[#F5F3EF]">
        <video
          ref={videoRef}
          src="/assets/aistudio/kling_20261113_VIDEO_Create_a_p_939_0_7f9753a1.mp4"
          poster="/assets/911/hero_poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="911 Men's Accessories Club Golf Campaign Film"
          className="h-full w-full object-cover object-[center_35%]"
        />

        {/* Measured bottom scrim for legibility without obscuring fairway action */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#242424]/75 via-[#242424]/20 to-transparent"
        />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1440px] px-6 md:px-10 pb-10 md:pb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-xl text-[#FFFFFF]">
            <p className="text-[11px] tracking-[0.24em] uppercase text-[#FFFFFF]/80 mb-3">
              911 Men&apos;s Accessories Club · Drop 001
            </p>
            <h1 className="font-editorial text-3xl sm:text-5xl md:text-[54px] leading-[1.05] font-normal tracking-tight text-[#FFFFFF]">
              {settings.heroHeadline}
            </h1>
            <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-[#FFFFFF]/90 max-w-md">
              {settings.heroSubheadline}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="bg-[#FFFFFF] text-[#242424] px-7 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-[#F5F3EF] transition-colors whitespace-nowrap"
              >
                {settings.heroPrimaryCta}
              </button>
              <button
                type="button"
                onClick={() => navigate('/story')}
                className="border border-[#FFFFFF]/80 text-[#FFFFFF] px-7 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-[#FFFFFF]/15 transition-colors whitespace-nowrap"
              >
                {settings.heroSecondaryCta}
              </button>
            </div>
          </div>

          {/* Accessible Video Controls */}
          <div className="flex items-center gap-2 self-end">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause campaign film' : 'Play campaign film'}
              className="flex h-10 w-10 items-center justify-center border border-[#FFFFFF]/50 bg-[#242424]/40 text-[#FFFFFF] backdrop-blur-sm hover:bg-[#242424]/70 transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute campaign film' : 'Mute campaign film'}
              className="flex h-10 w-10 items-center justify-center border border-[#FFFFFF]/50 bg-[#242424]/40 text-[#FFFFFF] backdrop-blur-sm hover:bg-[#242424]/70 transition-colors"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </section>

      {/* 2. BRAND INTRODUCTION */}
      <section className="bg-[#FFFFFF] py-20 md:py-28 px-6 md:px-10 border-b border-[#D8D6D1]/60">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#A8A29A] mb-4">
            Quiet Confidence · Timeless Details
          </p>
          <h2 className="font-editorial text-3xl md:text-5xl leading-[1.12] text-[#242424]">
            MORE THAN AN ACCESSORY. A STATEMENT OF CHARACTER.
          </h2>
          <p className="mt-6 text-[15px] md:text-base leading-relaxed text-[#242424]/75 max-w-xl mx-auto">
            911 is built around the details that define personal style. Carefully selected accessories, considered design, and quality that speaks without saying too much.
          </p>
        </div>
      </section>

      {/* 3. FEATURED COLLECTIONS */}
      <section className="bg-[#FFFFFF] py-20 md:py-24 px-6 md:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-2">
                Six House Categories
              </p>
              <h2 className="font-editorial text-3xl md:text-4xl text-[#242424]">
                EXPLORE THE COLLECTIONS
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/collections')}
              className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-[#242424] border-b border-[#242424] pb-1 self-start sm:self-auto hover:text-[#A8A29A] hover:border-[#A8A29A] transition-colors"
            >
              View Collections
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {collections.map((col) => (
              <a
                key={col.slug}
                href={`/shop/${col.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/shop/${col.slug}`);
                }}
                className="group flex flex-col"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-[#F5F3EF] border border-[#D8D6D1]/60">
                  <img
                    src={col.editorialImage}
                    alt={col.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="pt-3 flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium tracking-[0.16em] uppercase text-[#242424]">
                    {col.name}
                  </span>
                  <span className="text-[11px] text-[#A8A29A] hidden sm:inline">
                    {col.subtitle}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 911 REELS PREVIEW */}
      <section className="bg-[#F5F3EF] py-20 md:py-24 px-6 md:px-10 border-y border-[#D8D6D1]/70">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-2">
                911 Reels · Interactive Shopping
              </p>
              <h2 className="font-editorial text-3xl md:text-4xl text-[#242424]">
                WATCH. DISCOVER. BUY.
              </h2>
              <p className="mt-2.5 text-sm text-[#242424]/75 max-w-md">
                Discover the details. Explore the collection. Find your next statement.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/reels')}
              className="bg-[#242424] text-[#FFFFFF] px-7 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-[#3A3A3A] transition-colors self-start md:self-auto whitespace-nowrap"
            >
              VIEW ALL REELS
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {reels.slice(0, 4).map((reel) => (
              <div
                key={reel.id}
                className="group relative aspect-[9/16] overflow-hidden bg-[#242424] border border-[#D8D6D1]"
              >
                <a
                  href={`/reels?id=${reel.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/reels?id=${reel.id}`);
                  }}
                  aria-label={`Watch 911 Reel: ${reel.title}`}
                  className="block h-full w-full"
                >
                  <video
                    src={reel.videoUrl}
                    poster={reel.coverImage}
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#242424]/85 via-transparent to-[#242424]/25"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2 text-[#FFFFFF]">
                    <span className="text-[10px] tracking-[0.18em] uppercase bg-[#242424]/60 px-2 py-1 backdrop-blur-sm">
                      911 Reel
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 text-[#FFFFFF]">
                    <p className="text-sm font-medium leading-snug line-clamp-2">{reel.title}</p>
                    {reel.product && (
                      <div className="mt-2.5 pt-2.5 border-t border-[#FFFFFF]/25 flex items-center justify-between gap-2 text-xs">
                        <span className="truncate text-[#FFFFFF]/90">{reel.product.name}</span>
                        <span className="shrink-0 font-medium tabular-nums">
                          {formatEgp(reel.product.priceEgp)}
                        </span>
                      </div>
                    )}
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS */}
      <section className="bg-[#FFFFFF] py-20 md:py-24 px-6 md:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-2">
                Just Introduced
              </p>
              <h2 className="font-editorial text-3xl md:text-4xl text-[#242424]">NEW ARRIVALS</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/new-arrivals')}
              className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-[#242424] border-b border-[#242424] pb-1 hover:text-[#A8A29A] hover:border-[#A8A29A] transition-colors whitespace-nowrap"
            >
              VIEW ALL
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS — THE 911 SELECTION */}
      {bestSellers.length > 0 && (
        <section className="bg-[#FFFFFF] py-20 md:py-24 px-6 md:px-10 border-t border-[#D8D6D1]/60">
          <div className="mx-auto max-w-[1440px]">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-2">
                  Ranked by Confirmed Client Orders
                </p>
                <h2 className="font-editorial text-3xl md:text-4xl text-[#242424]">
                  THE 911 SELECTION
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/shop?sort=bestselling')}
                className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-[#242424] border-b border-[#242424] pb-1 hover:text-[#A8A29A] hover:border-[#A8A29A] transition-colors whitespace-nowrap"
              >
                VIEW ALL
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
              {bestSellers.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  badgeText={`No. 0${index + 1} · ${salesRanking[product.id]} Ordered`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. BRAND EXPERIENCE SECTION */}
      <section className="bg-[#F5F3EF] py-20 md:py-28 px-6 md:px-10 border-y border-[#D8D6D1]/70">
        <div className="mx-auto max-w-[1440px] grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-6 overflow-hidden bg-[#FFFFFF] border border-[#D8D6D1]">
            <img
              src="/assets/911/editorial_craft_gifting.jpg"
              alt="911 Gift-ready foil-crest box, cotton pouch, and leather clutch"
              loading="lazy"
              className="h-full w-full object-cover min-h-[360px]"
            />
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-3">
                The 911 Philosophy
              </p>
              <h2 className="font-editorial text-3xl md:text-5xl text-[#242424] leading-[1.1]">
                {settings.lifestyleHeadline}
              </h2>
              <p className="mt-4 text-sm md:text-base leading-relaxed text-[#242424]/75 max-w-lg">
                {settings.lifestyleSubheadline}
              </p>
            </div>

            <div className="mt-10 divide-y divide-[#D8D6D1] border-y border-[#D8D6D1]">
              {[
                ['01', 'Thoughtful Selection', 'A focused house catalog instead of noisy endless options.'],
                ['02', 'Timeless Design', 'Clean proportions crafted to stay sharp beyond a single season.'],
                ['03', 'Attention to Detail', 'Tactile pebble grain, brushed metals, and foil-crest unboxing.'],
                ['04', 'Same Luxury. Honest Value.', 'Elevated material presence without inflated label markups.'],
              ].map(([num, title, desc]) => (
                <div key={num} className="py-4 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                  <span className="text-xs font-medium text-[#A8A29A] tabular-nums w-8 shrink-0">
                    {num}
                  </span>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <span className="text-sm font-medium tracking-wide text-[#242424]">
                      {title}
                    </span>
                    <span className="text-xs text-[#242424]/70">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. LIFESTYLE CAMPAIGN SECTION */}
      <section className="relative w-full h-[64vh] min-h-[440px] max-h-[700px] overflow-hidden bg-[#D8D6D1]">
        <img
          src="/assets/911/editorial_golf_lifestyle.jpg"
          alt="911 Lifestyle Campaign overlooking the golf fairway"
          loading="lazy"
          className="h-full w-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#242424]/70 via-[#242424]/30 to-transparent"
        />
        <div className="absolute inset-0 mx-auto max-w-[1440px] px-6 md:px-10 flex items-center">
          <div className="max-w-lg text-[#FFFFFF]">
            <p className="text-[11px] tracking-[0.22em] uppercase text-[#FFFFFF]/80 mb-3">
              Wear Your Statement
            </p>
            <h2 className="font-editorial text-3xl md:text-5xl leading-[1.1] text-[#FFFFFF]">
              Crafted for the Fairway, the Boardroom, and Everywhere Between.
            </h2>
            <button
              type="button"
              onClick={() => navigate('/collections')}
              className="mt-7 bg-[#FFFFFF] text-[#242424] px-7 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-[#F5F3EF] transition-colors"
            >
              EXPLORE THE 911 WORLD
            </button>
          </div>
        </div>
      </section>

      {/* 9. 911 CLUB — CUSTOMER COMMUNITY */}
      <section className="bg-[#FFFFFF] py-20 md:py-24 px-6 md:px-10 border-b border-[#D8D6D1]/70">
        <div className="mx-auto max-w-5xl bg-[#F5F3EF] border border-[#D8D6D1] p-8 md:p-14 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 flex justify-center">
            <img
              src="/assets/911/crest-trim.png"
              alt="911 Club Crest"
              className="h-36 md:h-44 w-auto object-contain"
            />
          </div>
          <div className="md:col-span-8 space-y-4">
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A]">
              Private Membership
            </p>
            <h2 className="font-editorial text-3xl md:text-4xl text-[#242424]">
              WELCOME TO THE 911 CLUB.
            </h2>
            <ul className="space-y-2 text-sm text-[#242424]/80">
              <li>· Early access to selected drops and limited-quantity pieces</li>
              <li>· Exclusive product announcements and private lookbook previews</li>
              <li>· Synced personal wishlist, order tracking, and numbered Club Member ID</li>
            </ul>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/club')}
                className="bg-[#242424] text-[#FFFFFF] px-7 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-[#3A3A3A] transition-colors"
              >
                JOIN THE CLUB
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. CUSTOMER REVIEWS */}
      <section className="bg-[#FFFFFF] py-20 md:py-24 px-6 md:px-10 border-b border-[#D8D6D1]/70">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-2">
                Client Impressions
              </p>
              <h2 className="font-editorial text-3xl md:text-4xl text-[#242424]">
                THE 911 EXPERIENCE.
              </h2>
            </div>
            <p className="text-xs text-[#A8A29A]">
              Verified Purchase badges are assigned automatically from confirmed order records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((rev) => (
              <article
                key={rev.id}
                className="bg-[#F5F3EF] border border-[#D8D6D1]/80 p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-0.5 text-[#242424]" aria-label={`${rev.rating} out of 5 stars`}>
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="h-3.5 w-3.5 fill-[#242424]" />
                      ))}
                    </div>
                    <span className="text-[11px] tracking-[0.12em] uppercase text-[#A8A29A]">
                      {rev.verifiedPurchase ? 'Verified Purchase' : 'Client Review'}
                      {rev.isSample ? ' · Sample' : ''}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#242424]">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#D8D6D1] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-medium text-[#242424]">{rev.customerName}</p>
                    <p className="text-[#A8A29A] mt-0.5">{rev.productName}</p>
                  </div>
                  <span className="text-[#A8A29A] tabular-nums">
                    {new Date(rev.createdAt).toLocaleDateString('en-EG', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 11. NEWSLETTER */}
      <section className="bg-[#FFFFFF] py-20 md:py-24 px-6 md:px-10">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-3">
            Dispatches from 911.EG
          </p>
          <h2 className="font-editorial text-3xl md:text-4xl text-[#242424]">
            STAY IN THE 911 WORLD.
          </h2>
          <p className="mt-3 text-sm text-[#242424]/75">
            Be the first to discover new collections, exclusive releases, and selected brand stories.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="mt-8 flex flex-col sm:flex-row gap-3">
            <label htmlFor="home-newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="home-newsletter-email"
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 border border-[#D8D6D1] bg-[#FFFFFF] px-4 py-3.5 text-sm text-[#242424] placeholder:text-[#A8A29A] focus:border-[#242424] focus:outline-none"
            />
            <button
              type="submit"
              disabled={newsletterState.status === 'submitting'}
              className="bg-[#242424] text-[#FFFFFF] px-8 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-[#3A3A3A] disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {newsletterState.status === 'submitting' ? 'Subscribing...' : 'SUBSCRIBE'}
            </button>
          </form>

          {newsletterState.message && (
            <p
              className={`mt-3 text-xs ${
                newsletterState.status === 'error' ? 'text-red-700' : 'text-[#242424]'
              }`}
            >
              {newsletterState.message}
            </p>
          )}
          <p className="mt-4 text-[11px] text-[#A8A29A]">
            By subscribing, you agree to our Privacy Policy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </main>
  );
};
