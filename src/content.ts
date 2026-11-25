import { brandName, emailAddress } from './lib/brand';

export const fills = {
  tomato: 'bg-tomato',
  butter: 'bg-butter',
  mint: 'bg-mint',
  sky: 'bg-sky',
  grape: 'bg-grape',
  card: 'bg-card',
  ink: 'bg-ink',
  paper: 'bg-paper',
} as const;

export type FillName = keyof typeof fills;

export const letterCycle: FillName[] = ['tomato', 'butter', 'mint', 'sky', 'grape'];

export interface ChipDef {
  id: string;
  kind: 'share' | 'toggle' | 'swatches' | 'cursor' | 'frame' | 'slider' | 'comment' | 'plus';
  label: string;
  w: number;
  h: number;
  fill: FillName;
  radius: number;
  desktopOnly?: boolean;
  mono?: boolean;
}

export interface ChipSlot {
  x: number;
  lift: number;
}

const content = {
  brand: brandName,
  product: 'a browser canvas for sketching interface ideas together',
  audience: 'product designers and the engineers who build their screens',
  heroWord: 'SKETCH LOOSE',
  email: emailAddress,
  company: `${brandName} Labs`,
  address: '418 Lantern Row, Suite 3, Portland, OR 97209',
  title: `${brandName} — sketch interface ideas together`,
  h1: `Sketch loose with ${brandName}, a browser canvas for sketching interface ideas together.`,
  eyebrow: 'NEW · Multiplayer stickies in 3.0',
  subline: `${brandName} is a browser canvas for sketching interface ideas together. Rough enough to play with, exact enough to hand off.`,
  heroNote: `Free for 3 canvases · No card needed · Loved by product designers and the engineers who build their screens`,
  primaryCta: 'Start sketching free',
  secondaryCta: 'See pricing',
  hint: 'Grab anything. Throw it.',
  nav: [
    { label: 'Features', href: './index.html#features' },
    { label: 'Pricing', href: './index.html#pricing' },
    { label: 'Stories', href: './index.html#stories' },
    { label: 'FAQ', href: './index.html#faq' },
  ],
  login: { label: 'Log in', href: './index.html#signup' },
  startFree: { label: 'Start free', href: './index.html#signup' },
  chips: [
    { id: 'share', kind: 'share', label: 'Share', w: 132, h: 52, fill: 'tomato', radius: 999 },
    { id: 'toggle', kind: 'toggle', label: 'Snap to grid', w: 168, h: 52, fill: 'card', radius: 999 },
    { id: 'swatches', kind: 'swatches', label: '', w: 136, h: 52, fill: 'card', radius: 999 },
    { id: 'maya', kind: 'cursor', label: 'Maya', w: 116, h: 48, fill: 'sky', radius: 999 },
    { id: 'theo', kind: 'cursor', label: 'Theo', w: 112, h: 48, fill: 'grape', radius: 999 },
    { id: 'frame', kind: 'frame', label: 'Frame 12', w: 128, h: 44, fill: 'butter', radius: 999, desktopOnly: true, mono: true },
    { id: 'slider', kind: 'slider', label: 'Opacity', w: 184, h: 52, fill: 'card', radius: 999, desktopOnly: true, mono: true },
    { id: 'comment', kind: 'comment', label: 'Looks great!', w: 160, h: 52, fill: 'mint', radius: 999 },
    { id: 'plus', kind: 'plus', label: '', w: 56, h: 56, fill: 'ink', radius: 14 },
  ] satisfies ChipDef[],
  chipSlots: [
    { x: 0.08, lift: 0 },
    { x: 0.9, lift: 0 },
    { x: 0.2, lift: 1 },
    { x: 0.78, lift: 0 },
    { x: 0.5, lift: 1 },
    { x: 0.34, lift: 1 },
    { x: 0.66, lift: 1 },
    { x: 0.14, lift: 1 },
    { x: 0.94, lift: 1 },
  ] satisfies ChipSlot[],
  marquee: [
    'Infinite canvas',
    'Live cursors',
    'Sticky components',
    'Export to code',
    'Version history',
    'Pin comments',
    'Offline mode',
    'Dark canvas',
  ],
  featuresIntro: {
    eyebrow: "WHAT'S INSIDE",
    title: 'Serious tools that like to play.',
    lede: 'Everything a design team needs to go from scribble to shipped screen, without the heavy feeling.',
  },
  features: [
    {
      title: 'Live cursors, real names',
      body: 'See who is on the canvas and where they are pointing. Up to 50 collaborators per board, each with their own color.',
      accent: 'sky' as FillName,
      tint: 'bg-sky-tint',
      vignette: {
        type: 'cursors' as const,
        pieces: [
          { label: 'Ana', fill: 'sky' as FillName },
          { label: 'Raj', fill: 'grape' as FillName },
          { label: 'Jo', fill: 'tomato' as FillName },
        ],
      },
    },
    {
      title: 'Components that snap',
      body: 'Build a button once and reuse it everywhere. Change the original and every copy updates in under a second.',
      accent: 'tomato' as FillName,
      tint: 'bg-tomato-tint',
      vignette: { type: 'tower' as const },
    },
    {
      title: 'Comments that stay put',
      body: 'Pin feedback to the exact pixel. Resolve it with one click when the fix lands.',
      accent: 'mint' as FillName,
      tint: 'bg-mint-tint',
      vignette: {
        type: 'comments' as const,
        labels: ['Bigger?', 'Love it', 'Nudge 4px', 'Ship it'],
      },
    },
    {
      title: 'Every version, kept',
      body: "Scrub back through 12 months of history and restore any frame without losing today's work.",
      accent: 'butter' as FillName,
      tint: 'bg-butter-tint',
      vignette: { type: 'slabs' as const, labels: ['v12', 'v11', 'v10', 'v9', 'v8', 'v7'] },
    },
    {
      title: 'Hand off as code',
      body: 'Export any frame as clean React, Vue or HTML with Tailwind classes, ready to paste.',
      accent: 'grape' as FillName,
      tint: 'bg-grape-tint',
      vignette: { type: 'tags' as const, labels: ['<div>', '<Button />', 'flex', 'gap-4', 'rounded-xl'] },
    },
    {
      title: 'Works on a plane',
      body: 'Edit offline. Changes sync the moment you reconnect, with conflicts shown side by side.',
      accent: 'mint' as FillName,
      tint: 'bg-mint-tint',
      vignette: { type: 'icons' as const, icons: ['cloud-off', 'refresh-cw', 'check'] as const },
    },
  ],
  pricingIntro: {
    eyebrow: 'PRICING',
    title: 'Pick a plan, keep the fun.',
    lede: `Start free. Upgrade when your team outgrows three canvases. Every plan is built for product designers and the engineers who build their screens.`,
  },
  pricingNote: 'Students and teachers get Studio free with a school email. Nonprofits get 50% off Team.',
  plans: [
    {
      id: 'doodle',
      name: 'Doodle',
      monthly: 0,
      yearly: 0,
      monthlyNote: '\u00a0',
      yearlyNote: '\u00a0',
      suffix: '/editor/mo',
      description: 'For trying it on a side project',
      features: ['3 canvases', '2 editors', '30 days of version history', 'PNG and SVG export', 'Community help'],
      cta: 'Start free',
      href: './index.html#signup',
      style: 'outline' as const,
      featured: false,
    },
    {
      id: 'studio',
      name: 'Studio',
      monthly: 12,
      yearly: 9,
      monthlyNote: '\u00a0',
      yearlyNote: 'billed $108 yearly',
      suffix: '/editor/mo',
      description: 'For freelancers and small teams',
      features: [
        'Unlimited canvases',
        'Unlimited viewers',
        '12 months of history',
        'Code export to React, Vue and HTML',
        'Custom component kits',
        'Offline mode',
      ],
      cta: 'Start 14-day trial',
      href: './index.html#signup',
      style: 'primary' as const,
      featured: true,
    },
    {
      id: 'team',
      name: 'Team',
      monthly: 24,
      yearly: 19,
      monthlyNote: '\u00a0',
      yearlyNote: 'billed $228 yearly',
      suffix: '/editor/mo',
      description: 'For product teams shipping weekly',
      features: [
        'Everything in Studio',
        'Shared libraries across teams',
        'Admin roles and audit log',
        'Private canvases',
        'Priority support within 4 business hours',
      ],
      cta: 'Talk to us',
      href: './index.html#signup',
      style: 'outline' as const,
      featured: false,
    },
  ],
  storiesIntro: {
    eyebrow: 'STORIES',
    title: 'Teams that stopped dreading reviews.',
  },
  stats: [
    { label: '38,000 teams', star: false },
    { label: '1.2M canvases made', star: false },
    { label: '4.8/5 from 2,300 reviews', star: true },
  ],
  stories: [
    {
      quote: 'We replaced three tools and a whiteboard with one canvas. Our design reviews went from 60 minutes to 25.',
      name: 'Priya Raman',
      role: 'Design lead, Fernbank Health',
      image: './images/portrait-priya.webp',
      alt: 'Illustrated avatar of Priya Raman, a design lead',
      accent: 'tomato' as FillName,
      rot: -2,
    },
    {
      quote: 'The code export is the first one our engineers did not rewrite. We shipped the onboarding redesign two sprints early.',
      name: 'Marcus Okafor',
      role: 'Front-end engineer, Tidewater Freight',
      image: './images/portrait-marcus.webp',
      alt: 'Illustrated avatar of Marcus Okafor, a front-end engineer',
      accent: 'sky' as FillName,
      rot: 1.5,
    },
    {
      quote: 'I sketch with clients live on calls now. They drag things around, laugh, and sign off faster.',
      name: 'Lena Vogt',
      role: 'Freelance product designer, Hamburg',
      image: './images/portrait-lena.webp',
      alt: 'Illustrated avatar of Lena Vogt, a freelance product designer',
      accent: 'mint' as FillName,
      rot: -1,
    },
  ],
  signup: {
    title: 'Your first canvas is ready when you are.',
    sub: 'Free for 3 canvases. No card, no trial clock.',
    placeholder: 'you@studio.com',
    button: 'Get my canvas',
    error: 'That email looks a little wobbly. Try again?',
    success: 'You are in. Check your inbox for a link to your first canvas.',
  },
  faqIntro: {
    eyebrow: 'FAQ',
    title: 'Questions, answered.',
    curious: 'Still curious?',
    curiousBody: 'Write to',
  },
  faq: [
    {
      q: 'Is the free plan really free?',
      a: 'Yes. Doodle includes 3 canvases and 2 editors with 30 days of history, for as long as you like. Upgrade only when you need more.',
    },
    {
      q: 'Can I bring in my existing files?',
      a: 'Drop in SVG, PNG and PDF files or paste frames from your clipboard. Layers stay editable after import.',
    },
    {
      q: 'How does code export work?',
      a: 'Pick a frame and choose React, Vue or plain HTML. You get components with Tailwind classes and your colors and spacing as CSS variables.',
    },
    {
      q: 'Does it work offline?',
      a: 'On Studio and Team, yes. Keep editing on a plane; changes sync when you reconnect and any conflicts are shown side by side.',
    },
    {
      q: 'What happens to my canvases if I cancel?',
      a: 'They stay readable and you can export everything as SVG or JSON at any time. Nothing is deleted for 12 months.',
    },
    {
      q: 'Do you have education or nonprofit pricing?',
      a: 'Studio is free for students and teachers with a school email. Nonprofits get 50% off Team.',
    },
  ],
  footer: {
    product: [
      { label: 'Features', href: './index.html#features' },
      { label: 'Pricing', href: './index.html#pricing' },
      { label: 'Stories', href: './index.html#stories' },
      { label: 'FAQ', href: './index.html#faq' },
    ],
    company: [
      { label: 'About', href: './index.html' },
      { label: 'Careers', href: './index.html', note: 'we are hiring 4 roles' },
      { label: 'Press kit', href: './index.html' },
    ],
    resources: [
      { label: 'Help center', href: './index.html' },
      { label: 'Templates', href: './index.html' },
      { label: 'Community', href: './index.html' },
    ],
  },
  credit: {
    label: 'Template by VibeFather',
    href: 'https://vibefather.ai/t/physics-playground-landing-page',
  },
};

export default content;
