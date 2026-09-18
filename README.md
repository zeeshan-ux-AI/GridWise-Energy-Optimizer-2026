# GridWise: Autonomous Campus Energy Optimizer ⚡

<div align="center">

[![Build, Test & Publish Docker Image](https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026/actions/workflows/docker.yml/badge.svg)](https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026/actions/workflows/docker.yml)
[![Render Deployment](https://img.shields.io/badge/Render-Live%20Production-46E3B7?logo=render&logoColor=white)](https://gridwise-energy-optimizer-2026.onrender.com/health)
[![GHCR Container](https://img.shields.io/badge/Docker%20Package-GHCR%20Public-2496ED?logo=docker&logoColor=white)](https://github.com/users/zeeshan-ux-AI/packages/container/package/gridwise-energy-optimizer-2026)
[![Docker Pulls](https://img.shields.io/badge/docker%20pull-ghcr.io-blue?logo=docker)](https://github.com/users/zeeshan-ux-AI/packages/container/package/gridwise-energy-optimizer-2026)
[![Test Suite](https://img.shields.io/badge/10%2F10%20Cases-PASSED%20100%25-brightgreen?logo=checkmarx)](https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026)
[![Node.js](https://img.shields.io/badge/Node.js-24%20LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Developed by Team AuraX**  
*Department of Computer Science and Engineering (CSE), Southeast University (SEU)*  
**Official Submission for the BUP CSE Fest 2026 Smart Campus Energy Optimization Challenge**

[Live Production Web Service](https://gridwise-energy-optimizer-2026.onrender.com) • [Published Docker Package](https://github.com/users/zeeshan-ux-AI/packages/container/package/gridwise-energy-optimizer-2026) • [GitHub Repository](https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026) • [CI/CD Pipeline](https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026/actions)

</div>

---

## 📋 Table of Contents

- [Executive Summary](#-executive-summary)
- [Team AuraX & Submission Info](#-team-aurax--submission-info)
- [🌐 Live Cloud Deployments & Endpoints](#-live-cloud-deployments--endpoints)
- [⚡ Quick Start: 60-Second Judge Evaluation](#-quick-start-60-second-judge-evaluation)
- [🐳 Published Docker Package & Container Architecture](#-published-docker-package--container-architecture)
- [🧠 Mathematical Formulation & Optimization Engine](#-mathematical-formulation--optimization-engine)
- [🛡️ Deterministic LLM Guardrails](#️-deterministic-llm-guardrails)
- [📊 10/10 Competition Case Benchmark Results](#-1010-competition-case-benchmark-results)
- [📡 API Specification & Request Format](#-api-specification--request-format)
- [💻 Local Development & Source Build](#-local-development--source-build)
- [📂 Project Directory Structure](#-project-directory-structure)

---

## 🌟 Executive Summary

**GridWise** is an enterprise-grade, containerized energy optimization backend designed and developed by **Team AuraX (Southeast University)** for the **BUP CSE Fest 2026 Smart Campus Energy Optimization Challenge**.

Given a 24-hour scheduling horizon comprising **campus load demands**, **rooftop solar PV generation forecasts**, **dynamic grid tariffs**, **battery storage constraints**, and **unstructured natural-language operator directives**, GridWise:

1. **Interprets operator directives** via structured OpenAI JSON reasoning.
2. **Enforces deterministic safety guardrails**, preventing hallucinated or physically infeasible directives.
3. **Formulates and solves a Mixed-Integer Linear Program (MILP)** to guarantee the global minimum BDT electricity cost.
4. **Performs an independent replay energy balance audit** to mathematically certify that all battery SOC, inverter rate, and energy conservation constraints hold before serving the response.

---

## 👥 Team AuraX & Submission Info

### 🎓 Team Members & Affiliation

| Role | Member Name | Academic Credentials | Institution |
|---|---|---|---|
| **Team Leader** | **Zeeshan** ([@zeeshan-ux-AI](https://github.com/zeeshan-ux-AI)) | Department of Computer Science & Engineering (CSE), **Batch 70** | **Southeast University (SEU)** |
| **Team Member** | **Sun Howlader** | Department of Computer Science & Engineering (CSE), **Batch 70** | **Southeast University (SEU)** |

### 🏆 Hackathon Metadata

| Parameter | Submission Details |
|---|---|
| **Hackathon** | **BUP CSE Fest 2026** |
| **Organized By** | Department of Computer Science and Engineering, Bangladesh University of Professionals (BUP) |
| **Challenge Track** | **Smart Campus Energy Optimization Challenge** |
| **Team Name** | **AuraX** |
| **Optimization Method** | Mixed-Integer Linear Programming (MILP) + Simplex Dual Continuous Solver |
| **Test Accuracy** | **10 / 10 (100%)** Official Competition Scenarios Passed with Exact Ground Truth |

---

## 🌐 Live Cloud Deployments & Endpoints

The GridWise backend is deployed across production cloud infrastructure with 24/7 availability:

| Service / Channel | Live URL | Description | Status |
|---|---|---|:---:|
| **Live Production API (Render)** | [`https://gridwise-energy-optimizer-2026.onrender.com`](https://gridwise-energy-optimizer-2026.onrender.com) | Primary 24/7 Cloud Web Service (Render Docker) | 🟢 **Live & Verified** |
| **Live Healthcheck Probe** | [`https://gridwise-energy-optimizer-2026.onrender.com/health`](https://gridwise-energy-optimizer-2026.onrender.com/health) | Container liveness & readiness check (`{"status":"ok"}`) | 🟢 **HTTP 200 OK** |
| **Live Optimization Endpoint** | `POST https://gridwise-energy-optimizer-2026.onrender.com/optimize-energy` | Full 24-hour MILP optimization & LLM reasoning engine | 🟢 **HTTP 200 OK** |
| **Published Docker Package** | [GHCR Package Details](https://github.com/users/zeeshan-ux-AI/packages/container/package/gridwise-energy-optimizer-2026) | Public OCI container image on GitHub Container Registry | 🟢 **Public Image** |
| **GitHub Repository** | [`zeeshan-ux-AI/GridWise-Energy-Optimizer-2026`](https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026) | Source code, test suites, and CI/CD workflows | 🟢 **Public & Clean** |

---

## ⚡ Quick Start: 60-Second Judge Evaluation

Evaluators and judges can test the live system immediately without cloning code or installing dependencies:

### 1. Test Live Healthcheck (Over HTTPS)
```bash
curl https://gridwise-energy-optimizer-2026.onrender.com/health
```
**Expected Output:**
```json
{"status":"ok"}
```

### 2. Test Live 24-Hour Energy Dispatch (cURL)
```bash
curl -X POST https://gridwise-energy-optimizer-2026.onrender.com/optimize-energy \
  -H "Content-Type: application/json" \
  --data-binary "@sample_request.json"
```

### 3. Test in PowerShell (Windows)
```powershell
$body = Get-Content -Raw sample_request.json
$response = Invoke-RestMethod -Uri "https://gridwise-energy-optimizer-2026.onrender.com/optimize-energy" -Method POST -ContentType "application/json" -Body $body
$response | Select-Object scenario_id, total_cost_bdt, total_grid_kwh, peak_grid_kwh
```
**Expected Output:**
```text
scenario_id total_cost_bdt total_grid_kwh peak_grid_kwh
----------- -------------- -------------- -------------
SAMPLE-01            38365         2692.5         187.5
```

---

## 🐳 Published Docker Package & Container Architecture

The containerized distribution is engineered following cloud-native enterprise standards:

### 📦 GHCR Package Reference
- **Package URL**: [https://github.com/users/zeeshan-ux-AI/packages/container/package/gridwise-energy-optimizer-2026](https://github.com/users/zeeshan-ux-AI/packages/container/package/gridwise-energy-optimizer-2026)
- **Direct Pull Command**:
  ```bash
  docker pull ghcr.io/zeeshan-ux-ai/gridwise-energy-optimizer-2026:latest
  ```

### 🚀 Instant Run Command (Pre-Built Image)
Anyone can launch the full optimization backend with one single command:
```bash
docker run --rm -p 8080:8080 \
  -e OPENAI_API_KEY="your-openai-api-key" \
  -e LLM_MODEL="gpt-4o-mini" \
  ghcr.io/zeeshan-ux-ai/gridwise-energy-optimizer-2026:latest
```

### 🔒 Enterprise Docker Hardening
- **Multi-Stage Build (`Dockerfile`)**:
  - **Stage 1 (`builder`)**: Uses `node:24-bookworm-slim` to compile and bundle `dist/index.mjs` via esbuild.
  - **Stage 2 (`runner`)**: Strips all devDependencies (`npm ci --omit=dev`), resulting in an ultra-compact footprint (~40MB RAM usage).
- **Unprivileged Non-Root Execution**: Runs under unprivileged system user `USER node` (UID 1000) for security hardening.
- **Native Container Healthcheck**: Built-in container healthcheck pinging `http://localhost:8080/health` every 20 seconds.
- **Automated CI/CD Pipeline**: Every push to `main` triggers GitHub Actions to run the full 10-scenario test suite, build the container, perform runtime container validation, and publish to GHCR.

### 🐳 Docker Compose Quickstart
```bash
# 1. Clone repository
git clone https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026.git
cd GridWise-Energy-Optimizer-2026

# 2. Configure environment
cp .env.example .env
# Edit .env and supply your OPENAI_API_KEY

# 3. Spin up the container stack
docker compose up -d

# 4. View real-time container logs
docker compose logs -f

# 5. Stop container
docker compose down
```

---

## 🧠 Mathematical Formulation & Optimization Engine

At each hour \(t \in \{0, 1, \dots, 23\}\), the optimizer decides continuous variables:
- \(S_t\): Solar energy consumed directly (\(\text{kWh}\))
- \(C_t\): Battery charge energy (\(\text{kWh}\))
- \(D_t\): Battery discharge energy (\(\text{kWh}\))
- \(G_t\): Grid import energy (\(\text{kWh}\))
- \(E_t\): Battery stored energy / State of Charge (\(\text{kWh}\))

### 🎯 Objective Function
Minimize the total monetary expenditure of grid electricity over the 24-hour scheduling period:
$$\min \sum_{t=0}^{23} \left( G_t \times \text{Tariff}_t \right)$$

### ⚖️ Operational Constraints
1. **Energy Balance Conservation**:
   $$S_t + D_t + G_t - C_t = \text{Demand}_t \quad \forall t$$
2. **Solar PV Availability**:
   $$0 \le S_t \le \text{SolarAvailable}_t \quad \forall t$$
3. **Battery Energy Dynamics (SOC Continuity)**:
   $$E_t = E_{t-1} + C_t - D_t \quad (E_{-1} = E_{\text{initial}})$$
4. **State of Charge Bounds**:
   $$E_{\text{min}} \le E_t \le E_{\text{capacity}} \quad \forall t$$
5. **Inverter C/D Limits**:
   $$0 \le C_t \le C_{\text{max}}, \quad 0 \le D_t \le D_{\text{max}} \quad \forall t$$
6. **Non-Simultaneous Charge/Discharge**: Handled by LP optimality since \(Tariff_t > 0\) prevents wasteful circular cycling.

---

## 🛡️ Deterministic LLM Guardrails

When operators supply natural-language notes such as:
> *"Keep battery reserve at 150 kWh after 18:00 for evening laboratory loads."*  
> *"Do not charge between 13:00 and 15:00 due to transformer maintenance."*

GridWise processes notes through a dual-stage safety pipeline:

1. **Stage 1 — Structured Extraction**: OpenAI LLM generates a strictly-typed JSON directive containing `action`, `start_hour`, `end_hour`, and `value`.
2. **Stage 2 — Deterministic Guardrails**:
   - `start_hour` and `end_hour` clamped strictly to \([0, 23]\).
   - Reserve amounts capped to battery capacity \(E_{\text{capacity}}\).
   - If any directive violates physical feasibility, it is safely converted to a benign fallback without aborting the solver.

---

## 📊 10/10 Competition Case Benchmark Results

Team AuraX’s optimizer was rigorously evaluated against all **10 public test cases** from the official BUP CSE Fest 2026 problem dataset.

| Case ID | Scenario Name | Hours | Total Cost (BDT) | Grid Import (kWh) | Peak Grid (kWh) | Validation Status |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **SAMPLE-01** | Standard Weekday Campus | 24 | **38,365** | 2,692.5 | 187.5 | ✅ **100% MATCH** |
| **SAMPLE-02** | High Solar Summer Peak | 24 | **42,885** | 2,915.0 | 180.0 | ✅ **100% MATCH** |
| **SAMPLE-03** | Rainy Day Low Generation | 24 | **35,480** | 2,430.0 | 205.0 | ✅ **100% MATCH** |
| **SAMPLE-04** | Heavy Evening Exam Load | 24 | **40,495** | 2,645.0 | 225.0 | ✅ **100% MATCH** |
| **SAMPLE-05** | Weekend Idle Campus | 24 | **33,950** | 2,430.0 | 175.0 | ✅ **100% MATCH** |
| **SAMPLE-06** | Battery Reserve Constraint | 24 | **34,090** | 2,395.0 | 175.0 | ✅ **100% MATCH** |
| **SAMPLE-07** | Strict Peak-Hour Curfew | 24 | **38,550** | 2,560.0 | 185.0 | ✅ **100% MATCH** |
| **SAMPLE-08** | Inverter Capacity Bottleneck | 24 | **37,665** | 2,490.0 | 210.0 | ✅ **100% MATCH** |
| **SAMPLE-09** | Dynamic 3-Tier Tariff | 24 | **34,873** | 2,504.0 | 187.0 | ✅ **100% MATCH** |
| **SAMPLE-10** | Extreme Stress Test | 24 | **41,620** | 2,715.0 | 190.0 | ✅ **100% MATCH** |

**Run Offline Benchmark:**
```bash
npm test
```

---

## 📡 API Specification & Request Format

### 1. `GET /health`
Liveness and readiness probe for container orchestrators.

**Response (HTTP 200 OK):**
```json
{
  "status": "ok"
}
```

---

### 2. `POST /optimize-energy`
Dispatches the 24-hour campus energy schedule.

#### Request Schema Excerpt:
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
    // ... exactly 24 entries (hours 0 through 23)
  ]
}
```

#### Response Schema Excerpt (HTTP 200 OK):
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
    // ... 24 hours verified schedule
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

## 💻 Local Development & Source Build

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests & offline benchmark
npm test

# 3. Type check with strict TypeScript
npm run typecheck

# 4. Build standalone production distribution
npm run build

# 5. Start standalone server
npm start
```

---

## 📂 Project Directory Structure

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
│   └── run_public_cases.mjs     # Live HTTP test runner
├── tests/
│   ├── fixtures/
│   │   └── public-cases.json    # 10 Official competition scenarios
│   └── verify_cases_offline.mjs # 100% offline verification test suite
├── .dockerignore                # Container build context exclusions
├── .env.example                 # Environment template
├── .gitignore                   # Version control exclusions
├── Dockerfile                   # Multi-stage production container build
├── docker-compose.yml           # Production Docker Compose orchestration
├── render.yaml                  # Render 1-click Blueprint deployment spec
├── build.mjs                    # esbuild bundler configuration
├── package.json                 # Node dependencies & npm scripts
├── sample_request.json          # Ready-to-use competition payload
└── tsconfig.json                # TypeScript strict configuration
```

---

## 📜 Submission Declaration & Copyright

This project is developed and submitted by **Team AuraX** for the **BUP CSE Fest 2026 Smart Campus Energy Optimization Challenge**:

- **Zeeshan** (Team Leader, Department of CSE, Batch 70, Southeast University)
- **Sun Howlader** (Team Member, Department of CSE, Batch 70, Southeast University)

Licensed under the [MIT License](LICENSE).