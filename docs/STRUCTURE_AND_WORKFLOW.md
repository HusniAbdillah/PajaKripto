# Struktur Proyek & Alur Kerja PajaKripto

Dokumen ini adalah panduan teknis untuk tim pengembang (Fauzan, Wandy, Gilang, Qois, Husni).
**WAJIB DIBACA** sebelum mulai coding agar tidak terjadi konflik Git.

---

## 1. Peta Direktori (Directory Map)

Proyek ini menggunakan **Monorepo**. Frontend dan Backend terpisah tapi dalam satu repositori.

```text
pajakripto/                       <-- ROOT (JANGAN NARUH KODE DISINI)
├── .gitignore                    <-- Penjaga keamanan
├── README.md                     <-- Dokumentasi Publik
├── docs/                         <-- Dokumentasi Internal
│   └── STRUCTURE_AND_WORKFLOW.md <-- Struktur & Alur Kerja
|
├── contracts/                    <-- WILAYAH HUSNI (Backend)
│   ├── contracts/
│   │   └── TaxVault.sol          <-- Contract Utama
│   ├── scripts/                  <-- Script Deploy
│   ├── test/                     <-- Unit Testing
│   └── hardhat.config.ts
│
└── frontend/                     <-- WILAYAH FRONTEND TEAM
    ├── public/                   <-- Aset Gambar/Logo
    ├── src/
    │   ├── app/                  <-- ZONA FAUZAN (Routing & Provider)
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   └── globals.css
    │   │
    │   └── lib/                  <-- ZONA GILANG (Logic & Utilities)
    │       └── utils.ts
    │
    ├── package.json
    └── components.json
```

---

## 2. Pembagian Zona (No Trespassing)

Agar tidak bentrok saat merge, hormati wilayah kerja masing-masing:

| Role | Nama | Wilayah Kekuasaan | Tugas Utama |
| --- | --- | --- | --- |
| **FE Lead** | **Fauzan** | `src/app` | Wiring (Kabel) antar komponen, Integrasi Wallet, Deploy Vercel. |
| **UI Designer** | **Wandy** | `frontend` (UI Components) | Membuat tampilan cantik. Jangan pusingin logic berat. |
| **Logic** | **Gilang** | `src/lib` | Menulis rumus pajak dan State Management. |
| **Data** | **Qois** | `frontend` (Data) | Menyediakan data JSON dummy. |
| **Contract** | **Husni** | `contracts/` | Membuat Smart Contract, Testing, dan Deploy ke Base Sepolia. |

> **Aturan:** Jika Wandy butuh data, jangan ubah JSON sendiri. Minta Qois ubah JSON-nya. Jika Gilang butuh tipe data baru, update `types.ts` (jika ada) lalu kabari tim.

---

## 3. Git Workflow (Cara Kerja Harian)

Kita menggunakan strategi **Feature Branching** sederhana.

### A. Persiapan (Setiap Pagi)

Sebelum mulai coding, **SELALU** tarik kode terbaru dari teman-teman.

```bash
# 1. Pindah ke branch main
git checkout main

# 2. Tarik update terbaru
git pull origin main

# 3. Install dependency baru (siapa tau ada yang nambah library)
pnpm install
```

### B. Mulai Coding (Membuat Fitur)

Jangan coding di branch `dev` atau `main`! Buat branch sendiri.

```bash
# Format nama branch: kategori/nama-fitur
# Contoh: ui/dashboard-card, logic/tax-calc, contract/vault

git checkout -b ui/bikin-tombol-keren
```

### C. Simpan Pekerjaan (Selesai Fitur)

```bash
# 1. Add file
git add .

# 2. Commit (Kasih pesan yang jelas!)
git commit -m "feat: menambahkan tombol deposit keren"

# 3. Push ke GitHub
git push -u origin ui/bikin-tombol-keren
```

### D. Menggabungkan Kode (Pull Request)

1. Buka GitHub di browser.
2. Buat **Pull Request (PR)** dari branch kamu ke branch `main`.
3. Minta yang lain untuk review dan merge.

---

## 4. Cheat Sheet (Perintah Penting)

### Frontend

```bash
cd frontend
pnpm dev      # Jalankan server lokal
pnpm add [nama-lib] # Install library baru (JANGAN PAKAI NPM!)
```

### Backend Contract

```bash
cd contracts
npx hardhat compile  # Cek apakah kode solidity error
npx hardhat test     # Jalankan test
```

### Aturan Keras (.env)

* **JANGAN** pernah commit file `.env`.
* Jika kamu nambah variabel baru di `.env`, kabari teman di grup WA agar mereka update file `.env` lokal mereka juga.

---

## Troubleshooting

* **Conflict saat git pull?**
Hubungi yang lain. Jangan asal resolve kalau bingung.
* **Error `node_modules`?**
Hapus folder `node_modules`, lalu jalankan `pnpm install` lagi.
* **Wagmi/Viem Error?**
Pastikan versi `package.json` sama dengan yang lain.

**Yang semangat yah <3**
