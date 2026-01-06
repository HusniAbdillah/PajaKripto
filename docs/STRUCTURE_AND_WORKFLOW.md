# Struktur Proyek & Alur Kerja PajaKripto

**Dokumen Wajib Baca untuk Tim:**
* **Fauzan** (FE Dev & Integration)
* **Wandy** (UI/UX & Components)
* **Gilang** (Logic & Backend Types)
* **Qois** (Data & Mocking)
* **Husni** (Smart Contract)

Dokumen ini mengatur "Tata Tertib" coding kita selama 6 hari Hackathon agar tidak terjadi konflik Git yang mematikan.

---

## 1. Peta Direktori (Directory Map)

Proyek ini adalah **Monorepo**. Kita kerja di satu repo, tapi beda kamar.
**PENTING:** Jangan salah naruh file! Ikuti peta ini.

```text
pajakripto/                            <-- ROOT (JANGAN NARUH KODE DISINI)
├── .gitignore                         <-- Penjaga keamanan (JANGAN DIHAPUS)
├── README.md                          <-- Dokumentasi Publik
├── docs/                              <-- Dokumentasi Internal
│   └── STRUCTURE_AND_WORKFLOW.md      <-- File ini
│
├── contracts/                         <-- WILAYAH HUSNI (Backend)
│   ├── contracts/
│   │   ├── TaxVault.sol               <-- Contract Utama
│   │   └── mocks/
│   │       └── MockIDRX.sol           <-- Token Dummy (Untuk Testing)
│   ├── scripts/                       <-- Script Deploy
│   ├── test/                          <-- Unit Testing
│   ├── .env                           <-- Private Key (JANGAN COMMIT)
│   └── hardhat.config.ts
│
└── frontend/                          <-- WILAYAH FRONTEND TEAM
    ├── .env.local                     <-- API Key (JANGAN COMMIT)
    ├── public/                        <-- Aset Gambar/Logo
    │   └── .well-known/               <-- Config Farcaster Frame
    │
    └── src/
        ├── app/                       <-- ZONA FAUZAN (Routing)
        │   ├── layout.tsx             <-- Setup OnchainKitProvider disini
        │   ├── page.tsx               <-- Halaman Utama Dashboard
        │   └── globals.css            <-- Import Tailwind
        │
        ├── components/                <-- ZONA WANDY (UI)
        │   ├── ui/                    <-- Komponen Shadcn (JANGAN UBAH MANUAL)
        │   ├── layout/
        │   │   ├── MobileContainer.tsx
        │   │   └── Navbar.tsx
        │   ├── dashboard/
        │   │   ├── SummaryCard.tsx
        │   │   └── TxList.tsx
        │   ├── optimizer/
        │   │   └── HarvestCard.tsx
        │   └── feedback/
        │       └── SuccessModal.tsx
        │
        ├── constants/                 <-- JEMBATAN FE & SC
        │   ├── abi/
        │   │   └── TaxVault.json      <-- Copy paste dari folder contracts (Day 3)
        │   ├── contracts.ts           <-- Simpan Address Contract disini
        │   └── locales.ts             <-- Kamus Bahasa (Indo/Inggris)
        │
        ├── data/                      <-- ZONA QOIS (Data)
        │   └── mock/
        │       ├── transactions.json  <-- Data Dummy Transaksi
        │       └── prices.json        <-- Data Dummy Harga
        │
        ├── hooks/                     <-- ZONA FAUZAN (Web3 Logic)
        │   ├── useDepositTax.ts       <-- Logic Write Contract
        │   ├── useLanguage.ts         <-- Logic Ganti Bahasa
        │   └── useTaxBalance.ts       <-- Logic Read Contract
        │
        ├── lib/                       <-- ZONA GILANG (Logic)
        │   ├── utils.ts               <-- Bawaan Shadcn
        │   ├── taxEngine.ts           <-- RUMUS PAJAK PMK 68
        │   ├── formatter.ts           <-- Format Rupiah
        │   └── pdfGenerator.ts        <-- Logic bikin PDF
        │
        └── types/                     <-- ZONA GILANG (Definisi Tipe)
            └── index.ts               <-- Interface TypeScript (Transaction, Token)
```

---

## 2. Pembagian Zona (No Trespassing)

Hormati wilayah teman. Kalau mau edit file di wilayah orang lain, izin dulu di grup WA.

| Role | Nama | Folder Utama | Tugas & Tanggung Jawab |
| --- | --- | --- | --- |
| **FE Dev** | **Fauzan** | `src/app`, `src/hooks`, `src/constants` | Menggabungkan semua komponen, Integrasi Wallet (OnchainKit), Deploy Vercel. |
| **UI Designer** | **Wandy** | `src/components` | Membuat tampilan cantik & responsif. Jangan pusingin logic berat, fokus visual. |
| **Logic** | **Gilang** | `src/lib`, `src/types` | Penjaga `types/index.ts`. Menulis rumus pajak (`taxEngine`). |
| **Data** | **Qois** | `src/data` | Menyediakan data JSON dummy. Format data HARUS sesuai dengan `types` dari Gilang. |
| **Contract** | **Husni** | `contracts/` | Membuat Smart Contract, Unit Testing, dan Deploy ke Base Sepolia. |

**Aturan Emas:**

1. **Gilang adalah Boss Tipe Data:** Jika Wandy/Qois butuh field baru di JSON, lapor Gilang untuk update `types/index.ts` dulu.
2. **Husni Terisolasi:** Husni kerja sendirian di folder `contracts`. Setelah deploy, Husni wajib setor **ABI** dan **Address** ke Fauzan.

---

## 3. Git Workflow (Cara Kerja Harian)

Kita menggunakan strategi **Feature Branching**.
**DILARANG COMMIT LANGSUNG KE BRANCH MAIN!**

### A. Ritual Pagi (Pull Terbaru)

Sebelum coding, pastikan laptopmu sinkron dengan update teman semalam.

```bash
# 1. Pindah ke branch utama
git checkout main

# 2. Tarik update terbaru dari GitHub
git pull origin main

# 3. Update library (penting jika Fauzan nambah library baru)
pnpm install
```

### B. Mulai Coding (Bikin Cabang)

Buat branch baru sesuai fitur yang mau dikerjakan.
*Format:* `kategori/nama-fitur`

```bash
# Contoh Wandy mau bikin Card:
git checkout -b ui/dashboard-card

# Contoh Husni mau bikin Contract:
git checkout -b contract/tax-vault
```

### C. Simpan & Upload (Push)

Setelah fitur selesai (atau mau istirahat):

```bash
# 1. Tandai semua file
git add .

# 2. Simpan dengan pesan jelas
git commit -m "feat: menambahkan desain card dashboard"

# 3. Upload ke GitHub
git push -u origin ui/dashboard-card
```

### D. Gabung Kode (Pull Request)

1. Buka Repo GitHub PajaKripto.
2. Klik tombol **"Compare & pull request"**.
3. Pastikan arah panahnya: `base: main` <--- `compare: ui/dashboard-card`.
4. Klik **Create Pull Request**.
5. Bilang di grup: *"Ges, tolong review PR gue dong."*
6. Yang lain melakukan Merge.

---

## 4. Cheat Sheet (Perintah Penting)

### Untuk Tim Frontend (Fauzan, Wandy, Gilang, Qois)

Masuk dulu ke folder frontend!

```bash
cd frontend

# Jalankan aplikasi (Localhost:3000)
pnpm dev

# Install library baru (JANGAN PAKAI NPM)
pnpm add [nama-library]

# Install komponen UI Shadcn (Khusus Wandy)
npx shadcn@latest add [nama-komponen]
```

### Untuk Tim Backend (Husni)

Masuk dulu ke folder contracts!

```bash
cd contracts

# Cek apakah kode solidity error
npx hardhat compile

# Jalankan test
npx hardhat test

# Deploy (Nanti di hari ke-3)
npx hardhat run scripts/deploy.ts --network baseSepolia
```

---

## 5. Aturan Keras (JANGAN DILANGGAR)

1. **JANGAN PERNAH COMMIT FILE `.env`!**
Kalau sampai private key Husni bocor, project kita bisa di-hack bot. Pastikan file `.env` warnanya abu-abu di VS Code (artinya di-ignore).
2. **JANGAN UBAH STRUKTUR FOLDER.**
Kalau mau nambah folder baru, diskusi dulu sama teman lain.
3. **PAKAI `pnpm`, JANGAN `npm`.**
Kalau kalian pakai `npm install`, akan muncul `package-lock.json` yang bikin konflik sama `pnpm-lock.yaml`.

---

## Troubleshooting

* **Conflict saat git pull?**
Jangan panik. Hubungi teman lain. Jangan asal pencet "Accept Incoming" kalau bingung.
* **Error `node_modules`?**
Hapus folder `node_modules`, lalu jalankan `pnpm install` lagi.
* **Wagmi/Viem Error?**
Pastikan versi di `package.json` kalian sama dengan punya teman lain.

**Yang semangat yah tim! Kita gaspol 6 hari ini!**