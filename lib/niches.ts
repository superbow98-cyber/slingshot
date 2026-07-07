// Single source of truth for the 12 Slingshot niches.
// Used by: landing page, /templates, /demo gallery, onboarding wizard.

export type Niche = {
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
  feature: string;
  color: string;
  demoSlug: string; // seeded demo tenant slug — see supabase/seed-demo.sql
};

export const NICHES: Niche[] = [
  { slug: 'restoran', name: 'Restoran', emoji: '🍽️', tagline: 'Full-service dining', feature: 'Cart + Kitchen Display + Counter Display', color: '#cb1212', demoSlug: 'demo-restoran' },
  { slug: 'cafe', name: 'Cafe', emoji: '☕', tagline: 'Coffee & pickup orders', feature: 'Pickup-optimized ordering flow', color: '#2c1810', demoSlug: 'demo-cafe' },
  { slug: 'klinik', name: 'Klinik', emoji: '🩺', tagline: 'Medical clinic', feature: 'Appointment booking + IC verification', color: '#0f6b5c', demoSlug: 'demo-klinik' },
  { slug: 'hartanah', name: 'Hartanah', emoji: '🏠', tagline: 'Property listings', feature: 'Property grid + loan calculator', color: '#1a3a52', demoSlug: 'demo-hartanah' },
  { slug: 'auto', name: 'Auto', emoji: '🚗', tagline: 'Car showroom', feature: 'Showroom + trade-in valuator', color: '#1d1d1f', demoSlug: 'demo-auto' },
  { slug: 'pasarmalam', name: 'Pasar Malam', emoji: '🥢', tagline: 'Night market gerai', feature: 'Quick order + gerai pickup', color: '#b45309', demoSlug: 'demo-pasarmalam' },
  { slug: 'event', name: 'Event', emoji: '🎉', tagline: 'Majlis & events', feature: 'WhatsApp quote flow', color: '#6d28d9', demoSlug: 'demo-event' },
  { slug: 'catering', name: 'Catering', emoji: '🍛', tagline: 'Kenduri catering', feature: 'Per-pax pricing + bulk tempahan', color: '#92400e', demoSlug: 'demo-catering' },
  { slug: 'bengkel', name: 'Bengkel', emoji: '🔧', tagline: 'Car workshop', feature: 'Service slot booking', color: '#374151', demoSlug: 'demo-bengkel' },
  { slug: 'dfy', name: 'DFY', emoji: '🚀', tagline: 'Done-for-you sites', feature: 'Discovery call booking', color: '#0f172a', demoSlug: 'demo-dfy' },
  { slug: 'dental', name: 'Dental', emoji: '🦷', tagline: 'Dental clinic', feature: 'Appointment booking', color: '#003366', demoSlug: 'demo-dental' },
  { slug: 'aesthetic', name: 'Aesthetic', emoji: '✨', tagline: 'Aesthetic clinic', feature: 'Premium reserve + VIP tiers', color: '#2a1a2e', demoSlug: 'demo-aesthetic' },
];

export function getNiche(slug: string): Niche | undefined {
  return NICHES.find((n) => n.slug === slug);
}

export type PlanId = 'free' | 'starter' | 'pro' | 'dfy';

export type Plan = {
  id: PlanId;
  name: string;
  price: number; // RM, 0 for free, one-time for dfy
  billing: 'month' | 'one-time';
  tagline: string;
  features: string[];
  featured?: boolean;
  ctaLabel: string;
};

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billing: 'month',
    tagline: 'Try it out, no card needed',
    features: ['1 template', '20 orders / month', 'Slingshot subdomain', 'Community support'],
    ctaLabel: 'Start free',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    billing: 'month',
    tagline: 'Everything to run your business online',
    features: ['All 12 templates', 'Unlimited orders', 'Kitchen + Counter display', 'DuitNow QR payments', 'Email support'],
    featured: true,
    ctaLabel: 'Start 14-day trial',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    billing: 'month',
    tagline: 'Scale across locations',
    features: ['Everything in Starter', 'Custom domain', 'Up to 5 locations', 'Analytics dashboard', 'Priority support'],
    ctaLabel: 'Start 14-day trial',
  },
  {
    id: 'dfy',
    name: 'DFY (Done-For-You)',
    price: 499,
    billing: 'one-time',
    tagline: 'We build it, you approve it',
    features: ['We set up your full site', 'Brand + content done for you', 'Then RM 79/mo Pro plan', 'White-glove onboarding call'],
    ctaLabel: 'Book discovery call',
  },
];
