"""# 🌐 KERNEL System v2 — RHT ALPHA

![rhtlabs Banner](https://img.shields.io/badge/rhtlabs-Digital_Team_System-00d8d6?style=for-the-badge&logo=target)
![Version](https://img.shields.io/badge/Version-2.0.0--Beta-ff3f34?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Stable-2ecc71?style=for-the-badge)

**KERNEL System** adalah infrastruktur manajemen tim digital dan otomatisasi alur kerja yang dirancang khusus untuk entitas pengembang web dan penyedia jasa layanan digital (*freelance*). Dikembangkan dengan estetika *Cyberpunk-Minimalist* dan fokus pada efisiensi "Root-Level".

---

## 🎭 Visual Identity: The Decrypt Ghost Mask
Sistem ini beroperasi di bawah identitas visual **rhtlabs**. Menggunakan persona *cracked white porcelain mask* sebagai simbol enkripsi dan transparansi data dalam ekosistem pengembangan.

---

## ⚡ Core Features

### 📁 1. Project Workspace Management
Sistem manajemen proyek dinamis yang mengotomatisasi siklus hidup pengembangan dari inisiasi hingga terminasi.
* **Protocol Start:** `/project start` — Membuat workspace privat instan dengan permission khusus lead dev dan klien.
* **Live Tracking:** `/project target` & `/project update` — Memperbarui *Target Tech Stack* dan status progres secara real-time pada papan informasi yang di-pin.
* **Extraction Archive:** `/project finish` — Protokol penghancuran channel otomatis sekaligus mengekstrak seluruh metadata proyek dan riwayat komunikasi ke dalam format **.txt Raw System Log** (Cyberpunk-styled).

### 🆔 2. Cyber-Identity & Gamification
Meningkatkan keterlibatan anggota tim melalui sistem leveling visual.
* **Profile Card:** `/rank` — Menampilkan identitas digital anggota (SYSADMIN/ROOT) dengan bar progres XP bergaya HUD sci-fi.
* **Achievement Tracker:** 4 Tier pencapaian (Bronze, Silver, Gold, Red) untuk aktivitas pengiriman pesan, reaksi, dan durasi di *Voice Channel*.
* **Wall of Fame:** Notifikasi otomatis untuk setiap pencapaian yang diraih anggota tim.

### 🛡️ 3. Security & Sudo Protocols
Pengawasan server tingkat tinggi untuk menjaga integritas ekosistem.
* **The Eye (Logging):** Pemantauan real-time terhadap pesan yang dihapus, diedit, serta perubahan peran/nickname anggota.
* **Admin Commands:** `/mute` (Timeout) dan `/ban` dengan sistem manajemen durasi yang presisi.

### 🎙️ 4. Voice Core
* **Dynamic Channels:** Pembuatan room suara otomatis saat anggota masuk ke generator channel.
* **KERNEL Integration:** `/join` & `/leave` untuk memfasilitasi kehadiran bot di ruang koordinasi.

---

## 🛠️ Tech Stack
* **Engine:** Node.js v18+
* **Library:** Discord.js v14
* **Process Manager:** PM2
* **Database:** Local JSON-based Persistent Storage
* **Hosting Env:** Shared Hosting / VPS

---

## 🚀 Installation & Deployment

1. **Clone Repository**
   ```bash
   git clone [https://github.com/username/kernel-bot.git](https://github.com/username/kernel-bot.git)
   cd kernel-bot ````

2. **Install Dependencies**
   ```bash
   npm install ```

3. **Configuration**
* Buat file .env di direktori utama:
    ```bash
    DISCORD_TOKEN=your_token_here
    CLIENT_ID=your_client_id
    GUILD_ID=your_server_id ```

4. **Register Commands**
    ```bash
    node deploy.js ```

5. **Run the System**
    ```bash
    npx pm2 start index.js --name "KERNEL" ```

---

## 👨‍💻 Developer
Developed by Xianz under rhtlabs Digital Identity.
Yogyakarta, Indonesia.

