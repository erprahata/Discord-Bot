const { AttachmentBuilder } = require('discord.js'); // Dihapus: EmbedBuilder
const fs = require('fs');
const path = require('path');
const Canvas = require('canvas'); // Mesin Pelukis RHT Labs

// ==========================================
// DAFTAR ACHIEVEMENT (KLASIFIKASI KERNEL)
// ==========================================
const KERNEL_ACHIEVEMENTS = [
    // --- TIER 1: BRONZE (#cd7f32) ---
    { id: 'bz_msg_1', name: 'Hello World!', desc: 'Inisiasi berhasil. Mengirim pesan pertama di server.', tier: 'Bronze', type: 'messages', target: 1 },
    { id: 'bz_msg_50', name: 'Syntax Learner', desc: 'Mulai terbiasa dengan matriks. Mengirim 50 pesan.', tier: 'Bronze', type: 'messages', target: 50 },
    { id: 'bz_msg_100', name: 'Casual Typer', desc: 'Telah terverifikasi aktif. Mengirim total 100 pesan.', tier: 'Bronze', type: 'messages', target: 100 },
    { id: 'bz_react_1', name: 'One Shot Precision', desc: 'Tepat sasaran. Memberikan reaksi pertama pada pesan.', tier: 'Bronze', type: 'reactions', target: 1 },
    { id: 'bz_react_10', name: 'Data Link', desc: 'Membangun koneksi empati. Memberikan 10 reaksi.', tier: 'Bronze', type: 'reactions', target: 10 },
    { id: 'bz_voice_10', name: 'Localhost Ping', desc: 'Uji coba frekuensi. Terhubung di Voice Channel selama 10 menit.', tier: 'Bronze', type: 'voiceMinutes', target: 10 },
    { id: 'bz_voice_60', name: 'Standby Mode', desc: 'Menetap di frekuensi. Menghabiskan 60 menit di Voice Channel.', tier: 'Bronze', type: 'voiceMinutes', target: 60 },

    // --- TIER 2: SILVER (#c0c0c0) ---
    { id: 'sv_msg_500', name: 'Active Contributor', desc: 'Kontributor data tingkat menengah. Mengirim total 500 pesan.', tier: 'Silver', type: 'messages', target: 500 },
    { id: 'sv_react_50', name: 'Vibe Checker', desc: 'Ahli membaca situasi. Memberikan total 50 reaksi.', tier: 'Silver', type: 'reactions', target: 50 },
    { id: 'sv_voice_180', name: 'Stay A While and Listen', desc: 'Menghabiskan 180 menit di Voice Channel.', tier: 'Silver', type: 'voiceMinutes', target: 180 },

    // --- TIER 3: GOLD (#ffd700) ---
    { id: 'gd_msg_1000', name: 'Matrix Architect', desc: 'Membangun arsitektur komunikasi. Mengirim 1000 pesan.', tier: 'Gold', type: 'messages', target: 1000 },
    { id: 'gd_voice_600', name: 'The Frequency', desc: 'Menyatu dengan sinyal. Menghabiskan 600 menit (10 jam) di Voice Channel.', tier: 'Gold', type: 'voiceMinutes', target: 600 },

    // --- TIER 4: RED / ETERNAL (#ff0000) ---
    { id: 'rd_msg_5000', name: 'Kernel Sync (Eternal)', desc: 'Sinkronisasi absolut dengan inti KERNEL. Mengirim 5000 pesan.', tier: 'Red', type: 'messages', target: 5000 },
    { id: 'rd_voice_1440', name: 'The Ghost Protocol', desc: 'Bayangan abadi di dalam server. Menghabiskan 1440 menit (24 jam) di Voice.', tier: 'Red', type: 'voiceMinutes', target: 1440 }
];
// (Catatan: Parameter iconUrl dan color sudah saya hapus karena sekarang kita murni pakai gambar dari folder assets)

// ==========================================
// MESIN PENCETAK KARTU (CANVAS ENGINE)
// ==========================================
async function generateCard(user, achievement) {
    // 1. Buat Kanvas (Sesuai resolusi background rhtlabs)
    const canvas = Canvas.createCanvas(900, 250);
    const ctx = canvas.getContext('2d');

    // 2. Tempel Background
    let bgTier = achievement.tier.toLowerCase();
    if (bgTier === 'red') bgTier = 'eternal'; 
    
    const bgPath = path.join(__dirname, `../../assets/backgrounds/bg_${bgTier}.png`);
    const background = await Canvas.loadImage(bgPath);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // 3. Tempel Emblem
    const emblemPath = path.join(__dirname, `../../assets/emblems/${achievement.id}.png`);
    if (fs.existsSync(emblemPath)) {
        const emblem = await Canvas.loadImage(emblemPath);
        ctx.drawImage(emblem, 45, 25, 200, 200); 
    } else {
        console.log(`[WARNING] Emblem tidak ditemukan di: ${emblemPath}`);
    }

    // 4. Injeksi Teks Dinamis
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#f39c12'; 
    ctx.fillText('ACHIEVEMENT UNLOCKED!', 280, 75);

    ctx.font = 'bold 45px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(achievement.name, 280, 125);

    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#b2bec3';
    ctx.fillText(achievement.desc, 280, 165);

    ctx.font = 'italic 20px sans-serif';
    ctx.fillStyle = '#636e72';
    ctx.fillText(`Operator: @${user.username}`, 280, 215);

    return new AttachmentBuilder(canvas.toBuffer(), { name: `achievement-${achievement.id}.png` });
}

// ==========================================
// FUNGSI PENGECEKAN & UNLOCK
// ==========================================
async function checkAchievements(userId, client, db) {
    const userData = db[userId];
    if (!userData) return false;

    if (!userData.unlockedAchievements) userData.unlockedAchievements = [];
    let dbUpdated = false;

    // Tarik data objek user dari Discord API untuk mendapatkan nama asli di gambar
    const discordUser = await client.users.fetch(userId).catch(() => null);
    if (!discordUser) return false;

    for (const ach of KERNEL_ACHIEVEMENTS) {
        if (!userData.unlockedAchievements.includes(ach.id)) {
            
            let isUnlocked = false;
            if (ach.type === 'messages' && userData.messageCount >= ach.target) isUnlocked = true;
            if (ach.type === 'reactions' && userData.reactionCount >= ach.target) isUnlocked = true;
            if (ach.type === 'voiceMinutes' && userData.voiceMinutes >= ach.target) isUnlocked = true;

            if (isUnlocked) {
                userData.unlockedAchievements.push(ach.id);
                dbUpdated = true;

                const achieveChannel = client.channels.cache.get(client.config.chAchievements);
                if (!achieveChannel) continue;

                try {
                    // Eksekusi Mesin Canvas
                    const achievementCard = await generateCard(discordUser, ach);

                    // Kirim sebagai file gambar utuh, BUKAN embed
                    await achieveChannel.send({ 
                        content: `Tingkat sinkronisasi meningkat! Selamat <@${userId}>.`,
                        files: [achievementCard] 
                    });
                } catch (error) {
                    console.error("Gagal mencetak kartu Canvas:", error);
                }
            }
        }
    }

    return dbUpdated; 
}

module.exports = { KERNEL_ACHIEVEMENTS, checkAchievements };