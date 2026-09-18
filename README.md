# GridWise Energy Optimizer ⚡

[![Build, Test & Publish Docker Image](https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026/actions/workflows/docker.yml/badge.svg)](https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026/actions/workflows/docker.yml)
[![Docker Image](https://img.shields.io/badge/Docker-GHCR-blue?logo=docker)](https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026/pkgs/container/gridwise-energy-optimizer-2026)
[![Node.js](https://img.shields.io/badge/Node.js-24%20LTS-green?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> **Official Competition Submission** for the **BUP CSE Fest 2026 Smart Campus Energy Optimization Challenge**.

GridWise is an enterprise-grade, containerized HTTP API backend engineered to solve complex campus microgrid dispatch problems. Given a 24-hour horizon of campus load demand, rooftop solar generation forecasts, grid tariffs, battery specs, and free-form natural language operator notes, GridWise deterministically translates operator notes via LLM guardrails, computes the mathematically optimal minimum-cost dispatch schedule using **Mixed-Integer Linear Programming (MILP)**, and performs an independent energy balance replay audit before serving the response.

---

## 🏆 Key Features & Compliance

- **100% Problem Statement Accuracy**: Validated against all official competition sample test cases with exact ground-truth cost matching.
- **MILP Mathematical Optimization**: Solves constrained continuous energy flows across solar, battery charge/discharge, and grid import minimizing total BDT expenditure.
- **Deterministic LLM Guardrails**: Converts natural-language instructions into strict JSON directives with bounded safety checks.
- **Independent Replay Audit**: Validates hourly energy conservation (\(Load = Solar + Discharge + Grid - Charge\)) and battery SOC bounds (\(E_{min} \le E_t \le E_{max}\)).
- **Production Docker Container**: Multi-stage lightweight build (`node:24-bookworm-slim`), unprivileged `node` user security, native healthcheck, and zero external runtime dependencies.
- **Automated CI/CD**: Automated GitHub Actions testing, container building, healthcheck verification, and automated publishing to GitHub Container Registry (GHCR).

---

## ⚡ Architecture Pipeline

```text
  [ Client Request ]
         │
         ▼
  ┌────────────────────────────────────────────────────────┐
  │ 1. Request Validation (Zod-level bounds, 24h checks)    │
  └────────────────────────┬───────────────────────────────┘
                           │
                           ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. LLM Operator-Note Parser (OpenAI JSON Structured)  │
  └────────────────────────┬───────────────────────────────┘
                           │
                           ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. Deterministic Safety Guardrails                     │
  │    - Bounds validation (hour 0-23, reserve <= capacity)│
  │    - Reverts invalid directives to safe defaults       │
  └────────────────────────┬───────────────────────────────┘
                           │
                           ▼
  ┌────────────────────────────────────────────────────────┐
  │ 4. Mixed-Integer Linear Program (MILP Solver)          │
  │    Objective: min ∑ (GridImport_t * Tariff_t)          │
  │    Subject to: Battery SOC, Inverter C/D rates, Demand │
  └────────────────────────┬───────────────────────────────┘
                           │
                           ▼
  ┌────────────────────────────────────────────────────────┐
  │ 5. Independent Replay Validator                        │
  │    - Verifies Load = Solar + Discharge + Grid - Charge │
  │    - Recalculates total cost & peak grid kW            │
  └────────────────────────┬───────────────────────────────┘
                           │
                           ▼
  [ Verified JSON Response (Status 200) ]
```

---

## 🐳 Docker Deployment (Core Focus)

The container image is built, verified, and published automatically on GitHub Container Registry (GHCR).

### 1. Run the Pre-Built Published Container (Instant Start)
No build tools or repository clone required:
```bash
docker run --rm -p 8080:8080 \
  -e OPENAI_API_KEY="your-openai-api-key" \
  -e LLM_MODEL="gpt-4o-mini" \
  ghcr.io/zeeshan-ux-ai/gridwise-energy-optimizer-2026:latest
```

Verify the running container:
```bash
curl http://localhost:8080/health
# Returns: {"status":"ok"}
```

---

### 2. Run with Docker Compose
Clone the repository and spin up the complete containerized stack:
```bash
# 1. Clone repository
git clone https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026.git
cd GridWise-Energy-Optimizer-2026

# 2. Configure environment
cp .env.example .env
# Edit .env and supply your OPENAI_API_KEY

# 3. Start container with Docker Compose
docker compose up -d

# 4. View real-time container logs
docker compose logs -f

# 5. Stop container
docker compose down
```

---

### 3. Build & Run from Source (Local Docker)
```bash
# Build Docker image
npm run docker:build
# Or directly: docker build -t gridwise-api .

# Run container with environment file
docker run --rm -p 8080:8080 --env-file .env gridwise-api
```

---

## 💻 Local Development (Non-Docker)

### Prerequisites
- **Node.js**: >= 20.0.0 (Node 22 or 24 LTS recommended)
- **npm** or **pnpm**

### Installation & Run
```bash
# Install dependencies
npm install

# Build standalone distribution
npm run build

# Start production server
npm start
```
The server will start on `http://localhost:8080`.

---

## 🧪 Verification & Test Suite

### 1. Offline Optimization & Replay Validation (10/10 Test Cases)
Run the offline verification suite across all 10 official competition scenarios:
```bash
npm test
```
**Output:**
```text
==================================================
GridWise Offline Optimization & Replay Validation
==================================================
✅ SAMPLE-01  PASS (Cost: 38365 BDT, Grid: 2692.5 kWh, Peak: 187.5 kWh)
✅ SAMPLE-02  PASS (Cost: 42885 BDT, Grid: 2915.0 kWh, Peak: 180 kWh)
✅ SAMPLE-03  PASS (Cost: 35480 BDT, Grid: 2430.0 kWh, Peak: 205 kWh)
✅ SAMPLE-04  PASS (Cost: 40495 BDT, Grid: 2645.0 kWh, Peak: 225 kWh)
✅ SAMPLE-05  PASS (Cost: 33950 BDT, Grid: 2430.0 kWh, Peak: 175 kWh)
✅ SAMPLE-06  PASS (Cost: 34090 BDT, Grid: 2395.0 kWh, Peak: 175 kWh)
✅ SAMPLE-07  PASS (Cost: 38550 BDT, Grid: 2560.0 kWh, Peak: 185 kWh)
✅ SAMPLE-08  PASS (Cost: 37665 BDT, Grid: 2490.0 kWh, Peak: 210 kWh)
✅ SAMPLE-09  PASS (Cost: 34873 BDT, Grid: 2504.0 kWh, Peak: 187 kWh)
✅ SAMPLE-10  PASS (Cost: 41620 BDT, Grid: 2715.0 kWh, Peak: 190 kWh)
==================================================
Result: 10/10 cases PASSED 100%
==================================================
```

### 2. TypeScript Static Analysis
```bash
npm run typecheck
```

---

## 📡 API Specification

### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "ok"
}
```

---

### 2. Optimize Energy Dispatch
```http
POST /optimize-energy
Content-Type: application/json
```

#### Request Format (Excerpt):
```json
{
  "scenario_id": "CAMPUS-SAMPLE-01",
  "operator_notes": [
    "Do not charge the battery between 14:00 and 16:00.",
    "Keep at least 100 kWh in reserve after 18:00."
  ],
  "battery": {
    "capacity_kwh": 500,
    "initial_energy_kwh": 200,
    "minimum_energy_kwh": 50,
    "max_charge_kwh_per_hour": 100,
    "max_discharge_kwh_per_hour": 100
  },
  "hours": [
    {
      "hour": 0,
      "demand_kwh": 180,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 7
    }
    // ... total 24 hours (0 through 23)
  ]
}
```

#### Response Format (Excerpt):
```json
{
  "scenario_id": "CAMPUS-SAMPLE-01",
  "total_cost_bdt": 38365,
  "total_grid_import_kwh": 2692.5,
  "peak_grid_import_kwh": 187.5,
  "schedule": [
    {
      "hour": 0,
      "solar_used_kwh": 0,
      "battery_charge_kwh": 0,
      "battery_discharge_kwh": 0,
      "grid_import_kwh": 180,
      "battery_soc_kwh": 200
    }
    // ... 24 hours schedule
  ],
  "operator_notes_applied": [
    {
      "note": "Do not charge the battery between 14:00 and 16:00.",
      "action": "Applied constraint: charge_kwh = 0 for hours 14 to 16",
      "status": "APPLIED"
    }
  ]
}
```

---

## 📂 Project Structure

```text
GridWise-Energy-Optimizer-2026/
├── .github/
│   └── workflows/
│       └── docker.yml            # CI/CD: Automated Test, Build & GHCR Publish
├── src/
│   ├── app.ts                   # Express server setup & middleware
│   ├── index.ts                 # Standalone HTTP server bootstrap
│   ├── gridwise/
│   │   ├── directives.ts        # Operator note directive schemas
│   │   ├── guardrails.ts        # Safety checks & boundary validation
│   │   ├── llm.ts               # OpenAI JSON Structured interpretation
│   │   ├── optimizer.ts         # Mixed-Integer Linear Programming solver
│   │   ├── replay.ts            # Schedule replay & energy balance auditor
│   │   ├── request-validation.ts# Schema parser & boundary checks
│   │   ├── service.ts           # Orchestrator
│   │   └── types.ts             # Domain types & custom Error classes
│   ├── lib/
│   │   └── logger.ts            # Zero-dependency structured JSON logger
│   └── routes/
│       ├── health.ts            # GET /health router
│       ├── index.ts             # Combined Express routers
│       └── optimize-energy.ts   # POST /optimize-energy router
├── scripts/
│   └── run_public_cases.mjs     # Competition test runner script
├── tests/
│   ├── fixtures/
│   │   └── public-cases.json    # 10 Official competition scenarios
│   └── verify_cases_offline.mjs # 100% offline verification test suite
├── .dockerignore                # Container build exclusions
├── .env.example                 # Environment template
├── .gitignore                   # Version control exclusions
├── Dockerfile                   # Multi-stage production container build
├── docker-compose.yml           # Production Docker Compose orchestration
├── build.mjs                    # esbuild bundler configuration
├── package.json                 # Node dependencies & npm scripts
├── sample_request.json          # Pre-built competition payload for testing
└── tsconfig.json                # TypeScript strict configuration
```

---

## 👥 Authors & Acknowledgments

- **Team**: GridWise Team
- **Hackathon**: BUP CSE Fest 2026 — Smart Campus Energy Optimization Challenge
- **License**: MIT