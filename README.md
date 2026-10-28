<div align="center">

# ☕ Bergkraft

### A direct-to-consumer specialty coffee store, built end to end and deployed live.

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Medusa](https://img.shields.io/badge/Medusa-v2-7C3AED)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)
![Built with](https://img.shields.io/badge/Built%20with-Claude%20Code-D97757)

**A complete online shop for my own coffee brand: storefront, admin dashboard, catalogue, checkout and an automated deployment pipeline.**

[**🌐 Live store**](https://bergkraft.vercel.app) · [The idea](#-the-idea) · [What I built](#-what-i-built) · [Architecture](#-architecture) · [Quick start](#-quick-start) · [Technical details](#-technical-details)

</div>

---

## ☕ The idea

Bergkraft is a personal venture: a specialty coffee brand that sells directly to customers instead of through retailers. Selling direct means owning the whole experience, from the first impression on the homepage to the confirmation email after checkout, and keeping the margin and the customer relationship.

This repository is the technology behind that brand. It is a real, hosted web shop that was running for my coffee business, not a tutorial project.

**The brand story the store tells:** single-origin beans, ethically traded, small-batch roasting and expert curation, with a guide that helps customers find the brewing method that suits them.

---

## 🛍️ What I built

### For customers
- **Branded storefront:** homepage with a hero, brand promise, featured products, origin story, brew guide and newsletter sign-up
- **Product catalogue:** coffee beans, brewing equipment and merchandise, with variants for weight (250 g, 500 g, 1 kg) and grind (whole bean or ground)
- **Cart and checkout:** address entry, shipping method selection, discount codes, payment and order confirmation
- **Customer accounts:** registration, login, order history, saved addresses and profile management
- **Selling across markets:** North America in USD and Europe in EUR, with shipping to the UK, Germany, Denmark, Sweden, France, Spain and Italy

### For running the business
- **Admin dashboard:** manage products, prices, inventory, orders, customers and discounts without touching code
- **Shipping options:** standard and express delivery from a main warehouse
- **Sample catalogue on first start:** one command loads the regions, shipping, categories and products so the shop is usable immediately

### For shipping it reliably
- **One-command local setup** with Docker Compose
- **Automatic deployment:** a push to `main` deploys only the part that changed, the backend to Render and the storefront to Vercel

---

## 🧭 Why this project is a good example of how I work

| What it shows | How |
|---|---|
| **Product thinking** | Defined the customer journey, the catalogue structure, the markets, currencies and shipping options before building |
| **Choosing the right tools** | Used the open-source Medusa commerce engine for carts, orders and payments, and spent my effort on the brand experience and delivery |
| **AI-assisted engineering** | Built the whole system with Claude Code, acting as product owner: specifying, reviewing, and fixing problems until it ran in production |
| **Shipping, not just coding** | Containerised, automated the deployment pipeline and worked through real production issues (authentication, sessions, hosting changes) |
| **E-commerce fundamentals** | Catalogue and variants, pricing in several currencies, regions, shipping profiles, checkout, order management |

---

## 🏗️ Architecture

```mermaid
flowchart LR
    U[Customer browser] --> S[Next.js storefront<br/>Vercel]
    A[Shop owner] --> M
    S -->|Store API| M[Medusa backend<br/>and admin dashboard<br/>Render]
    M --> D[(PostgreSQL)]
    M -.->|local development| R[(Redis)]
    G[GitHub push to main] --> C{GitHub Actions<br/>detect changed folder}
    C -->|coffee-store changed| M
    C -->|storefront changed| S
```

**Two services in one repository (a monorepo):**

| Folder | What it is |
|---|---|
| `coffee-store/` | The commerce backend (Medusa v2): products, carts, orders, customers, regions, shipping, plus the admin dashboard |
| `coffee-store-storefront/` | The customer-facing shop (Next.js 15, React 19, Tailwind CSS) |

---

## 🚀 Quick start

You need Docker with Docker Compose.

```bash
git clone https://github.com/dheerajsuvarna/coffee-store-project.git
cd coffee-store-project
docker compose up --build
```

Then open:

| Service | Address |
|---|---|
| Storefront | http://localhost:3000 |
| Backend API | http://localhost:9000 |
| Admin dashboard | http://localhost:9000/app |

**Load the sample catalogue and create an admin user** by starting the backend with `SEED_ON_START=true`. Set your own admin email and password with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. To rebuild everything from scratch, run `./rebuild.sh`.

> ⚠️ The Docker Compose file uses development placeholder secrets. Set your own `JWT_SECRET`, `COOKIE_SECRET` and admin credentials before deploying anywhere public.

---

## 🔧 Technical details

### Stack

| Layer | Technology |
|---|---|
| Storefront | Next.js 15 (App Router, server components), React 19, TypeScript, Tailwind CSS |
| Commerce engine | Medusa v2 (Node.js 20) with the Medusa admin dashboard |
| Database | PostgreSQL 15 |
| Cache and events (local) | Redis 7 |
| Payments | Medusa payment providers, with Stripe components included in the checkout |
| Containers | Docker and Docker Compose, with health checks and automatic database migrations on start |
| CI/CD | GitHub Actions, path-based change detection |
| Hosting | Vercel (storefront), Render (backend) |

### Deployment pipeline

On every push to `main`, the workflow in `.github/workflows/deploy.yml` checks which folders changed:
- **Backend changed:** triggers the Render deploy hook
- **Storefront changed:** pulls the production environment from Vercel, builds the project, and deploys the prebuilt output

Unchanged services are skipped, which keeps deployments fast and avoids needless restarts.

### Seeded catalogue

| Category | Examples |
|---|---|
| Coffee Beans | Bergkraft Espresso Blend, Bergkraft House Blend |
| Equipment | Bergkraft Premium French Press |
| Merchandise | Bergkraft Canvas Tote Bag |

Prices are set in EUR and USD per region, with weight, grind, capacity and colour variants.

### Project layout

```
coffee-store-project/
├── coffee-store/                  Medusa backend
│   ├── medusa-config.ts           Backend configuration
│   ├── src/scripts/seed.ts        Regions, shipping, categories, products
│   ├── start.sh                   Migrations, optional seeding, server start
│   └── Dockerfile
├── coffee-store-storefront/       Next.js storefront
│   ├── src/app/                   Routes (home, products, cart, checkout, account)
│   ├── src/modules/               UI modules (home, checkout, account, layout)
│   ├── src/lib/data/              Backend data access
│   └── Dockerfile
├── docker-compose.yml             Local stack: database, Redis, backend, storefront
├── rebuild.sh                     Clean rebuild of the local stack
└── .github/workflows/deploy.yml   Automated deployment
```

### Configuration

Copy `coffee-store-storefront/.env.example` and set the backend URL, the publishable API key (created in the admin dashboard under Settings, then API Keys), the default region and the revalidation secret. Variables that start with `NEXT_PUBLIC_` are baked in at build time.

---

## 🗺️ Roadmap

- Live payment provider and transactional emails
- Subscriptions for recurring coffee deliveries
- Product reviews and a loyalty programme
- Analytics dashboard for conversion, average order value and repeat purchase rate
- Automated tests for the checkout flow

---

## 🙏 Acknowledgements

Built on the open-source [Medusa](https://medusajs.com) commerce engine and the Medusa Next.js starter storefront, with the Bergkraft brand, homepage, catalogue, deployment setup and fixes added on top. Developed with [Claude Code](https://claude.com/claude-code).

## 📄 License

The storefront starter is MIT licensed. See `coffee-store-storefront/LICENSE`.
