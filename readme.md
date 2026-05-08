# 🌐 KERNEL System v2 — RHT ALPHA

![rhtlabs Banner](https://img.shields.io/badge/rhtlabs-Digital_Team_System-00d8d6?style=for-the-badge&logo=target)
![Version](https://img.shields.io/badge/Version-2.0.0--Beta-ff3f34?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Stable-2ecc71?style=for-the-badge)

**KERNEL System** adalah infrastruktur manajemen tim digital dan otomatisasi alur kerja yang dirancang khusus untuk entitas pengembang web dan penyedia jasa layanan digital (*freelance*). Dikembangkan dengan estetika *Cyberpunk-Minimalist* dan fokus pada efisiensi "Root-Level".

---

## 💡 Gambaran Umum
KERNEL System dirancang untuk mengoptimalkan kolaborasi dan produktivitas tim digital Anda. Dengan serangkaian fitur canggih mulai dari manajemen proyek, sistem gamifikasi, hingga protokol keamanan, KERNEL siap menjadi tulang punggung operasional Anda.

---

## 🎭 Visual Identity: The Decrypt Ghost Mask
Sistem ini beroperasi di bawah identitas visual **rhtlabs**. Menggunakan persona *cracked white porcelain mask* sebagai simbol enkripsi dan transparansi data dalam ekosistem pengembangan.

---

## ⚡ Core Features

### 📁 1. Project Workspace Management
Sistem manajemen proyek dinamis yang mengotomatisasi siklus hidup pengembangan dari inisiasi hingga terminasi. Fitur ini dirancang untuk menciptakan lingkungan kerja yang terstruktur dan efisien.
*   **`/project start <nama> <klien>`**
    *   **Kegunaan:** Membuat *workspace* proyek baru yang privat (berupa *text channel*) dengan izin akses khusus untuk *lead developer* (Anda) dan klien yang ditunjuk. Secara otomatis akan menyematkan papan informasi proyek di channel tersebut.
    *   **Cara Penggunaan:** Ketik `/project start nama:nama-proyek klien:@nama-klien`. Contoh: `/project start nama:website-rhtlabs klien:@john_doe`.
*   **`/project update <status>`**
    *   **Kegunaan:** Memperbarui status progres proyek secara *real-time* pada papan informasi yang disematkan di *channel* proyek.
    *   **Cara Penggunaan:** Ketik `/project update status:Development (Laragon/Local)` atau pilih opsi status lainnya dari daftar yang tersedia.
*   **`/project target <tech>`**
    *   **Kegunaan:** Memperbarui informasi *Target Tech Stack* proyek pada papan informasi yang disematkan.
    *   **Cara Penggunaan:** Ketik `/project target tech:Bootstrap 5.3, Fullstack` atau teknologi lain yang relevan.
*   **`/project finish`**
    *   **Kegunaan:** Mengaktifkan protokol penghancuran *channel* otomatis. Sistem akan mengekstrak seluruh metadata proyek dan riwayat komunikasi ke dalam format **.txt Raw System Log** bergaya *Cyberpunk*, mengirimkannya ke *channel* arsip yang ditentukan, lalu menghapus *channel* proyek.
    *   **Cara Penggunaan:** Cukup ketik `/project finish` di *channel* proyek yang ingin diarsipkan.

### 🆔 2. Cyber-Identity & Gamification
Meningkatkan keterlibatan anggota tim melalui sistem *leveling* visual dan pencapaian yang menarik.
*   **`/rank [target]`**
    *   **Kegunaan:** Menampilkan kartu profil digital anggota (SYSADMIN/ROOT) dengan bar progres XP bergaya HUD *sci-fi*. Anda dapat melihat profil Anda sendiri atau profil anggota lain.
    *   **Cara Penggunaan:** Ketik `/rank` untuk melihat profil Anda, atau `/rank target:@nama-user` untuk melihat profil orang lain.
*   **Sistem EXP & Leveling:** Anggota tim mendapatkan EXP dengan berinteraksi di server (misalnya, mengirim pesan). Semakin banyak EXP, semakin tinggi level mereka.
*   **Achievement Tracker:** Sistem pencapaian dengan 4 tingkatan (Bronze, Silver, Gold, Red/Eternal) yang diberikan berdasarkan aktivitas:
    *   **Pengiriman Pesan:** Jumlah pesan yang dikirim.
    *   **Reaksi:** Jumlah reaksi yang diberikan pada pesan.
    *   **Durasi di *Voice Channel*:** Total waktu yang dihabiskan di *voice channel*.
*   **Wall of Fame:** Notifikasi otomatis akan dikirimkan ke *channel* khusus setiap kali anggota tim berhasil meraih pencapaian baru.

### 🛡️ 3. Security & Sudo Protocols
Pengawasan server tingkat tinggi dan alat administratif untuk menjaga integritas ekosistem dan memfasilitasi manajemen.
*   **The Eye (Logging):** Sistem pemantauan *real-time* terhadap pesan yang dihapus, diedit, serta perubahan peran/nama panggilan anggota, memastikan transparansi dan akuntabilitas.
*   **Admin Commands:**
    *   **`/mute` (Timeout) & `/ban`:** Perintah moderasi standar dengan sistem manajemen durasi yang presisi untuk menjaga ketertiban.
    *   **`/sweep <jumlah> [user] [channel]`**
        *   **Kegunaan:** Protokol pembersihan pesan massal. Dapat menghapus hingga 100 pesan, dengan opsi filter berdasarkan pengguna spesifik atau di *channel* tertentu. Membutuhkan izin `Manage Messages`.
        *   **Cara Penggunaan:** Ketik `/sweep jumlah:50` untuk menghapus 50 pesan terakhir. Atau `/sweep jumlah:20 user:@nama-user` untuk menghapus 20 pesan terakhir dari pengguna tersebut.
    *   **`/give <target> <code>`**
        *   **Kegunaan:** (Hanya untuk Developer/Administrator) Protokol injeksi poin dan *achievement* ke operator. Digunakan untuk tujuan administratif, pengujian, atau memberikan penghargaan secara manual.
        *   **Cara Penggunaan:** Ketik `/give target:@nama-user code:bz_msg_50` untuk memberikan poin yang setara dengan *achievement* "Syntax Learner" kepada pengguna.

### 🎙️ 4. Voice Core
Memfasilitasi komunikasi suara yang lancar dan integrasi bot ke dalam ruang koordinasi.
*   **Dynamic Channels:** Pembuatan *room* suara otomatis saat anggota masuk ke *generator channel* yang telah ditentukan, menciptakan ruang diskusi instan.
*   **KERNEL Integration:**
    *   **`/join`**
        *   **Kegunaan:** Memerintahkan bot KERNEL untuk bergabung ke *voice channel* tempat Anda berada.
        *   **Cara Penggunaan:** Masuk ke *voice channel*, lalu ketik `/join`.
    *   **`/leave`**
        *   **Kegunaan:** Memerintahkan bot KERNEL untuk memutuskan koneksi dan keluar dari *voice channel* saat ini.
        *   **Cara Penggunaan:** Ketik `/leave`.

### 😴 5. AFK Protocol
Sistem untuk mengelola dan menampilkan status *Away From Keyboard* (AFK) anggota tim.
*   **`/afk set [alasan]`**
    *   **Kegunaan:** Menetapkan status AFK Anda dengan alasan opsional dan menampilkan *embed* yang mengindikasikan ketidakhadiran Anda.
    *   **Cara Penggunaan:** Ketik `/afk set alasan:Sedang makan siang` atau cukup `/afk set`.
*   **`/afk return`**
    *   **Kegunaan:** Mencabut status AFK Anda dan menampilkan *embed* yang menunjukkan berapa lama Anda tidak aktif.
    *   **Cara Penggunaan:** Ketik `/afk return`.

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
