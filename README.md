# Adaptive Sports Near Me

Find adaptive sports programs, grants and events by place or sport. Free, no account needed. Every listing shows when we last checked it.

**[adaptivesportsnearme.com](https://adaptivesportsnearme.com)** · Made with ❤️ by [Adapt To Life](https://adapttolife.org), a 501(c)(3) nonprofit.

This repository is the whole site, and it's open source. We're building the tools the adaptive sports community needs, in public, and we'd love your help: athletes, parents, coaches, program staff, designers and developers alike.

## What's on the site today

- **Find:** adaptive sports programs near a place, or for a sport, across the United States.
- **Grants:** money for gear, travel and fees, for athletes and for organizations.
- **Events:** clinics, tryouts, games and meetups.
- **Guides:** every sport explained: who plays, what you need and how to start.

A person checks every listing, and every listing shows the day we last checked it.

## Where we're going

These are ideas, not promises. An idea becomes a feature when someone builds it.

- **Grant helper:** walk an athlete or an organization through a grant application, start to finish, so it gets sent.
- **Tournament brackets:** run a bracket for a clinic, a league or a game day, free and on this site.
- **Gear to borrow, try or rent:** one search for adaptive equipment near you, from every program and lending library that has it.

What tool do you wish existed? [Start a discussion](https://github.com/adapttolife/adaptivesportsnearme/discussions/categories/ideas) or email hello@adaptivesportsnearme.com.

## Run it on your computer

You need [Node.js](https://nodejs.org) 22 or later and Git. You don't need a Cloudflare account.

```sh
git clone https://github.com/adapttolife/adaptivesportsnearme.git
cd adaptivesportsnearme
npm run setup   # builds a local database with sample listings
npm run dev     # then open http://localhost:8787
```

Run the tests with `npm test`. Run `npm run setup` again any time to start over with fresh sample data.

The sample is about 120 real public listings in California, Colorado, Florida, New York and Texas, plus every sport and grant. Try http://localhost:8787/near/Denver%2C%20CO.

## How it's built

No framework and no build step: plain JavaScript, HTML and CSS.

| Where | What |
|---|---|
| `public/app/` | The site people use. `app.js` is the shell; each page is a file in `views/`. |
| `public/app/page-meta.js` | Every page's title and description, in one place. |
| `src/` | The server: a [Cloudflare Worker](https://developers.cloudflare.com/workers/) that answers `/api/*`, the forms and each page's first HTML. |
| `db/` | The [D1](https://developers.cloudflare.com/d1/) (SQLite) database: `schema.sql`, `migrations/` and the `sample/` data. |
| `test/` | Tests, run with Node's built-in runner (`npm test`). |
| `tools/directory/` | Scripts for finding and checking listings. |

Deploying, environments and secrets are for maintainers: see [docs/MAINTAINERS.md](docs/MAINTAINERS.md).

## Help build it

Start with [CONTRIBUTING.md](CONTRIBUTING.md). Good places to begin:

- [Good first issues](https://github.com/adapttolife/adaptivesportsnearme/labels/good%20first%20issue): small, well-described fixes.
- [Help wanted](https://github.com/adapttolife/adaptivesportsnearme/labels/help%20wanted): bigger pieces, including the ideas above.
- [No code needed](https://github.com/adapttolife/adaptivesportsnearme/labels/no%20code%20needed): testing, writing and checking listings.

Everyone here follows our [code of conduct](CODE_OF_CONDUCT.md).

## Who built this

Students, volunteers and staff. Their names and what each of them built are in [docs/CREDITS.md](docs/CREDITS.md).

## License

[MIT](LICENSE). Take it, change it, build on it.
