import React from 'react';
import { ArrowUp } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { navigate } = useStore();

  const go = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <footer className="bg-[#F5F3EF] border-t border-[#D8D6D1] text-[#242424]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* Column 1: 911 Brand */}
          <div className="md:col-span-4 space-y-5 pr-4">
            <div className="flex items-center gap-4">
              <img
                src="/assets/911/crest-trim.png"
                alt="911 Heritage Crest"
                className="h-12 w-auto object-contain"
              />
              <img
                src="/assets/911/wordmark-trim.png"
                alt="911 Men's Accessories Club"
                className="h-11 w-auto object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed text-[#242424]/80 max-w-xs">
              Quiet confidence. Timeless details. Quality over noise. Designed for modern gentlemen across Egypt.
            </p>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8A29A]">
              WHERE HERITAGE MEETS MODERN PRECISION.
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className="md:col-span-2">
            <h3 className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#A8A29A] mb-5">
              EXPLORE
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                ['Shop All', '/shop'],
                ['New Arrivals', '/new-arrivals'],
                ['Watches', '/shop/watches'],
                ['Bracelets', '/shop/bracelets'],
                ['Bags', '/shop/bags'],
                ['Wallets', '/shop/wallets'],
                ['Sunglasses', '/shop/sunglasses'],
                ['Caps', '/shop/caps'],
                ['911 Reels', '/reels'],
              ].map(([label, path]) => (
                <li key={path}>
                  <a
                    href={path}
                    onClick={(e) => go(e, path)}
                    className="hover:text-[#A8A29A] transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="md:col-span-2">
            <h3 className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#A8A29A] mb-5">
              CUSTOMER CARE
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                ['Contact Us', '/contact'],
                ['FAQs', '/faq'],
                ['Shipping & Delivery', '/shipping'],
                ['Returns & Exchanges', '/shipping#returns'],
                ['Order Tracking', '/orders/track'],
                ['Payment Information', '/shipping#payment'],
              ].map(([label, path]) => (
                <li key={label}>
                  <a
                    href={path}
                    onClick={(e) => go(e, path.split('#')[0])}
                    className="hover:text-[#A8A29A] transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: About 911 */}
          <div className="md:col-span-2">
            <h3 className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#A8A29A] mb-5">
              ABOUT 911
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                ['Our Story', '/story'],
                ['911 Club', '/club'],
                ['Brand Philosophy', '/story#philosophy'],
                ['Privacy Policy', '/privacy'],
                ['Terms & Conditions', '/terms'],
                ['Admin Portal', '/admin'],
              ].map(([label, path]) => (
                <li key={label}>
                  <a
                    href={path}
                    onClick={(e) => go(e, path.split('#')[0])}
                    className="hover:text-[#A8A29A] transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Connect */}
          <div className="md:col-span-2">
            <h3 className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#A8A29A] mb-5">
              CONNECT
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#A8A29A] transition-colors"
                >
                  Instagram (@911.eg)
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#A8A29A] transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#A8A29A] transition-colors"
                >
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/201000000911"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#A8A29A] transition-colors"
                >
                  WhatsApp Concierge
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-14 pt-8 border-t border-[#D8D6D1] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-[#A8A29A]">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>© {new Date().getFullYear()} 911 Men&apos;s Accessories Club</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#242424]">Egypt / EGP</span>
            <span aria-hidden="true">·</span>
            <a
              href="/privacy"
              onClick={(e) => go(e, '/privacy')}
              className="hover:text-[#242424] transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              onClick={(e) => go(e, '/terms')}
              className="hover:text-[#242424] transition-colors"
            >
              Terms &amp; Conditions
            </a>
          </div>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] uppercase text-[#242424] hover:text-[#A8A29A] transition-colors self-start sm:self-auto"
          >
            Back to Top
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
