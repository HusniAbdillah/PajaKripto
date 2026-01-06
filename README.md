# PajaKripto

> **DeFi Speed, Corporate Compliance.**
> Indonesia's first Onchain Tax Compliance Layer on **Base**, powered by **OnchainKit** & **IDRX**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Base Sepolia](https://img.shields.io/badge/Network-Base%20Sepolia-blue)](https://sepolia.basescan.org/)
[![Built With: OnchainKit](https://img.shields.io/badge/Built%20With-OnchainKit-0052FF)](https://onchainkit.xyz)

## 🇮🇩 The Problem

In Indonesia, crypto transactions are subject to specific taxes (**PMK 68/2022**): **0.1% Income Tax (PPh)** and **0.11% VAT (PPN)** based on the Rupiah value at the exact time of transaction.

For active traders on Base L2, manually calculating this liability from thousands of swaps is impossible. This creates a **"Fear Barrier"**: users are afraid to cash out or adopt DeFi fully because they fear tax audits and frozen bank accounts.

## 💡 The Solution

**PajaKripto** removes the friction of compliance. We built a **Base Mini-App** that allows users to:
1.  **Scan & Calculate:** Instantly fetch transaction history and calculate tax liability based on historical IDR prices.
2.  **Tax-Loss Harvesting:** Detect unrealized losses and suggest strategic selling to legally reduce tax bills.
3.  **Tax-Safe Vault (IDRX):** A smart contract vault where users can lock their tax money in **IDRX (Rupiah Stablecoin)** to prevent accidental spending.
4.  **One-Click Report:** Generate a PDF report ready for Indonesia's Annual Tax Return (SPT).

---

## 🛠️ Tech Stack

This project works as a Monorepo containing both the Frontend and Smart Contracts.

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | React Framework with Server Components. |
| **Styling** | Tailwind CSS + Shadcn UI | Mobile-first responsive design for Farcaster Frames. |
| **Wallet UX** | **OnchainKit** | Seamless connection via Coinbase Smart Wallet. |
| **Smart Contract** | Solidity + Hardhat | `TaxVault.sol` deployed on Base Sepolia. |
| **Currency** | **IDRX** | Indonesian Rupiah Stablecoin for tax settlements. |
| **Data Logic** | TypeScript | Custom engine for PMK 68 calculation logic. |

---

## ⚡ Key Features

### 1. 🔍 Automated Tax Engine
Calculates Final Income Tax (PPh) and VAT (PPN) automatically from onchain data.

### 2. 📉 Tax-Loss Harvesting Optimizer
The "Killer Feature". It scans your portfolio for assets trading below their buy price and suggests an automated swap flow to realize losses, offsetting capital gains tax.

### 3. 🏦 Onchain Tax Vault
Users deposit **IDRX** into our `TaxVault` smart contract.
* **Safety:** Funds are separated from trading capital.
* **Compliance:** Proof of tax readiness is recorded onchain.

---

## 🚀 Getting Started

Follow these steps to run PajaKripto locally.

### Prerequisites
* Node.js & **pnpm** (Required)
* Git

### 1. Clone the Repository
```bash
git clone [https://github.com/HusniAbdillah/PajaKripto.git](https://github.com/HusniAbdillah/PajaKripto.git)
cd PajaKripto
```

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Setup Environment Variables
cp .env.example .env.local
# (Fill in your NEXT_PUBLIC_ONCHAINKIT_API_KEY from Coinbase CDP)

# Run Development Server
pnpm dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser (Use Mobile View/Inspect Element).

### 3. Setup Smart Contracts

```bash
cd contracts

# Install dependencies
pnpm install

# Compile Contracts
npx hardhat compile

# Run Tests
npx hardhat test
```

---

## ⛓️ Smart Contract Details

**Network:** Base Sepolia (Testnet)

| Contract Name | Address | Description |
| --- | --- | --- |
| `TaxVault.sol` | `0x...` (Coming Soon) | Vault for storing user's IDRX tax funds. |
| `MockIDRX.sol` | `0x...` (Coming Soon) | Dummy IDRX token for hackathon testing. |

> *Note: Addresses will be updated after deployment on Day 3.*

---

## 👥 The Team

We are a team of 5 Computer Science students from IPB University, building for the future of compliant onchain finance.

* **Fauzan** - Frontend Dev & OnchainKit Integrator
* **Wandy** - UI/UX Designer & PDF Engine
* **Gilang** - Backend Logic & Tax Engine
* **Qois** - Data Engineering & Mocking
* **Husni** - Smart Contract & Blockchain Engineering

---

## 📄 License

This project is licensed under the [MIT License](https://www.google.com/search?q=LICENSE).

---

> **Note for Judges:**
> The application interface defaults to **Bahasa Indonesia** as it targets local tax compliance (PMK 68). However, the codebase and documentation are strictly in English.
