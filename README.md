# GridWise: Autonomous Campus Energy Optimizer ⚡

<div align="center">

[![Build, Test & Publish Docker Image](https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026/actions/workflows/docker.yml/badge.svg)](https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026/actions/workflows/docker.yml)
[![GHCR Container](https://img.shields.io/badge/Docker%20Package-GHCR%20Public-2496ED?logo=docker&logoColor=white)](https://github.com/users/zeeshan-ux-AI/packages/container/package/gridwise-energy-optimizer-2026)
[![Docker Pulls](https://img.shields.io/badge/docker%20pull-ghcr.io-blue?logo=docker)](https://github.com/users/zeeshan-ux-AI/packages/container/package/gridwise-energy-optimizer-2026)
[![Test Suite](https://img.shields.io/badge/10%2F10%20Cases-PASSED%20100%25-brightgreen?logo=checkmarx)](https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026)
[![Node.js](https://img.shields.io/badge/Node.js-24%20LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Developed by Team AuraX**  
*Official Submission for the BUP CSE Fest 2026 Smart Campus Energy Optimization Challenge*

[Live GitHub Repository](https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026) • [Published Docker Package](https://github.com/users/zeeshan-ux-AI/packages/container/package/gridwise-energy-optimizer-2026) • [CI/CD Pipeline](https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026/actions)

</div>

---

## 📋 Table of Contents

- [Executive Summary](#-executive-summary)
- [Team AuraX & Submission Info](#-team-aurax--submission-info)
- [⚡ Quick Start: 60-Second Judge Evaluation](#-quick-start-60-second-judge-evaluation)
- [🐳 Published Docker Package & Container Architecture](#-published-docker-package--container-architecture)
- [🧠 Mathematical Formulation & Optimization Engine](#-mathematical-formulation--optimization-engine)
- [🛡️ Deterministic LLM Guardrails](#️-deterministic-llm-guardrails)
- [📊 10/10 Competition Case Benchmark Results](#-1010-competition-case-benchmark-results)
- [📡 API Specification](#-api-specification)
- [💻 Local Development & Source Build](#-local-development--source-build)
- [📂 Project Directory Structure](#-project-directory-structure)

---

## 🌟 Executive Summary

**GridWise** is a production-grade, containerized energy optimization backend built by **Team AuraX** to tackle the dynamic, multi-constrained energy dispatch problem of a smart university campus.

Given a 24-hour horizon comprising **campus load demands**, **rooftop solar PV generation forecasts**, **dynamic grid tariffs**, **battery storage parameters**, and **unstructured natural-language operator directives**, GridWise:

1. **Interprets operator directives** via structured OpenAI JSON reasoning.
2. **Enforces deterministic safety guardrails**, preventing hallucinated or physically infeasible directives.
3. **Formulates and solves a Mixed-Integer Linear Program (MILP)** to find the global minimum BDT electricity cost.
4. **Performs an independent replay energy balance audit** to mathematically certify that all battery SOC, inverter rate, and energy conservation constraints hold before returning the schedule.

---

## 👥 Team AuraX & Submission Info

| Parameter | Details |
|---|---|
| **Team Name** | **AuraX** |
| **Hackathon** | BUP CSE Fest 2026 |
| **Challenge Track** | Smart Campus Energy Optimization Challenge |
| **Repository** | [`zeeshan-ux-AI/GridWise-Energy-Optimizer-2026`](https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026) |
| **Published Package** | [`ghcr.io/zeeshan-ux-ai/gridwise-energy-optimizer-2026:latest`](https://github.com/users/zeeshan-ux-AI/packages/container/package/gridwise-energy-optimizer-2026) |
| **Package Visibility** | **Public** (No authentication required to pull) |
| **Optimization Method** | Mixed-Integer Linear Programming (MILP) + Simplex Dual Solver |
| **Test Accuracy** | **10 / 10 (100%)** Official Competition Scenarios Matched |

---

## ⚡ Quick Start: 60-Second Judge Evaluation

Evaluators and judges can test the live system immediately without setting up any build environment or cloning code.

### 1. Run the Pre-Built Container (1 Single Command)
```bash
docker run --rm -p 8080:8080 \
  -e OPENAI_API_KEY="your-openai-api-key" \
  -e LLM_MODEL="gpt-4o-mini" \
  ghcr.io/zeeshan-ux-ai/gridwise-energy-optimizer-2026:latest
```

### 2. Verify Container Health
```bash
curl http://localhost:8080/health
```
**Expected Response:**
```json
{"status":"ok"}
```

### 3. Run Optimization on Competition Sample Request
```bash
# In PowerShell or Bash:
curl -X POST http://localhost:8080/optimize-energy \
  -H "Content-Type: application/json" \
  --data-binary @sample_request.json
```

---

## 🐳 Published Docker Package & Container Architecture

The containerized distribution is engineered following enterprise container standards:

### 📦 GHCR Package Reference
- **Package URL**: [https://github.com/users/zeeshan-ux-AI/packages/container/package/gridwise-energy-optimizer-2026](https://github.com/users/zeeshan-ux-AI/packages/container/package/gridwise-energy-optimizer-2026)
- **Direct Pull**:
  ```bash
  docker pull ghcr.io/zeeshan-ux-ai/gridwise-energy-optimizer-2026:latest
  ```

### 🔒 Enterprise Docker Architecture
- **Multi-Stage Build**:
  - **Stage 1 (`builder`)**: Uses `node:24-bookworm-slim` to compile and bundle `dist/index.mjs` via esbuild.
  - **Stage 2 (`runner`)**: Strips all devDependencies (`npm ci --omit=dev`), resulting in a minimal attack surface and small image footprint.
- **Unprivileged Non-Root Execution**: Runs under system user `USER node` (UID 1000) for security hardening.
- **Native Healthcheck**: Built-in container healthcheck pinging `http://localhost:8080/health` every 20 seconds.
- **Automated CI/CD**: Every push to `main` triggers GitHub Actions to run the full 10-scenario test suite, build the container, perform runtime container validation, and publish to GHCR.

### Docker Compose Quickstart
```bash
# Clone the repository
git clone https://github.com/zeeshan-ux-AI/GridWise-Energy-Optimizer-2026.git
cd GridWise-Energy-Optimizer-2026

# Create your .env file
cp .env.example .env

# Spin up the container
docker compose up -d

# Check live logs
docker compose logs -f

# Teardown
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

**Offline Validation Command**:
```bash
npm test
```

---

## 📡 API Specification

### 1. `GET /health`
Liveness and readiness probe for container orchestrators.

**Response:**
```json
{
  "status": "ok"
}
```

---

### 2. `POST /optimize-energy`
Dispatches the 24-hour campus energy schedule.

#### Request Schema
```json
{
  "scenario_id": "CAMPUS-2026-01",
  "operator_notes": [
    "Do not charge the battery between 14:00 and 16:00.",
    "Maintain at least 100 kWh reserve after 18:00."
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

#### Response Schema
```json
{
  "scenario_id": "CAMPUS-2026-01",
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

If you wish to build or run the source code outside Docker:

```bash
# 1. Install dependencies
npm install

# 2. Run test suite
npm test

# 3. Type check
npm run typecheck

# 4. Build production bundle
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
│   ├── app.ts                   # Express server configuration
│   ├── index.ts                 # Standalone HTTP server bootstrap
│   ├── gridwise/
│   │   ├── directives.ts        # Directive schemas & parser
│   │   ├── guardrails.ts        # Bounds checking & safety enforcement
│   │   ├── llm.ts               # OpenAI JSON structured caller
│   │   ├── optimizer.ts         # Mixed-Integer Linear Program solver
│   │   ├── replay.ts            # Independent energy balance replayer
│   │   ├── request-validation.ts# Schema parser & payload validator
│   │   ├── service.ts           # Top-level optimization orchestrator
│   │   └── types.ts             # Domain interfaces and custom errors
│   ├── lib/
│   │   └── logger.ts            # Zero-dependency structured JSON logger
│   └── routes/
│       ├── health.ts            # GET /health router
│       ├── index.ts             # Express root route aggregator
│       └── optimize-energy.ts   # POST /optimize-energy router
├── scripts/
│   └── run_public_cases.mjs     # Live HTTP test runner
├── tests/
│   ├── fixtures/
│   │   └── public-cases.json    # 10 Official competition scenarios
│   └── verify_cases_offline.mjs # 100% offline verification test suite
├── .dockerignore                # Docker build context exclusions
├── .env.example                 # Environment variables template
├── .gitignore                   # Git version control exclusions
├── Dockerfile                   # Multi-stage production container build
├── docker-compose.yml           # Production Docker Compose orchestration
├── build.mjs                    # esbuild production bundler
├── package.json                 # Project dependencies & npm scripts
├── sample_request.json          # Ready-to-use competition payload
└── tsconfig.json                # TypeScript strict configuration
```

---

## 📜 License & Submission Declaration

This project is developed and submitted by **Team AuraX** for the **BUP CSE Fest 2026 Smart Campus Energy Optimization Challenge**.  
Licensed under the [MIT License](LICENSE).