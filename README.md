# Wobblebox

A one-page site for Wobblebox, a browser canvas for sketching interface ideas together. The first screen is a toy: the letters of “SKETCH LOOSE” and a handful of interface chips are rigid bodies in a small 2D physics engine written for this page. Grab a piece, throw it, and on a phone you can tilt the device to tip gravity.

Below the hero: a feature marquee, six cards with their own tiny physics scenes, pricing, stories, a sign-up band that drops confetti into the browser only, an FAQ, and a footer.

## Run it

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

The sign-up form stores `{ email, at }` in `localStorage` under `wobblebox:signup`. It does not send the address anywhere.

## Defaults

Built with the template defaults:

- Brand: Wobblebox
- Product: a browser canvas for sketching interface ideas together
- Audience: product designers and the engineers who build their screens
- Headline: SKETCH LOOSE
