import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  CollectionInfo,
  Order,
  Product,
  Reel,
  Review,
  SiteSettings,
  UserProfile,
} from '../lib/types';

export interface StoredUser extends UserProfile {
  passwordHash: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface StoreData {
  products: Product[];
  collections: CollectionInfo[];
  reels: Reel[];
  orders: Order[];
  reviews: Review[];
  users: StoredUser[];
  newsletterSubscribers: Array<{ email: string; subscribedAt: string }>;
  contactSubmissions: ContactSubmission[];
  settings: SiteSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(key, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function createInitialData(): StoreData {
  const now = new Date('2026-11-01T10:00:00.000Z').toISOString();

  const collections: CollectionInfo[] = [
    {
      slug: 'watches',
      name: 'Watches',
      subtitle: 'Mechanical Precision',
      description: 'Architectural dials, skeletonized calibres, and heritage leather straps.',
      editorialImage: '/assets/911/watch_tonneau_skeleton.jpg',
    },
    {
      slug: 'bracelets',
      name: 'Bracelets',
      subtitle: 'Understated Wristwear',
      description: 'Brushed steel hardware and calfskin inlays proportioned to sit cleanly beside a watch.',
      editorialImage: '/assets/911/product_bracelet_cuff.jpg',
    },
    {
      slug: 'bags',
      name: 'Bags',
      subtitle: 'Structured Carry',
      description: 'Briefcases and everyday crossbody silhouettes built for boardrooms and weekend travel.',
      editorialImage: '/assets/911/bag_croc_briefcase.jpg',
    },
    {
      slug: 'wallets',
      name: 'Wallets',
      subtitle: 'Small Leather Goods',
      description: 'Wrist clutches, zip pouches, and slim bifolds finished with signature 911 hardware.',
      editorialImage: '/assets/911/wallet_sovereign_clutch.png',
    },
    {
      slug: 'sunglasses',
      name: 'Sunglasses',
      subtitle: 'Optical Clarity',
      description: 'Rimless faceted metalwork and sculpted matte acetate frames for harsh Egyptian sunlight.',
      editorialImage: '/assets/911/product_sunglasses_tortoise.jpg',
    },
    {
      slug: 'caps',
      name: 'Caps',
      subtitle: 'Club & Fairway',
      description: 'Structured six-panel twill headwear bearing the embroidered 911 Men\'s Accessories Club crest.',
      editorialImage: '/assets/911/cap_fairway_white.jpg',
    },
  ];

  const products: Product[] = [
    {
      id: 'prod_watch_tonneau',
      slug: '911-club-tonneau-skeleton',
      name: '911 Club Tonneau Skeleton',
      category: 'watches',
      priceEgp: 148000,
      isSamplePrice: true,
      shortDescription: 'Brushed titanium-tone tonneau case with openworked dial and woven navy textile strap.',
      story:
        'Featured in our golf campaign film, the 911 Club Tonneau Skeleton pairs a sculptural curved tonneau profile with an exposed mechanical bridge architecture and six-screw bezel detailing.',
      images: ['/assets/911/watch_tonneau_skeleton.jpg'],
      videoUrl: '/assets/aistudio/kling_20261113_VIDEO_Create_a_p_939_0_7f9753a1.mp4',
      variations: [
        { name: 'Brushed Silver / Navy Strap', hex: '#2B3A52' },
        { name: 'Slate / Charcoal Strap', hex: '#242424' },
      ],
      sizes: ['42mm Case'],
      stock: 3,
      isNewArrival: true,
      isLimitedEdition: true,
      isFeatured: true,
      materials: ['Brushed 316L Stainless Steel', 'Sapphire Crystal', 'Woven Nylon & Rubber Strap'],
      specifications: [
        { label: 'Movement', value: 'Skeletonized Automatic Mechanical' },
        { label: 'Case Shape', value: 'Ergonomic Curved Tonneau' },
        { label: 'Dial', value: 'Openworked Arabic Numerals with Champagne Accents' },
        { label: 'Strap', value: 'High-density Navy Woven Strap with Deployant Clasp' },
      ],
      dimensions: '42mm x 50mm x 11.8mm',
      careInstructions: 'Wipe case and crystal with a dry microfiber cloth. Keep away from strong magnetic fields.',
      warrantyInfo: 'Sample catalog listing — service terms finalized upon Drop 001 launch.',
      views: 184,
      createdAt: '2026-11-10T09:00:00.000Z',
    },
    {
      id: 'prod_watch_heritage',
      slug: '911-heritage-automatic-slate',
      name: '911 Heritage Automatic — Slate',
      category: 'watches',
      priceEgp: 68500,
      isSamplePrice: true,
      shortDescription: 'Sunburst slate-grey dial automatic timepiece with date aperture and saddle-stitched leather strap.',
      story:
        'Designed around clean everyday legibility, the Heritage Automatic combines a brushed round steel bezel, applied faceted indices, the 911 crest at 12 o\'clock, and hand-stitched warm chestnut leather.',
      images: ['/assets/911/watch_heritage_auto.jpg'],
      variations: [{ name: 'Slate Dial / Chestnut Leather', hex: '#6E4730' }],
      sizes: ['39mm Case'],
      stock: 6,
      isNewArrival: true,
      isLimitedEdition: false,
      isFeatured: true,
      materials: ['316L Stainless Steel', 'Full-Grain Saddle Leather', 'Domed Mineral/Sapphire Glass'],
      specifications: [
        { label: 'Movement', value: 'Automatic Self-Winding with Date Window' },
        { label: 'Dial', value: 'Sunburst Slate Grey with Applied Indices' },
        { label: 'Strap', value: '20mm Hand-Stitched Brown Leather' },
      ],
      dimensions: '39mm diameter x 10.4mm profile',
      careInstructions: 'Avoid submerging leather strap in water; condition leather periodically.',
      views: 142,
      createdAt: '2026-11-08T09:00:00.000Z',
    },
    {
      id: 'prod_bag_croc',
      slug: 'sovereign-croc-embossed-briefcase',
      name: 'Sovereign Croc-Embossed Briefcase',
      category: 'bags',
      priceEgp: 28500,
      isSamplePrice: true,
      shortDescription: 'Structured espresso-brown crocodile-embossed leather briefcase with rolled top handles and detachable strap.',
      story:
        'Engineered for executive travel and daily office carry, the Sovereign Briefcase balances a firm architectural silhouette with rich tactile grain and antique-brushed metal hardware.',
      images: ['/assets/911/bag_croc_briefcase.jpg'],
      variations: [{ name: 'Espresso Brown', hex: '#4B2E22' }],
      sizes: ['Fits 15" Laptop'],
      stock: 4,
      isNewArrival: false,
      isLimitedEdition: false,
      isFeatured: true,
      materials: ['Crocodile-Embossed Full-Grain Leather', 'Brushed Gunmetal Hardware', 'Suede-Touch Lining'],
      specifications: [
        { label: 'Closure', value: 'Dual-Pull Zip Closure' },
        { label: 'Carry', value: 'Rolled Leather Handles + Adjustable Shoulder Strap' },
        { label: 'Interior', value: 'Padded Laptop Sleeve & Dual Slip Pockets' },
      ],
      dimensions: '39cm W x 29cm H x 8.5cm D',
      careInstructions: 'Store stuffed inside the 911 dust pouch away from direct heat and humidity.',
      views: 118,
      createdAt: '2026-11-03T09:00:00.000Z',
    },
    {
      id: 'prod_bag_damier',
      slug: 'heritage-checkered-atelier-briefcase',
      name: 'Heritage Checkered Briefcase',
      category: 'bags',
      priceEgp: 24900,
      isSamplePrice: true,
      shortDescription: 'Tonal espresso-and-charcoal checkered coated canvas briefcase trimmed with smooth dark calfskin.',
      story:
        'A light yet structured daily document case combining hard-wearing geometric canvas with hand-burnished leather handle tabs and reinforced piping.',
      images: ['/assets/911/bag_damier_briefcase.png'],
      variations: [{ name: 'Espresso Checkered', hex: '#3D2C24' }],
      sizes: ['Fits 14"–15" Laptop'],
      stock: 5,
      isNewArrival: true,
      isLimitedEdition: false,
      isFeatured: false,
      materials: ['Coated Architectural Canvas', 'Smooth Calfskin Trim', 'Brushed Steel D-Rings'],
      specifications: [
        { label: 'Structure', value: 'Reinforced Self-Standing Base' },
        { label: 'Hardware', value: 'Brushed Nickel Zippers & Strap Anchors' },
      ],
      dimensions: '38cm W x 28cm H x 7.5cm D',
      careInstructions: 'Wipe canvas gently with a slightly damp soft cloth.',
      views: 94,
      createdAt: '2026-11-06T09:00:00.000Z',
    },
    {
      id: 'prod_bag_messenger',
      slug: '911-monogram-crossbody-messenger',
      name: '911 Monogram Crossbody Messenger',
      category: 'bags',
      priceEgp: 14500,
      isSamplePrice: true,
      shortDescription: 'Compact vertical crossbody bag in matte black grained leather with tonal 911 jacquard panel.',
      story:
        'Built to eliminate bulky pockets without sacrificing poise. Houses phone, keys, sunglasses, and wallet neatly against the body on a wide woven webbing strap.',
      images: ['/assets/911/bag_crossbody_messenger.png'],
      variations: [{ name: 'Matte Black / Champagne 911', hex: '#242424' }],
      sizes: ['One Size'],
      stock: 8,
      isNewArrival: true,
      isLimitedEdition: false,
      isFeatured: true,
      materials: ['Pebbled Calfskin Leather', 'Tonal Jacquard Panel', 'Champagne Brass 911 Emblem'],
      specifications: [
        { label: 'Compartments', value: 'Main Zip Compartment + Front Slip Pocket' },
        { label: 'Strap', value: 'Adjustable Woven Crossbody Strap' },
      ],
      dimensions: '20cm W x 24cm H x 6.5cm D',
      careInstructions: 'Keep dry and store inside included 911 cotton dust bag.',
      views: 162,
      createdAt: '2026-11-09T09:00:00.000Z',
    },
    {
      id: 'prod_wallet_clutch',
      slug: 'the-sovereign-wrist-clutch',
      name: 'The Sovereign Clutch',
      category: 'wallets',
      priceEgp: 8900,
      isSamplePrice: true,
      shortDescription: 'Pebble-grain matte black leather organizer clutch with brushed brass 911 insignia and detachable wrist strap.',
      story:
        'Designed for the modern gentleman who carries cards, cash, keys, and passport cleanly in one hand—or inside a travel briefcase. Delivered in the 911 foil-crest gift box.',
      images: [
        '/assets/911/wallet_sovereign_clutch.png',
        '/assets/911/editorial_clutch_hand.jpg',
        '/assets/911/editorial_craft_gifting.jpg',
      ],
      variations: [{ name: 'Obsidian Pebble / Brushed Brass', hex: '#242424' }],
      sizes: ['One Size'],
      stock: 11,
      isNewArrival: false,
      isLimitedEdition: false,
      isFeatured: true,
      materials: ['Pebble-Grain Calfskin', 'Brushed Brass Hardware', 'Cotton Twill Interior'],
      specifications: [
        { label: 'Capacity', value: '8 Card Slots, Phone Bay, Zip Coin Section' },
        { label: 'Packaging', value: '911 Foil Crest Box, Dust Pouch & Statement Card' },
      ],
      dimensions: '25cm W x 16cm H x 3.5cm D',
      careInstructions: 'Clean with dry soft cloth; avoid abrasive leather cleaners.',
      views: 210,
      createdAt: '2026-10-29T09:00:00.000Z',
    },
    {
      id: 'prod_wallet_pouch',
      slug: 'the-heritage-monogram-pouch',
      name: 'The Heritage Pouch',
      category: 'wallets',
      priceEgp: 7400,
      isSamplePrice: true,
      shortDescription: 'Forest-green 911 crest jacquard canvas paired with smooth black calfskin top trim and champagne 911 badge.',
      story:
        'Uniting the royal crest motif of 911 with everyday practicality, The Heritage Pouch slips effortlessly into golf totes, briefcases, or carry-on luggage.',
      images: [
        '/assets/911/wallet_heritage_pouch.png',
        '/assets/911/editorial_unboxing_flatlay.jpg',
      ],
      variations: [{ name: 'Club Green / Matte Black', hex: '#284435' }],
      sizes: ['One Size'],
      stock: 7,
      isNewArrival: true,
      isLimitedEdition: false,
      isFeatured: true,
      materials: ['Woven Crest Canvas', 'Smooth Calfskin Top Border', 'Metal Top Zip'],
      specifications: [
        { label: 'Signature', value: 'Brushed Champagne 911 Metal Numerals' },
        { label: 'Interior', value: 'Lined Main Pocket + Card Divider' },
      ],
      dimensions: '23cm W x 14.5cm H x 2.5cm D',
      careInstructions: 'Spot clean canvas with dry brush; keep leather trim conditioned.',
      views: 148,
      createdAt: '2026-11-05T09:00:00.000Z',
    },
    {
      id: 'prod_wallet_bifold',
      slug: 'club-reserve-bifold-wallet',
      name: 'Club Reserve Bifold Wallet',
      category: 'wallets',
      priceEgp: 5400,
      isSamplePrice: true,
      shortDescription: 'Slim bi-tone pebble calfskin bifold in obsidian black and deep fairway green.',
      story:
        'A low-profile pocket essential crafted to prevent pocket bulk while keeping eight cards and crisp EGP banknotes organized.',
      images: ['/assets/911/product_wallet_bifold.jpg'],
      variations: [
        { name: 'Black & Club Green', hex: '#2E4333' },
        { name: 'All Black', hex: '#242424' },
      ],
      sizes: ['Slim Fit'],
      stock: 14,
      isNewArrival: false,
      isLimitedEdition: false,
      isFeatured: false,
      materials: ['Full-Grain Pebble Calfskin', 'Waxed Edge Paint'],
      specifications: [
        { label: 'Slots', value: '6 Card Slots + 2 Hidden Sleeves + Full Note Bay' },
        { label: 'Profile', value: '11mm Folded Thickness' },
      ],
      dimensions: '11.2cm W x 9cm H x 1.1cm D',
      careInstructions: 'Avoid overfilling slots to preserve leather tension.',
      views: 88,
      createdAt: '2026-10-25T09:00:00.000Z',
    },
    {
      id: 'prod_bracelet_cuff',
      slug: 'precision-steel-leather-cuff',
      name: 'Precision Steel & Leather Cuff',
      category: 'bracelets',
      priceEgp: 4800,
      isSamplePrice: true,
      shortDescription: 'Brushed stainless steel architectural cuff with champagne clasp and dark calfskin inlay.',
      story:
        'Designed specifically to complement a steel or leather-strapped watch without scratching the case, balancing metallic geometry with tactile warmth.',
      images: ['/assets/911/product_bracelet_cuff.jpg'],
      variations: [{ name: 'Brushed Steel / Espresso Leather', hex: '#7A7670' }],
      sizes: ['Medium (17.5cm)', 'Large (19cm)'],
      stock: 9,
      isNewArrival: true,
      isLimitedEdition: false,
      isFeatured: false,
      materials: ['316L Brushed Steel', 'Full-Grain Calfskin Inlay', 'Push-Lock Clasp'],
      specifications: [
        { label: 'Finish', value: 'Satin Brushed Edge with Champagne Accent Lock' },
        { label: 'Width', value: '8mm Architectural Profile' },
      ],
      dimensions: '8mm band width',
      careInstructions: 'Remove before swimming or showering to preserve leather inlay.',
      views: 76,
      createdAt: '2026-11-04T09:00:00.000Z',
    },
    {
      id: 'prod_sunglasses_rimless',
      slug: '911-atelier-rimless-eyewear',
      name: '911 Atelier Rimless Eyewear',
      category: 'sunglasses',
      priceEgp: 16800,
      isSamplePrice: true,
      shortDescription: 'Rimless geometric lenses suspended on textured champagne-gold temples and pavé bridge hardware.',
      story:
        'An unmistakable evening and resort eyewear silhouette combining featherlight rimless optics with engraved metallic temples.',
      images: ['/assets/911/sunglasses_rimless_gold.png'],
      variations: [{ name: 'Champagne Gold / Clear', hex: '#C9BBA8' }],
      sizes: ['56-18-145'],
      stock: 3,
      isNewArrival: false,
      isLimitedEdition: true,
      isFeatured: false,
      materials: ['Gold-Tone Metal Alloy', 'Optical UV-Filtered Lenses'],
      specifications: [
        { label: 'Construction', value: 'Three-Piece Rimless Mount' },
        { label: 'Bridge', value: 'Faceted Arch Bridge with Silicone Nose Pads' },
      ],
      dimensions: 'Lens 56mm / Bridge 18mm / Temple 145mm',
      careInstructions: 'Always store in rigid protective case and clean with optical spray.',
      views: 109,
      createdAt: '2026-10-30T09:00:00.000Z',
    },
    {
      id: 'prod_sunglasses_architectural',
      slug: 'fairway-matte-acetate-sunglasses',
      name: 'Fairway Matte Acetate Sunglasses',
      category: 'sunglasses',
      priceEgp: 11200,
      isSamplePrice: true,
      shortDescription: 'Sculpted matte charcoal acetate frame with brushed champagne temples and warm smoked UV400 lenses.',
      story:
        'Built for bright Cairo afternoons and coastal drives to El Alamein, pairing a square architectural brow line with glare-reducing warm smoke lenses.',
      images: ['/assets/911/product_sunglasses_tortoise.jpg'],
      variations: [{ name: 'Matte Charcoal / Champagne', hex: '#242424' }],
      sizes: ['53-20-145'],
      stock: 10,
      isNewArrival: true,
      isLimitedEdition: false,
      isFeatured: true,
      materials: ['Milled Matte Acetate', 'Brushed Champagne Metal Temples', 'UV400 Polarized Lenses'],
      specifications: [
        { label: 'Protection', value: '100% UVA/UVB Polarized Filter' },
        { label: 'Hinges', value: '5-Barrel Steel Optical Hinges' },
      ],
      dimensions: 'Lens 53mm / Bridge 20mm / Temple 145mm',
      careInstructions: 'Rinse dust gently before wiping with included microfiber cloth.',
      views: 131,
      createdAt: '2026-11-07T09:00:00.000Z',
    },
    {
      id: 'prod_cap_fairway',
      slug: '911-club-fairway-cap',
      name: '911 Club Fairway Cap',
      category: 'caps',
      priceEgp: 4200,
      isSamplePrice: true,
      shortDescription: 'Crisp pure-white cotton twill six-panel cap featuring raised 911 Men\'s Accessories Club golf crest embroidery.',
      story:
        'Worn on the fairway in our launch film, this structured cap combines breathable heavyweight cotton twill with olive-green and champagne-gold embroidery.',
      images: ['/assets/911/cap_fairway_white.jpg'],
      videoUrl: '/assets/aistudio/kling_20261113_VIDEO_Create_a_p_939_0_7f9753a1.mp4',
      variations: [{ name: 'Pure White / Club Olive & Gold', hex: '#FFFFFF' }],
      sizes: ['Adjustable (55–61cm)'],
      stock: 16,
      isNewArrival: true,
      isLimitedEdition: false,
      isFeatured: true,
      materials: ['Heavyweight Brushed Cotton Twill', 'High-Density Metallic & Olive Embroidery'],
      specifications: [
        { label: 'Crown', value: 'Structured Six-Panel with Embroidered Eyelets' },
        { label: 'Closure', value: 'Concealed Metal Slide Adjuster' },
      ],
      dimensions: 'One size adjustable',
      careInstructions: 'Spot clean by hand with mild detergent; air dry away from direct sun.',
      views: 196,
      createdAt: '2026-11-11T09:00:00.000Z',
    },
  ];

  const orders: Order[] = [
    {
      id: 'ord_seed_1',
      orderNumber: '911-260101',
      userId: 'user_member_1',
      customerName: 'Tarek El-Masry',
      email: 'member@911.eg',
      phone: '+201001234567',
      governorate: 'Cairo',
      city: 'Zamalek',
      addressLine: '14 Hassan Sabry St, Apt 6',
      notes: 'Evening delivery preferred',
      giftWrap: true,
      paymentMethod: 'cod',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      items: [
        {
          productId: 'prod_wallet_clutch',
          name: 'The Sovereign Clutch',
          slug: 'the-sovereign-wrist-clutch',
          image: '/assets/911/wallet_sovereign_clutch.png',
          variation: 'Obsidian Pebble / Brushed Brass',
          unitPriceEgp: 8900,
          quantity: 1,
          reelId: 'reel_3',
        },
        {
          productId: 'prod_cap_fairway',
          name: '911 Club Fairway Cap',
          slug: '911-club-fairway-cap',
          image: '/assets/911/cap_fairway_white.jpg',
          variation: 'Pure White / Club Olive & Gold',
          size: 'Adjustable (55–61cm)',
          unitPriceEgp: 4200,
          quantity: 1,
          reelId: 'reel_1',
        },
      ],
      subtotalEgp: 13100,
      shippingEgp: 120,
      totalEgp: 13220,
      createdAt: '2026-11-02T14:30:00.000Z',
    },
    {
      id: 'ord_seed_2',
      orderNumber: '911-260102',
      customerName: 'Youssef Mansour',
      email: 'youssef.mansour@example.eg',
      phone: '+201119876543',
      governorate: 'Giza & 6th of October / Sheikh Zayed',
      city: 'Sheikh Zayed',
      addressLine: 'Allegria Compound, Villa 48',
      giftWrap: true,
      paymentMethod: 'cod',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      items: [
        {
          productId: 'prod_watch_tonneau',
          name: '911 Club Tonneau Skeleton',
          slug: '911-club-tonneau-skeleton',
          image: '/assets/911/watch_tonneau_skeleton.jpg',
          variation: 'Brushed Silver / Navy Strap',
          size: '42mm Case',
          unitPriceEgp: 148000,
          quantity: 1,
          reelId: 'reel_2',
        },
      ],
      subtotalEgp: 148000,
      shippingEgp: 0,
      totalEgp: 148000,
      createdAt: '2026-11-04T17:15:00.000Z',
    },
    {
      id: 'ord_seed_3',
      orderNumber: '911-260103',
      customerName: 'Hossam Abdelrahman',
      email: 'hossam.abdel@example.eg',
      phone: '+201223344556',
      governorate: 'Cairo',
      city: 'New Cairo',
      addressLine: 'Katameya Heights, Street 3',
      giftWrap: false,
      paymentMethod: 'cod',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      items: [
        {
          productId: 'prod_bag_messenger',
          name: '911 Monogram Crossbody Messenger',
          slug: '911-monogram-crossbody-messenger',
          image: '/assets/911/bag_crossbody_messenger.png',
          variation: 'Matte Black / Champagne 911',
          unitPriceEgp: 14500,
          quantity: 2,
        },
        {
          productId: 'prod_wallet_pouch',
          name: 'The Heritage Pouch',
          slug: 'the-heritage-monogram-pouch',
          image: '/assets/911/wallet_heritage_pouch.png',
          variation: 'Club Green / Matte Black',
          unitPriceEgp: 7400,
          quantity: 1,
        },
      ],
      subtotalEgp: 36400,
      shippingEgp: 0,
      totalEgp: 36400,
      createdAt: '2026-11-07T11:20:00.000Z',
    },
    {
      id: 'ord_seed_4',
      orderNumber: '911-260104',
      customerName: 'Sherif Nabil',
      email: 'sherif.nabil@example.eg',
      phone: '+201067788990',
      governorate: 'Alexandria',
      city: 'Kafr Abdo',
      addressLine: '22 Ahmed Shawky St',
      giftWrap: true,
      paymentMethod: 'cod',
      paymentStatus: 'Pending COD',
      orderStatus: 'Preparing',
      items: [
        {
          productId: 'prod_watch_heritage',
          name: '911 Heritage Automatic — Slate',
          slug: '911-heritage-automatic-slate',
          image: '/assets/911/watch_heritage_auto.jpg',
          variation: 'Slate Dial / Chestnut Leather',
          size: '39mm Case',
          unitPriceEgp: 68500,
          quantity: 1,
        },
      ],
      subtotalEgp: 68500,
      shippingEgp: 0,
      totalEgp: 68500,
      createdAt: '2026-11-11T16:40:00.000Z',
    },
  ];

  const reels: Reel[] = [
    {
      id: 'reel_1',
      title: 'Dawn on the Fairway — Drop 001',
      description: 'The 911 Club Fairway Cap & Tonneau Skeleton in motion on the green.',
      videoUrl: '/assets/911/reels/reel_golf_fairway.mp4',
      coverImage: '/assets/911/cap_fairway_white.jpg',
      productId: 'prod_cap_fairway',
      published: true,
      sortOrder: 1,
      views: 428,
      likedBy: ['user_member_1', 'guest_seed_1', 'guest_seed_2'],
      savedBy: ['user_member_1'],
      shares: 19,
      productClicks: 54,
      addToCartCount: 14,
      attributedPurchases: 1,
      comments: [
        {
          id: 'cmt_1',
          authorName: 'Tarek E.',
          text: 'The olive embroidery on crisp white twill sits effortlessly.',
          createdAt: '2026-11-10T12:15:00.000Z',
        },
      ],
      createdAt: '2026-11-09T10:00:00.000Z',
    },
    {
      id: 'reel_2',
      title: 'Openworked Precision — 911 Club Tonneau',
      description: 'Six-screw brushed bezel and skeletonized movement architecture up close.',
      videoUrl: '/assets/911/reels/reel_tonneau_watch.mp4',
      coverImage: '/assets/911/watch_tonneau_skeleton.jpg',
      productId: 'prod_watch_tonneau',
      published: true,
      sortOrder: 2,
      views: 312,
      likedBy: ['user_member_1', 'guest_seed_1'],
      savedBy: ['user_member_1'],
      shares: 12,
      productClicks: 41,
      addToCartCount: 7,
      attributedPurchases: 1,
      comments: [],
      createdAt: '2026-11-10T10:00:00.000Z',
    },
    {
      id: 'reel_3',
      title: 'Gift-Ready by Design — Sovereign Unboxing',
      description: 'Foil crest box, 911 cotton pouch, and the Sovereign Clutch in pebbled calfskin.',
      videoUrl: '/assets/911/reels/reel_sovereign_clutch.mp4',
      coverImage: '/assets/911/editorial_craft_gifting.jpg',
      productId: 'prod_wallet_clutch',
      published: true,
      sortOrder: 3,
      views: 289,
      likedBy: ['guest_seed_1'],
      savedBy: [],
      shares: 9,
      productClicks: 36,
      addToCartCount: 11,
      attributedPurchases: 1,
      comments: [],
      createdAt: '2026-11-11T10:00:00.000Z',
    },
    {
      id: 'reel_4',
      title: 'Wear Your Statement — The Fairway Silhouette',
      description: 'Structured cotton twill proportioned for early morning rounds and weekend travel.',
      videoUrl: '/assets/911/reels/reel_fairway_cap.mp4',
      coverImage: '/assets/911/cap_fairway_white.jpg',
      productId: 'prod_sunglasses_architectural',
      published: true,
      sortOrder: 4,
      views: 194,
      likedBy: ['user_member_1'],
      savedBy: [],
      shares: 5,
      productClicks: 22,
      addToCartCount: 6,
      attributedPurchases: 0,
      comments: [],
      createdAt: '2026-11-12T10:00:00.000Z',
    },
  ];

  const reviews: Review[] = [
    {
      id: 'rev_1',
      productId: 'prod_wallet_clutch',
      productName: 'The Sovereign Clutch',
      customerName: 'Tarek El-Masry',
      rating: 5,
      comment:
        'Pebble grain feels substantial and the foil-crest unboxing made it effortless as an anniversary gift. Zero pocket bulk.',
      verifiedPurchase: true,
      isSample: true,
      createdAt: '2026-11-05T11:00:00.000Z',
    },
    {
      id: 'rev_2',
      productId: 'prod_watch_tonneau',
      productName: '911 Club Tonneau Skeleton',
      customerName: 'Youssef Mansour',
      rating: 5,
      comment:
        'Wore it straight to Katameya Heights. Lightweight on the navy woven strap and remarkably balanced on the wrist.',
      verifiedPurchase: true,
      isSample: true,
      createdAt: '2026-11-06T16:30:00.000Z',
    },
    {
      id: 'rev_3',
      productId: 'prod_bag_messenger',
      productName: '911 Monogram Crossbody Messenger',
      customerName: 'Hossam Abdelrahman',
      rating: 5,
      comment:
        'Clean tonal branding without shouting. Holds my phone, car key, and cardholder neatly every day.',
      verifiedPurchase: true,
      isSample: true,
      createdAt: '2026-11-09T09:15:00.000Z',
    },
  ];

  const users: StoredUser[] = [
    {
      id: 'user_admin_1',
      name: '911 House Director',
      email: 'admin@911.eg',
      phone: '+201000000911',
      role: 'admin',
      wishlist: ['prod_watch_tonneau'],
      isClubMember: true,
      clubNumber: '0001',
      passwordHash: hashPassword('Club911Admin!'),
      createdAt: now,
    },
    {
      id: 'user_member_1',
      name: 'Tarek El-Masry',
      email: 'member@911.eg',
      phone: '+201001234567',
      role: 'customer',
      wishlist: ['prod_watch_tonneau', 'prod_wallet_clutch'],
      isClubMember: true,
      clubNumber: '0911',
      passwordHash: hashPassword('Club911Member!'),
      createdAt: now,
    },
  ];

  const settings: SiteSettings = {
    heroHeadline: 'WHERE HERITAGE MEETS MODERN PRECISION.',
    heroSubheadline:
      "Discover a considered collection of men's accessories designed for confidence, character, and timeless style.",
    heroPrimaryCta: 'EXPLORE COLLECTION',
    heroSecondaryCta: 'DISCOVER 911',
    bannerText: 'Complimentary courier delivery across Egypt on orders above EGP 15,000',
    showAnnouncementBanner: true,
    lifestyleHeadline: 'CONFIDENCE RUNS DEEP.',
    lifestyleSubheadline:
      'From morning tee times in New Cairo to evening engagements by the Nile, every detail is selected to speak quietly first.',
    featuredProductIds: [
      'prod_watch_tonneau',
      'prod_wallet_clutch',
      'prod_bag_croc',
      'prod_cap_fairway',
    ],
  };

  return {
    products,
    collections,
    reels,
    orders,
    reviews,
    users,
    newsletterSubscribers: [
      { email: 'member@911.eg', subscribedAt: '2026-11-02T10:00:00.000Z' },
    ],
    contactSubmissions: [],
    settings,
  };
}

let cachedStore: StoreData | null = null;

export function getStore(): StoreData {
  if (cachedStore) return cachedStore;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(STORE_PATH)) {
    try {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      cachedStore = JSON.parse(raw) as StoreData;
      return cachedStore;
    } catch (err) {
      console.error('Failed to parse store.json, recreating seed:', err);
    }
  }
  const initial = createInitialData();
  fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
  cachedStore = initial;
  return cachedStore;
}

export function saveStore(store: StoreData): void {
  cachedStore = store;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}
