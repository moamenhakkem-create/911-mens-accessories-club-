import React, { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Send,
  Share2,
  ShoppingBag,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatEgp, getStockLabel } from '../lib/commerce';
import type { Reel } from '../lib/types';

export const ReelsPage: React.FC = () => {
  const { reels: initialReels, user, token, sessionId, addToCart, navigate, route } = useStore();
  const [reels, setReels] = useState<Reel[]>(initialReels);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [commentReelId, setCommentReelId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [shareToast, setShareToast] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const viewedSet = useRef<Set<string>>(new Set());

  useEffect(() => {
    setReels(initialReels);
  }, [initialReels]);

  // Jump to ?id= if passed
  useEffect(() => {
    const queryStr = route.includes('?') ? route.split('?')[1] : '';
    const idParam = new URLSearchParams(queryStr).get('id');
    if (idParam && reels.length > 0) {
      const idx = reels.findIndex((r) => r.id === idParam);
      if (idx >= 0) {
        setActiveIndex(idx);
        const el = containerRef.current?.children[idx] as HTMLElement | undefined;
        el?.scrollIntoView({ behavior: 'auto' });
      }
    }
  }, [route, reels.length]);

  const actorKey = user ? user.id : `session_${sessionId}`;

  // Play active video, pause inactive videos, record view once
  useEffect(() => {
    reels.forEach((reel, idx) => {
      const vid = videoRefs.current[reel.id];
      if (!vid) return;
      if (idx === activeIndex) {
        vid.muted = muted;
        vid.play().catch(() => {});
        if (!viewedSet.current.has(reel.id)) {
          viewedSet.current.add(reel.id);
          fetch(`/api/reels/${reel.id}/view`, { method: 'POST' })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
              if (data?.views) {
                setReels((prev) =>
                  prev.map((item) => (item.id === reel.id ? { ...item, views: data.views } : item))
                );
              }
            })
            .catch(() => {});
        }
      } else {
        vid.pause();
      }
    });
  }, [activeIndex, muted, reels]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (commentReelId) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToReel(Math.min(reels.length - 1, activeIndex + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToReel(Math.max(0, activeIndex - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, reels.length, commentReelId]);

  const scrollToReel = (idx: number) => {
    const el = containerRef.current?.children[idx] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: 'smooth' });
    setActiveIndex(idx);
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const h = container.clientHeight || 1;
    const idx = Math.round(container.scrollTop / h);
    if (idx !== activeIndex && idx >= 0 && idx < reels.length) {
      setActiveIndex(idx);
    }
  };

  const authHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const toggleLike = async (reelId: string) => {
    const res = await fetch(`/api/reels/${reelId}/like`, {
      method: 'POST',
      headers: authHeaders,
    });
    if (res.ok) {
      const data = await res.json();
      setReels((prev) =>
        prev.map((r) => (r.id === reelId ? { ...r, likedBy: data.likedBy } : r))
      );
    }
  };

  const toggleSave = async (reelId: string) => {
    const res = await fetch(`/api/reels/${reelId}/save`, {
      method: 'POST',
      headers: authHeaders,
    });
    if (res.ok) {
      const data = await res.json();
      setReels((prev) =>
        prev.map((r) => (r.id === reelId ? { ...r, savedBy: data.savedBy } : r))
      );
    }
  };

  const handleShare = async (reel: Reel) => {
    const url = `${window.location.origin}/reels?id=${reel.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareToast('Reel link copied');
    } catch {
      setShareToast('Link ready to share');
    }
    setTimeout(() => setShareToast(null), 2200);
    const res = await fetch(`/api/reels/${reel.id}/share`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setReels((prev) =>
        prev.map((r) => (r.id === reel.id ? { ...r, shares: data.shares } : r))
      );
    }
  };

  const handleBuyNow = (reel: Reel) => {
    if (!reel.product) return;
    fetch(`/api/reels/${reel.id}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'productClick' }),
    }).catch(() => {});
    navigate(`/product/${reel.product.slug}`);
  };

  const handleAddToBag = (reel: Reel) => {
    if (!reel.product || reel.product.stock <= 0) return;
    addToCart({
      productId: reel.product.id,
      variation: reel.product.variations[0]?.name || 'Signature',
      size: reel.product.sizes?.[0],
      quantity: 1,
      reelId: reel.id,
    });
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentReelId || !commentText.trim()) return;
    const res = await fetch(`/api/reels/${commentReelId}/comment`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ text: commentText }),
    });
    if (res.ok) {
      const data = await res.json();
      setReels((prev) =>
        prev.map((r) => (r.id === commentReelId ? { ...r, comments: data.comments } : r))
      );
      setCommentText('');
    }
  };

  const activeCommentReel = reels.find((r) => r.id === commentReelId);

  if (reels.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-editorial text-4xl text-[#242424]">911 Reels</h1>
        <p className="mt-3 text-sm text-[#A8A29A]">No published reels yet. Check back soon.</p>
      </main>
    );
  }

  return (
    <main className="bg-[#F5F3EF] min-h-[calc(100vh-76px)] flex items-center justify-center py-4 md:py-8 px-2 sm:px-6 relative">
      {shareToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#242424] text-[#FFFFFF] px-5 py-2.5 text-xs tracking-[0.14em] uppercase">
          {shareToast}
        </div>
      )}

      {/* Desktop Left Editorial Rail */}
      <div className="hidden xl:flex flex-col justify-between h-[82vh] max-h-[820px] w-72 pr-8 py-4">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A] mb-2">
            911.EG · Vertical Shopping
          </p>
          <h1 className="font-editorial text-4xl text-[#242424]">911 REELS</h1>
          <p className="mt-3 text-sm text-[#242424]/75 leading-relaxed">
            Explore craft, hardware, and fairway styling in 9:16 vertical motion. Every Reel links live to its piece in the 911 catalog.
          </p>
        </div>

        <div className="space-y-2 border-t border-[#D8D6D1] pt-5">
          <p className="text-[11px] tracking-[0.16em] uppercase text-[#A8A29A]">
            Reel {activeIndex + 1} of {reels.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={activeIndex === 0}
              onClick={() => scrollToReel(activeIndex - 1)}
              aria-label="Previous Reel"
              className="border border-[#D8D6D1] bg-[#FFFFFF] p-2.5 text-[#242424] hover:border-[#242424] disabled:opacity-35"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={activeIndex === reels.length - 1}
              onClick={() => scrollToReel(activeIndex + 1)}
              aria-label="Next Reel"
              className="border border-[#D8D6D1] bg-[#FFFFFF] p-2.5 text-[#242424] hover:border-[#242424] disabled:opacity-35"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Unmute audio' : 'Mute audio'}
              className="border border-[#D8D6D1] bg-[#FFFFFF] p-2.5 text-[#242424] hover:border-[#242424]"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 9:16 Vertical Snap Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        data-testid="reels-feed"
        className="h-[82vh] max-h-[820px] w-full max-w-[430px] aspect-[9/16] overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-[#242424] border border-[#D8D6D1] shadow-sm relative"
      >
        {reels.map((reel) => {
          const liked = reel.likedBy.includes(actorKey);
          const saved = reel.savedBy.includes(actorKey);
          const product = reel.product;
          const stockInfo = product ? getStockLabel(product.stock) : null;

          return (
            <section
              key={reel.id}
              className="relative h-full w-full snap-start snap-always overflow-hidden bg-[#242424]"
            >
              <video
                ref={(el) => {
                  videoRefs.current[reel.id] = el;
                }}
                src={reel.videoUrl}
                poster={reel.coverImage}
                loop
                muted={muted}
                playsInline
                onClick={(e) => {
                  const vid = e.currentTarget;
                  if (vid.paused) vid.play().catch(() => {});
                  else vid.pause();
                }}
                className="h-full w-full object-cover cursor-pointer"
              />

              {/* Top & Bottom Scrims */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#242424]/75 to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#242424]/90 via-[#242424]/50 to-transparent"
              />

              {/* TOP AREA: Official 911 Profile */}
              <div className="absolute inset-x-0 top-0 p-4 flex items-center justify-between text-[#FFFFFF]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#FFFFFF] p-1.5 flex items-center justify-center shrink-0">
                    <img
                      src="/assets/911/crest-trim.png"
                      alt="911 Crest"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">911</p>
                    <p className="text-[10px] tracking-[0.16em] uppercase text-[#FFFFFF]/80 mt-1">
                      MEN&apos;S ACCESSORIES CLUB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] tabular-nums text-[#FFFFFF]/85 bg-[#242424]/50 px-2.5 py-1 backdrop-blur-sm">
                    {reel.views} views
                  </span>
                  <button
                    type="button"
                    onClick={() => setMuted((m) => !m)}
                    aria-label={muted ? 'Unmute reel' : 'Mute reel'}
                    className="flex h-8 w-8 items-center justify-center bg-[#242424]/50 text-[#FFFFFF] backdrop-blur-sm"
                  >
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* RIGHT SIDE ACTIONS */}
              <div className="absolute right-3 bottom-44 flex flex-col items-center gap-4 text-[#FFFFFF]">
                <button
                  type="button"
                  onClick={() => toggleLike(reel.id)}
                  aria-label={liked ? 'Unlike reel' : 'Like reel'}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#242424]/55 backdrop-blur-sm hover:bg-[#242424]/80">
                    <Heart className={`h-5 w-5 ${liked ? 'fill-[#FFFFFF] text-[#FFFFFF]' : ''}`} />
                  </span>
                  <span className="text-[11px] tabular-nums">{reel.likedBy.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCommentReelId(reel.id)}
                  aria-label="Open comments"
                  className="flex flex-col items-center gap-1"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#242424]/55 backdrop-blur-sm hover:bg-[#242424]/80">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] tabular-nums">{reel.comments.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleSave(reel.id)}
                  aria-label={saved ? 'Unsave reel' : 'Save reel'}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#242424]/55 backdrop-blur-sm hover:bg-[#242424]/80">
                    <Bookmark className={`h-5 w-5 ${saved ? 'fill-[#FFFFFF] text-[#FFFFFF]' : ''}`} />
                  </span>
                  <span className="text-[11px] tabular-nums">{reel.savedBy.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShare(reel)}
                  aria-label="Share reel"
                  className="flex flex-col items-center gap-1"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#242424]/55 backdrop-blur-sm hover:bg-[#242424]/80">
                    <Share2 className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] tabular-nums">{reel.shares}</span>
                </button>
              </div>

              {/* BOTTOM AREA: Title + Live Linked Product Card */}
              <div className="absolute inset-x-0 bottom-0 p-4 space-y-3">
                <div className="pr-14 text-[#FFFFFF]">
                  <h2 className="text-sm font-medium leading-snug">{reel.title}</h2>
                  <p className="text-xs text-[#FFFFFF]/80 mt-0.5 line-clamp-2">
                    {reel.description}
                  </p>
                </div>

                {product && (
                  <div className="bg-[#FFFFFF]/95 backdrop-blur-md p-2.5 flex items-center gap-3 border border-[#D8D6D1]">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-14 w-12 shrink-0 object-cover bg-[#F5F3EF]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#242424] truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium text-[#242424] tabular-nums">
                          {formatEgp(product.priceEgp)}
                        </span>
                        {stockInfo && (
                          <span className="text-[10px] text-[#A8A29A]">· {stockInfo.label}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={product.stock <= 0}
                        onClick={() => handleAddToBag(reel)}
                        aria-label={`Add ${product.name} to bag`}
                        className="border border-[#242424] p-2 text-[#242424] hover:bg-[#F5F3EF] disabled:opacity-40"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBuyNow(reel)}
                        className="bg-[#242424] text-[#FFFFFF] px-3.5 py-2 text-[10px] font-medium tracking-[0.16em] uppercase hover:bg-[#3A3A3A] whitespace-nowrap"
                      >
                        BUY NOW
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Comments Sheet Modal */}
      {activeCommentReel && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#242424]/45 p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Reel comments"
        >
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#D8D6D1] flex flex-col max-h-[70vh]">
            <div className="flex items-center justify-between border-b border-[#D8D6D1] px-5 py-4">
              <h3 className="text-xs font-medium tracking-[0.18em] uppercase text-[#242424]">
                Comments ({activeCommentReel.comments.length})
              </h3>
              <button
                type="button"
                onClick={() => setCommentReelId(null)}
                aria-label="Close comments"
                className="p-1 text-[#242424]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeCommentReel.comments.length === 0 ? (
                <p className="text-xs text-[#A8A29A] text-center py-6">
                  Be the first to share a note on this piece.
                </p>
              ) : (
                activeCommentReel.comments.map((c) => (
                  <div key={c.id} className="border-b border-[#D8D6D1]/50 pb-3 last:border-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#242424]">{c.authorName}</span>
                      <span className="text-[11px] text-[#A8A29A]">
                        {new Date(c.createdAt).toLocaleDateString('en-EG')}
                      </span>
                    </div>
                    <p className="text-sm text-[#242424]/85 mt-1">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={submitComment}
              className="border-t border-[#D8D6D1] p-3 flex items-center gap-2"
            >
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                aria-label="Write a comment"
                className="flex-1 border border-[#D8D6D1] px-3 py-2 text-sm focus:border-[#242424] focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Post comment"
                className="bg-[#242424] text-[#FFFFFF] p-2.5 hover:bg-[#3A3A3A]"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
