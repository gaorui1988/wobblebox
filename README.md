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

The dev server uses port 4731. The sign-up form stores `{ email, at }` in `localStorage` under `wobblebox:signup`. It does not send the address anywhere.

## Tencent Cloud

Public name: `wobblebox.haizhenkeji.cn`. Point an A record at the host that already serves `wi.haizhenkeji.cn` and `nora.haizhenkeji.cn` (`124.220.178.254`). The wildcard certificate `*.haizhenkeji.cn` already covers this name.

On that host, the same way as Website Intelligence:

```bash
git clone https://github.com/gaorui1988/wobblebox.git /opt/wobblebox
cd /opt/wobblebox
docker compose up -d --build
cp deploy/nginx/wobblebox.haizhenkeji.cn.conf /etc/nginx/conf.d/
nginx -t && systemctl reload nginx
```

Compose builds the static site and serves it on `127.0.0.1:8090`. The host Nginx proxies HTTPS to that port. This page has no API, database, or worker. The image build uses the Tencent Cloud npm mirror `mirrors.tencentyun.com`, the same way `website-intelligence` does, so the first build has to run on that host.

Pulling `node` and `nginx` is a Docker Hub request. On the Tencent Cloud host, `/etc/docker/daemon.json` can set `"registry-mirrors": ["https://mirror.ccs.tencentyun.com"]` so those base images come from the internal registry. That file is on the host, not in this repo.

## Defaults

Built with the template defaults:

- Brand: Wobblebox
- Product: a browser canvas for sketching interface ideas together
- Audience: product designers and the engineers who build their screens
- Headline: SKETCH LOOSE
